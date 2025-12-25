<template>
    <tr :style="itemIndex === userData.length - 1? 'border-radius: 0px 0px 0px 4px ;border-bottom-left-radius: 4px  !important; border-bottom-right-radius: 4px  !important;' : ' ' ">
        <td :style="itemIndex === userData.length - 1? 'border-radius: 0px 0px 0px 10px;' : ' ' " :class="item.roleType === 1 ? 'd-flex justify-content-between align-items-center' : ''">
            <div class="nametable d-flex align-items-center">
                <UserProfile
                    v-if="userData[itemIndex].Employee_profileImageURL !== undefined && userData[itemIndex].Employee_profileImageURL !== ''"
                    :showDot="false"
                    class="timesheet_user_profile p-0 mr-10px ml-0"
                    :data="{
                        id: userData[itemIndex]?.id,
                        title: userData[itemIndex]?.Employee_Name,
                        image: userData[itemIndex]?.Employee_profileImageURL
                    }"
                    width="30px"
                    :thumbnail="'30x30'"
                />
                <span class="no-img-span d-flex align-items-center" v-else>{{item.userEmail.charAt(0)}}</span>
                <span class="employeename">{{userData[itemIndex].Employee_Name || "N/A"}}</span> 
            </div>
            <div v-if="item.roleType === 1" class="span_owner">
                <span class="span_owner-role">{{ item.roleType === 1 ? $t('Watcher.owner') : ''}} </span>
            </div>
        </td>
        <td>
            <span>{{userData[itemIndex].userEmail || "N/A"}}</span>
        </td>
        <td>
            <span v-if="checkPermission('settings.settings_designation') !== true">{{item.roleType === 1 ? $t('Watcher.owner') : designations && designations.filter((x) => x.key === item.designation).length ? designations.filter((x) => x.key === item.designation)[0].name : "N/A"}}</span>
            <div v-else>
                <DropDown :id="designationUniqueId" v-if="designations.length > 0">
                    <template #button>
                        <div class="d-flex">
                            <div :ref="designationUniqueId">{{designations.filter((x) => x.key === item.designation).length && designations.filter((x) => x.key === item.designation)[0].name || (item.roleType === 1 ? $t('Watcher.owner') : 'N/A')}}</div>
                            <img :src="arrowIcon" alt="arrowIcon" class="arrowIcon">
                        </div>
                    </template>
                    <template #options>
                        <DropDownOption
                            v-for="(des, ind) in item.roleType === 1 && item.designation !== 0 ? addOwner() : designations.map((x) => ({...x,label: x.name}))"
                            :key="'rolesTable'+ind"
                            @click="$refs[designationUniqueId].click(),$emit('changeDesignation',des.key,item.requestId,item.roleType === 1 && item.designation !== 0 ? $t('Watcher.owner') : '')"
                        >
                            <div>
                                <span>{{ des.label }}</span>
                            </div>
                        </DropDownOption>
                    </template>
                </DropDown>
                <div v-else>{{$t('Watcher.owner')}}</div>
            </div>
        </td>
        <td>
            <span v-if="checkPermission('settings.settings_role_management') !== true">{{roles.filter((x) => x.key === item.roleType).length && roles.filter((x) => x.key === item.roleType)[0].name || "N/A"}}</span>
            <div v-else>
                <DropDown :id="roleUbiqId" v-if="roles.length > 0 && userData[itemIndex].roleType !== 1 && userData[itemIndex].roleType !== 0">
                    <template #button>
                        <div class="d-flex">
                            <div :ref="roleUbiqId">{{roles.filter((x) => x.key === item.roleType).length && roles.filter((x) => x.key === item.roleType)[0].name || "N/A"}}</div>
                            <img :src="arrowIcon" alt="arrowIcon" class="arrowIcon">
                        </div>
                    </template>
                    <template #options>
                        <DropDownOption
                            v-for="(roleobj, ind) in withoutOwnerRoles.map((x) => ({...x,label: x.name})).filter((x) => x.key !== 0)"
                            :key="'rolesTable'+ind"
                            @click="$refs[roleUbiqId].click(),$emit('changerole', roleobj.key, item.requestId)"
                        >
                            <div>
                                <span>{{ roleobj.label }}</span>
                            </div>
                        </DropDownOption>
                    </template>
                </DropDown>
                <div v-else>{{roles.filter((x) => x.key === item.roleType).length && roles.filter((x) => x.key === item.roleType)[0].name || "N/A"}}</div>
            </div>
        </td>
        <td>
            <span class="lastactive_status" v-if="item.lastActive !== null && item.lastActive !== undefined">{{getDifference(new Date(item.lastActive) * 1000)}}</span>
            <span class="lastactive_status" v-else>N/A</span>
        </td>
        <td v-if="activeTab === 0">
            <span>{{companyUserStatus.filter((x) => x.key === item.status)[0]?.name}}</span>
        </td>
        <td>
            <span v-if="activeTab === 0 && timeTrackerAppPermission == true">
                <Toggle :model-value="rowData.isTrackerUser" @click="$emit('manageTimeTrackingPermission', {data:item,ops:!rowData.isTrackerUser})"/>
            </span>
        </td>
        <td v-if="item.roleType !== 1" :style="itemIndex === userData.length - 1? 'border-radius: 0px 0px 4px  0px;' : ' ' ">
            <DropDown :bodyClass="{'members-remove-dropdown' : true}">
                <template #button>
                    <img ref="setting" :src="dots" alt="dots" class="ml-20px">
                </template>
                <template #options>
                    <template v-if="item.status === 2">
                        <DropDownOption @click="$refs.setting.click(),$emit('removeUser', item)" v-if="activeTab === 0">
                            <div class="d-flex align-items-center">
                                {{$t('Members.removeuser')}}
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs.setting.click(),$emit('inviteUser', item.userEmail, item.roleType, item.designation || '',true,true)" v-if="activeTab === 1">
                            <div class="d-flex align-items-center">
                                {{ $t('Members.invite_user') }}
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs.setting.click(),$emit('removePermenet', item)" v-if="activeTab === 1">
                            <div class="d-flex align-items-center">
                                {{ $t('Members.remove_request') }}
                            </div>
                        </DropDownOption>
                    </template>
                    <template v-else>
                        <DropDownOption @click="$refs.setting.click(),$emit('inviteUser',item.userEmail, item.roleType, item.designation || '', true,false)">
                            <div class="d-flex align-items-center">
                                {{ $t('Members.resend_invitation') }}
                            </div>
                        </DropDownOption>
                        <DropDownOption @click="$refs.setting.click(),$emit('removeRequest', item, false)">
                            <div class="d-flex align-items-center">
                                {{ $t('Members.cancel_invitation') }}
                            </div>
                        </DropDownOption>
                    </template>
                </template>
            </DropDown>
        </td>
        <td v-else :style="itemIndex === userData.length - 1? 'border-radius: 0px 0px 4px  0px;' : ' ' ">
            <span></span>
        </td>
    </tr>
