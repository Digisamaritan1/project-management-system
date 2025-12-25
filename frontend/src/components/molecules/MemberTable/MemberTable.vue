<template>
    <div class="currencies_wrapper overflow-y-auto  style-scroll">
        <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        <div class="manufacture_create_content currencies_table border_active" :class="[{'pointer-event-none':isSpinner == true}]">
            <table class="memebertableClass"  v-if="(activeTab === 0 ? filteredList : filteredRemovedList).length">
                <thead>
                    <tr class="border-0 bg-colorlightgray">
                        <th class="th__name">{{ $t('Members.name') }}</th>
                        <th>{{ $t('Auth.email') }}</th>
                        <th>{{ $t('Header.designation') }}</th>
                        <th>{{ $t('Members.role') }}</th>
                        <th>{{$t('Members.last_active')}}</th>
                        <th v-if="activeTab === 0">{{ $t('Projects.status') }}</th>
                        <th>{{ $t('Members.time_tracker') }}</th>
                        <th class="th__settings">{{$t('Members.settings')}}</th>
                        </tr>
                </thead>
                <tbody>
                    <MemberRowCompo
                        v-for="(item, itemIndex) in activeTab === 0 ? filteredList : filteredRemovedList"
                        :key="'item'+itemIndex"
                        :item="item" 
                        :itemIndex="itemIndex"
                        :userData="activeTab === 0 ? filteredList : filteredRemovedList"
                        :activeTab="activeTab"
                        :page="page"
                        :timeTrackerAppPermission="curentCompany?.planFeature?.timeTrackingProjectApp"
                        @removeUser="(item) => removeCompanyUser(item)"
                        @removeRequest="(item,req) => cancelInvitation(item,req)"
                        @removePermenet="(item,req) => requestRemoveFunction(item)"
                        @inviteUser="(email,type,designation,flag,isFromRemove) => $emit('inviteUserParent',email,type,designation,flag,isFromRemove)"
                        @changerole="(item,id) => changeRole(item,id)"
                        @changeDesignation="(item,id,name) => changeDesignation(item,id,name)"
                        @manageTimeTrackingPermission="(item)=> manageTtPermission(item)"
                    />
                </tbody>
            </table>
            <div class="errorWrapper" v-else>
                <img src="@/assets/images/svg/No-Search-Result.svg" alt="aliansoftware"/>
                <div class="error-text">
                    <h2>{{$t('Filters.no_data_found')}}</h2>
                </div>
            </div>
            <UpdateMemeberSubscription v-if="isUpdateShow" @spinnerValue="(val) => isSpinner = val" :userData="removeUserSubscriptionData"  @hideModel="() => isUpdateShow = false" @closeModel="() => isUpdateShow = false" :isRemove="true" @executeFurther="excuteProcess($event)"/>
        </div>
    </div>
</template>

<script setup>
    import { defineProps, ref, watch, inject, computed } from "vue";
    import MemberRowCompo from "@/components/atom/MemberRowCompo/MemberRowCompo.vue";
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import { apiRequestWithoutCompnay } from '@/services';
    // <!-- Start Remove Section Payment -->
    // import UpdateMemeberSubscription from '@/views/Settings/Members/UpdateMemeberSubscription'
    import * as env from '@/config/env';
    import { useToast } from 'vue-toast-notification';
    import Swal from 'sweetalert2';
    import { useStore } from 'vuex';
    import { apiRequest } from '../../../services';
    import { useI18n } from "vue-i18n";

    const $toast = useToast();
    const {t} = useI18n();
    const  companyId = inject('$companyId');
    const userId = inject("$userId");
    const isUpdateShow = ref(false);
    const { getters,commit } = useStore();
    const removeUserSubscriptionData = ref({});
    const isSpinner = ref(false);
    const props = defineProps({
        filteredList: {
            type: Array,
        },
        filteredRemovedList: {
            type: Array,
        },
        activeTab: {
            type: Number,
        },
        perPage: {
            type: Number,
        },
        page: {
            type: Number,
        },
        listingArray: {
            type: Array,
        }
    })
    const emit = defineEmits(["pageClick","arrayCheck", "inviteUserParent", "manageTimeTrackingPermission"]);

    const page = ref(props.page);
    const listingArray = ref(props.listingArray);

    watch(() => props.listingArray, (newVal) => {
        listingArray.value = newVal;
    });
    const designations = computed(() => {
        return getters['settings/designations'];
    });
    const rolesGetter = computed(() => {
        return getters['settings/roles'];
    });

    const curentCompany = computed(() => getters['settings/selectedCompany']);

    const removeCompanyUser = (item) => {
        isUpdateShow.value = true;
        removeUserSubscriptionData.value = {type: 'remove', data: item};
        // removeUser();
        removeUserProcess(item);
    }

    const removeUserProcess = async (item) => {
        try {
            const params = {
                id: item.requestId,
                data: {
                    isDelete: true,
                    isTrackerUser: false
                }
            }
            await apiRequest("put", `${env.API_MEMBERS}`, params).then((response) => {
                if (response.data.status) {
                    if (response.data.data) {
                        commit("settings/mutateCompanyUsers", {
                            data: {...response.data.data, _id: response.data.data._id,isCurrentUser: response.data.data.userId === userId.value,requestId: response.data.data._id},
                            op: "modified",
                        })
                    }
                    const updateObject = { 
                        $pull: { AssignCompany: companyId.value }
                    }
                    apiRequestWithoutCompnay("put",env.USER_UPATE,{
                        userId: item.userId,
                        updateObject : updateObject,
                        newObj: {returnDocument : 'after'}
                    }).then((resp)=>{
                        const result = resp.data.data;
                        commit("settings/mutateUsers", {data: result, op: "modified"});
                        const axiosObj = {
                            updateObject: {'companyData.$[elementIndex].users': -1},
                            key: '$inc',
                            arrayFilters: [{ 'elementIndex.users': { $exists: true } }]
                        }
                        // Update data in "USERS" collection
                        // Update data in "COMPANIES" collection
                        apiRequest("put",`${env.COMPANYACTIONS}`,axiosObj).then(() => {
                            let axiosData = {
                                companyId : companyId.value,
                                userId : item.userId,
                            }
                            if(item.isTrackerUser !== undefined && item.isTrackerUser == true) {
                                apiRequest("put",`${env.COMPANYACTIONS}`,{updateObject: {'trackerUsers': -1},key: '$inc'}).catch((err)=>console.error(err));
                            }
                            apiRequest("post", env.REMOVE_USER_NOTIFICATION, axiosData).catch((error) => {
                                console.error(error,"ERROR");
                            })
                            emit('arrayCheck');
                            $toast.success(t("Toast.User_removed_successfully"), {position: 'top-right'});
                        })
                    })
                }
            }).catch((error) => {
                console.error(`Error in removeUserProcess hook => ${error}`);
            })
        } catch (error) {
            console.error(`Error - remove company user => ${error.message}`);
        }
    }

    const cancelInvitation = (data, isRequest) => {
        isUpdateShow.value = true;
        removeUserSubscriptionData.value = {type: 'cancel', data: data, isRequest: isRequest};
        // deleteDoc();
        deleteDoc(data,isRequest);
    }

    const deleteDoc = async (data, isRequest) => {
        try {
            const params = {
                id: data.requestId,
                data: {
                    status: 3,
                    isDelete: true
                }
            }
            await apiRequest("put", `${env.API_MEMBERS}`, params).then((response) => {
                if (response.data.status) {
                    if (response.data.data) {
                        commit("settings/mutateCompanyUsers", {
                            data: {...response.data.data, _id: response.data.data._id,isCurrentUser: response.data.data.userId === userId.value,requestId: response.data.data._id},
                            op: "modified",
                        })
                    }
                    listingArray.value = listingArray.value.filter((x) => x.requestId !== data.requestId);
                    emit('arrayCheck',listingArray.value);
                    if(isRequest === false) {

                        //Updating company trackeruser count -- START
                        if(removeUserSubscriptionData.value.data.isTrackerUser !== undefined && removeUserSubscriptionData.value.data.isTrackerUser == true) {
                            apiRequest("put",`${env.COMPANYACTIONS}`,{updateObject: {'trackerUsers': -1},key: '$inc'})
                            .then(()=>{
                                listingArray.value = listingArray.value.map((x) => {
                                    if(x._id === removeUserSubscriptionData.value.data._id) {
                                        x.isTrackerUser = false;
                                    }
                                    return x;
                                })
                                emit('arrayCheck',listingArray.value);
                            }).catch((err)=>console.error(err));
                        }
                        // Updating company trackeruser count -- END

                        const axiosObj = {
                            updateObject: {'companyData.$[elementIndex].users': -1},
                            key: '$inc',
                            arrayFilters: [{ 'elementIndex.users': { $exists: true } }]
                        }
                        // Update data in "COMPANIES" collection
                        apiRequest("put",`${env.COMPANYACTIONS}`,axiosObj).catch((eroor) => {
                            console.error(eroor,"ERROR S");
                        });
                    }
                    $toast.success(t("Toast.Invitation_cancelled_successfully"),{position: 'top-right'});
                }
            })
        } catch (error) {
            console.error(`Error - cancel invitation => ${error.message}`);
        }
    }

    const changeRole = (roleKey, requestId) => {
        if(props.listingArray && props.listingArray.length) {
            let index = props.listingArray.findIndex((x) => x.requestId === requestId);
            if(index > -1 && props.listingArray[index].roleType === roleKey) {
                return;
            }

            Swal.fire({
                title: t(`conformationmsg.are_you_sure`),
                text: `${t('Members.confirm_change_user_role')} "${rolesGetter.value.filter((x) => x.key === roleKey)[0].name}" ?`,
                showCancelButton: true,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then(async (result)=>{
                if (result.value) {
                    const params = {
                        id: requestId,
                        data: {
                            roleType: roleKey
                        }
                    }
                    await apiRequest("put", `${env.API_MEMBERS}`, params).then((response) => {
                        if (response.data.status) {
                            if (response.data.data) {
                                commit("settings/mutateCompanyUsers", {
                                    data: {...response.data.data, _id: response.data.data._id,isCurrentUser: response.data.data.userId === userId.value,requestId: response.data.data._id},
                                    op: "modified",
                                })
                            }
                            $toast.success(t("Toast.User_role_changed_successfully"), { position: 'top-right' });
                            listingArray.value = listingArray.value.map((x) => {
                                if (x.requestId === requestId) {
                                    x.roleType = roleKey;
                                }
                                return x;
                            })
                            emit('arrayCheck', listingArray.value);
                        }
                    })
                }
            })
        }
    }

    const changeDesignation = (desKey, requestId,designationName = '') => {
        if(props.listingArray && props.listingArray.length) {
            let index = props.listingArray.findIndex((x) => x.requestId === requestId);
            if(index > -1 && props.listingArray[index].designation === desKey) {
                return;
            }

            Swal.fire({
                title: t(`conformationmsg.are_you_sure`),
                text: `${t('Members.confirm_change_user_designation')} "${designationName === '' ? designations.value.filter((x) => x.key === desKey)[0].name: designationName}"?`,
                showCancelButton: true,
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: t('Home.no'),
                confirmButtonText: t('Home.yes'),
            }).then(async(result)=>{
                if (result.value) {
                    const params = {
                        id: requestId,
                        data: {
                            designation: desKey
                        }
                    }
                    await apiRequest("put", `${env.API_MEMBERS}`, params).then((response) => {
                        if (response.data.status) {
                            if (response.data.data) {
                                commit("settings/mutateCompanyUsers", {
                                    data: {...response.data.data, _id: response.data.data._id,isCurrentUser: response.data.data.userId === userId.value,requestId: response.data.data._id},
                                    op: "modified",
                                })
                            }
                            $toast.success(t("Toast.User_designation_changed_successfully"), { position: 'top-right' });
                            listingArray.value = listingArray.value.map((x) => {
                                if (x.requestId === requestId) {
                                    x.designation = desKey;
                                }
                                return x;
                            })
                            emit('arrayCheck', listingArray.value);
                        }
                    })
                }
            })
        }
    }

    
    function excuteProcess(removeObj) {
        if (removeObj.type == 'cancel') {
            deleteDoc(removeObj.data, removeObj.isRequest)
        } else {
            removeUserProcess(removeObj.data)
        }
    }
    const manageTtPermission = async (dataObj) => {
        isSpinner.value = true;
        const { planFeature, trackerUsers } = curentCompany.value;
        if(planFeature.timeTrackingProjectApp === undefined || (planFeature.timeTrackingProjectApp !== undefined && planFeature.timeTrackingProjectApp == false)) {
            $toast.error(t("Toast.Please_upgrade_your_plan_to_use_Time_Tracker"),{position: 'top-right'});
            isSpinner.value = false;
        } else {
            if(dataObj.ops == false) {
                await updateTrackerUsersAndUser(dataObj, companyId.value);
            } else {
                if (trackerUsers === undefined || planFeature.timeTrackerUser === null || (typeof planFeature.timeTrackerUser === 'number' && planFeature.timeTrackerUser > 0 && planFeature.timeTrackerUser > trackerUsers)) {
                    await updateTrackerUsersAndUser(dataObj, companyId.value);
                } else {
                    if(typeof planFeature.timeTrackerUser == 'number' && planFeature.timeTrackerUser == 0) {
                        //When in plan feature timeTrackeruser is 0.
                        $toast.error(t("Toast.Please_upgrade_your_plan_to_use_Time_Tracker"),{position: 'top-right'});
                        isSpinner.value = false;
                    } else {
                        //When tracker user limit crosssed
                        $toast.error(t("Toast.Please_upgrade_your_plan_to_use_Time_Tracker"),{position: 'top-right'});
                        isSpinner.value = false;
                    }
                }
            }
        }
    };

    const updateTrackerUsersAndUser = async (dataObj, companyId) => {
        try {
            apiRequest("post", env.TRACKER_USER_PERMISSION_MANAGEMENT, {
                CompanyId: companyId,
                DataObj: dataObj
            })
            .then((resp) => {
                if(resp.data.status) {
                    listingArray.value = listingArray.value.map((x) => {
                        if(x[dataObj.data.status === 2 ? 'userId' : '_id'] === dataObj.data[dataObj.data.status === 2 ? 'userId' : '_id']) {
                            x.isTrackerUser = !x.isTrackerUser;
                        }
                        return x;
                    })
                    emit('arrayCheck',listingArray.value);
                    $toast.success(t(`Toast.${resp.data.message}`),{position: 'top-right'});
                    isSpinner.value = false;
                } else {
                    isSpinner.value = false;
                    $toast.error(resp.data.message,{position: 'top-right'});
                }
            })
            .catch((err)=>{
                console.error(err);
                $toast.error(err.message,{position: 'top-right'});
                isSpinner.value = false;
            })
        } catch (error) {
            console.error('ERROR IN updateTrackerUsersAndUser.',error);
            isSpinner.value = false;
        }
    };

    const requestRemoveFunction = async (data) => {
        try {
            const params = {
                id: data.requestId,
                data: {
                    status: 3
                }
            }
            await apiRequest("put", `${env.API_MEMBERS}`, params).then((response) => {
                if (response.data.status) {
                    if (response.data.data) {
                        commit("settings/mutateCompanyUsers", {
                            data: {...response.data.data, _id: response.data.data._id,isCurrentUser: response.data.data.userId === userId.value,requestId: response.data.data._id},
                            op: "modified",
                        })
                    }
                    $toast.success(t("Toast.Request_remove_successfully"), { position: 'top-right' });
                    listingArray.value = listingArray.value.filter((x) => x.requestId !== data.requestId);
                    emit('arrayCheck', listingArray.value);
                }
            })
        } catch (error) {
            console.error(error);
        }
    }
</script>

<style src="./style.css">
</style>