</template>
<script setup>
    import moment from 'moment';
    import { computed, ref, watch } from "vue";
    import { useStore } from 'vuex';
    import { useCustomComposable } from '@/composable';
    import DropDown from '@/components/molecules/DropDown/DropDown.vue'
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
    import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
    import Toggle from '../Toggle/Toggle.vue';
    import { useI18n } from "vue-i18n";
    const {t} = useI18n();
    const arrowIcon=require('@/assets/images/dd-full-arrow.png');
    const dots=require('@/assets/images/svg/three_black_dots.svg')
    const props = defineProps({
        item: {
            type: Object,
        },
        itemIndex: {
            type: Number,
        },
        userData: {
            type: Array,
        },
        activeTab: {
            type: Number,
        },
        page: {
            type: Number,
        },
        timeTrackerAppPermission: {
            type: Boolean,
            default: false,
        }
    })
    defineEmits(["removeUser","removeRequest", "changerole", "inviteUser","changeDesignation", "manageTimeTrackingPermission"]);
    const { getters } = useStore();
    const { makeUniqueId, checkPermission } = useCustomComposable();


    const roleUbiqId = `rolesTable${makeUniqueId(6)}`;
    const designationUniqueId = `designation${makeUniqueId(6)}`
    const designations = computed(() => {
        return getters['settings/designations'].filter((x) => x.key !== 0 && !x.isDelete);
    });
    const roles = computed(() => {
        return getters['settings/roles']
    });
    const companyUserStatus = computed(() => {
        return getters['settings/companyUserStatus'];
    });
    const withoutOwnerRoles = computed(() => {
        return getters['settings/withoutOwnerRoles'].filter((x) => !x.isDelete);
    });

    const rowData = ref(props.item)

    watch(() => props.item, (newV) => {
        rowData.value = newV;
    })
    const getDifference = (date) => {
        const now = moment();
        const past = moment(date);

        // Check if the past date is valid
        if (!past.isValid()) {
            return "Invalid date";
        }

        // Calculate difference in minutes
        let value = now.diff(past, 'minutes');
        if (value < 1) {
            return "Now";
        } else if (value < 60) {
            return `${value} ${value > 1 ? "minutes" : "minute"} ago`;
        }

        // Calculate difference in hours
        value = now.diff(past, 'hours');
        if (value < 24) {
            return `${value} ${value > 1 ? "hours" : "hour"} ago`;
        }

        // Calculate difference in days
        value = now.diff(past, 'days');
        if (value < 30) {
            return `${value} ${value > 1 ? "days" : "day"} ago`;
        }

        // Calculate difference in months
        value = now.diff(past, 'months');
        return `${value} ${value > 1 ? "months" : "month"} ago`;
    };

    function addOwner() {
        return [{ key: 0, name: t('Watcher.owner') }, ...designations.value].map((x) => ({ ...x, label: x.name }));
    }
</script>
<style src="./style.css">
</style>