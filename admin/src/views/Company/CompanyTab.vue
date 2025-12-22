<template>
    <div class="companytab_wrapper position-re">
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="company-section">
            <div>
                <div class="d-flex align-items-center justify-content-between table_search">
                    <div class="form-group">
                        <input type="text" class="customfield__form-control" placeholder="Search" v-model="search" @input="handleSearch">
                    </div>
                    <button class="company_button" @click="createCompany()">+ Add New Company</button>
                </div>
                <template v-if="companies && companies.length">
                    <div v-if="companies && companies.length" class="custom-field__table-wrapper">
                        <div class="company-table style-scroll w-full">
                            <table border>
                                <thead>
                                    <tr>
                                        <th class="">Company Name</th>
                                        <th class="">Owner Name</th>
                                        <th class="">Total No. of User</th>
                                        <th class="">Phone No.</th>
                                        <th class="">Next Renew Date</th>
                                        <th class="">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in companies" :key="index" :class="[{'disable':!item.isDelete}]">
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div>
                                                    <img v-if="item.Cst_profileImage?.includes('http')" :src="item.Cst_profileImage || defaultUserIcon" alt="company_image" class="profile-image mr-10-px">
                                                    <WasabiIamgeCompp v-else-if="item.Cst_profileImage" :companyId="item?._id" :data="{url:item.Cst_profileImage}" class="profile-image mr-10-px" thumbnail="26x26"/>
                                                    <span v-else class="no-img-span d-flex align-items-center">{{item.Cst_CompanyName.charAt(0)}}</span>
                                                </div>
                                                <span @click="openCompanyDeatil(item)" class="field__title text-capitalize cursor-pointer">{{item?.Cst_CompanyName}}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <WasabiIamgeCompp v-if="item.user_data[0]?.Employee_profileImage" :thumbnail="'25x25'" :userImage="true" :companyId="item?._id" :data="{url:item.user_data[0]?.Employee_profileImage}" class="profile-image"/>
                                                <img v-else :src="default_image" alt="default_image" class="profile-image" />
                                                <span class="pl-8px">{{item.user_data[0]?.Employee_Name}}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span>{{item?.companyData[0]?.users || 0}}</span>
                                        </td>
                                        <td>
                                            <span class="type d-flex">{{item.Cst_Phone}}</span>
                                        </td>
                                        <td>
                                            <span>{{item.subscriptionRenewalDate ? moment(new Date(item.subscriptionRenewalDate * 1000)).format('DD MMM, YYYY') : '-'}}</span>
                                        </td>
                                        <td>
                                            <DropDown :id="uId">
                                                <template #button>
                                                    <img :ref="uId" :src="dots" alt="dots" class="ml-20px">
                                                </template>
                                                <template #options>
                                                    <DropDownOption @click="editCompany(item),$refs[uId][index].click()">
                                                        <div class="d-flex align-items-center justify-content-between">
                                                            <img :src="editIcon" />
                                                            <span class="ml-20-px">Edit</span>
                                                        </div>
                                                    </DropDownOption>
                                                    <DropDownOption @click="disableLogin(item,true),$refs[uId][index].click()" v-if="!item.isDisable">
                                                        <div class="d-flex align-items-center">
                                                            <img :src="loginDisable" />
                                                            <span class="ml-20-px">Login Disable</span>
                                                        </div>
                                                    </DropDownOption>
                                                    <DropDownOption @click="disableLogin(item,false),$refs[uId][index].click()" v-if="item.isDisable">
                                                        <div class="d-flex align-items-center">
                                                            <img :src="loginDisable" />
                                                            <span class="ml-20-px">Login Enable</span>
                                                        </div>
                                                    </DropDownOption>
                                                    <DropDownOption @click="isDelete = true,$refs[uId][index].click(),selectedRow = item " v-if="false">
                                                        <div class="d-flex align-items-center">
                                                            <img :src="deleteIcon" />
                                                            <span class="ml-20-px">Delete</span>
                                                        </div>
                                                    </DropDownOption>
                                                </template>
                                            </DropDown>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="pagination-div">
                        <div>
                            <img v-if="currentPage !== 1" @click="previousPage()" :src="right_arrow" :disabled="currentPage === 1" />
                            <img v-else :src="right_arrow_disable" />
                        </div>
                        <span v-for="page in visiblePages" :key="page" class="p0x-13px d-flex align-items-center">
                            <button @click="goToPage(page)" class="cursor-pointer" :class="{ 'pagination-active-page': page === currentPage ,'pagination-page' : page !== currentPage}">{{ page }}</button>
                        </span>
                        <div>
                            <img v-if="currentPage !== totalPages" @click="nextPage()" :disabled="currentPage === totalPages" :src="left_arrow"/>
                            <img v-else :disabled="currentPage === totalPages" :src="left_arrow_disable"/>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="d-flex justify-content-center align-items-center flex-column no-data-found" v-if="!getSpinner">
                        <img :src="nodataFoundIcon" />
                        <h3>No Data Found</h3>
                    </div>
                    <div v-else>
                        <SpinnerComp :is-spinner="getSpinner" v-if="getSpinner"/>
                    </div>
                </template>
            </div>
        </div>
        <Sidebar
            v-if="isEdit || isAdd"
            width="1000px"
            :top="'0px'"
            :headClass="'add_plan--header'"
        >
            <template #head-left>
                <div class="blue">
                    <span class="font-weight-500">{{`${isEdit ? 'Edit' : 'Add'} Company Details`}}</span>
                </div>
            </template>
            <template #head-right>
                <div>
                    <button class="close_button mr-20px font-size-16 font-weight-500" @click="()=> closeFunction()">Close</button>
                    <button v-if="!saveClick" class="save-button font-size-16 font-weight-500" @click="saveClickFun()">{{isEdit ? 'Edit': 'Add'}}</button>
                    <button v-else class="save-button btn-disabled font-size-16 font-weight-500" disabled>{{isEdit ? 'Edit': 'Add'}}</button>
                </div>
            </template>
            <template #body>
                <CompanyForm :modelValue="companyData" @closeSidebar="isEdit = false,isAdd = false,saveClick = false" :isAdd="isEdit ? false : true" ref="childRef" @onSpinner="(event) => saveClick = event" @updatedData="(event) => updatedData(event)" />
            </template> 
        </Sidebar>
        <Modal
            :modelValue="isDelete"
            acceptButtonText="Confirm"
            cancelButtonText="Cancel"
            :header="true"
            :showCloseIcon="false"
            @accept="handleConfirm"
            @close="isDelete = false"
        >
            <template #header>
                <h5 class="m-0">Confirm</h5>
                </template>
                <template #body>
                <span>Are you sure want to delete?</span>
            </template>
        </Modal>
        <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    </div>
</template>
<script setup>
    import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
    import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    import DropDown from '@/components/molecules/DropDown/DropDown.vue';
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar';
    import CompanyForm from '@/components/molecules/CompanyForm/CompanyForm.vue';
    import Modal from "@/components/atom/Modal/Modal.vue";
    import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue"
    import { computed, inject, onMounted, ref } from 'vue';
    import { useCustomComposable } from "@/composable";
    import { dbCollections } from "@/utils/collections";
    import moment from 'moment';
    import { useToast } from 'vue-toast-notification';
    import * as env from '@/config/env';


    const $toast = useToast();
    import { useRouter } from 'vue-router';
    import { apiRequest, apiRequestWithoutCompnay } from '../../services';
    import { useStore } from 'vuex';
    const {makeUniqueId} = useCustomComposable();
    const router = useRouter()

    const defaultUserIcon = inject("$defaultUserAvatar");
    const dots= require('@/assets/images/svg/three_dots_line.svg');
    const left_arrow = require('@/assets/images/svg/left_arrow.svg');
    const right_arrow_disable = require('@/assets/images/svg/right_arrow_disable.svg');
    const right_arrow = require('@/assets/images/svg/right_arrow.svg');
    const left_arrow_disable = require('@/assets/images/svg/left_arrow_disable.svg');
    const deleteIcon = require('@/assets/images/svg/delete_icon.svg');
    const loginDisable = require('@/assets/images/svg/login_disable.svg');
    const editIcon = require('@/assets/images/svg/edit_icon.svg');
    const nodataFoundIcon = require("@/assets/images/svg/No-Search-Result.svg");

    const breadCrumbArray = [
        {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
        {name: 'Company', routeObj: {name: 'Company'}, isClickable: false},
    ]
    const uId = `company${makeUniqueId(6)}`;
    const search = ref('');
    const saveClick = ref(false); 
    const isEdit = ref(false); 
    const isAdd = ref(false); 
    const companyData = ref({
        companyName : '',
        companyPhone : '',
        companyCountry : '',
        companyState : '',
        companyCity : '',
        compnayDialCode : '',
        companyId : '',
        Cst_stateCode: '',
        Cst_countryCode: '',
    })
    const companies = ref([])
    const batchSize = ref(10);
    const currentPage = ref(1)
    const totalPages = ref(0)
    const maxVisiblePages = ref(5);
    const isDelete = ref(false);
    const isSpinner = ref(false);
    const getSpinner = ref(false);
    const selectedRow = ref({});
    const childRef = ref();
    const default_image = require("@/assets/images/default_user.png");
    const { commit } = useStore();

    onMounted(() => {
        getSpinner.value = true;
        fetchCompanyData();
    })

    const visiblePages = computed(() => {
        const startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages.value / 2));
        const endPage = Math.min(startPage + maxVisiblePages.value - 1, totalPages.value);
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i); 
    })

    function fetchCompanyData () {
        let skips = (currentPage.value - 1) * batchSize.value;
        let query = [
            {
                $match: {
                    $and: [
                        { ...(search.value && {Cst_CompanyName: { $regex: search.value, $options: "i" }}) }
                    ]
                }
            },
            {
                $lookup: {
                    from: dbCollections.USERS,
                    localField: "userId",
                    foreignField: "_id",
                    as: "user_data",
                    pipeline: [
                        {
                            $project: {
                                Employee_profileImage: 1,
                                Employee_Name: 1,
                            },
                        },
                    ],
                }
            },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $sort: { createdAt: -1, _id: 1 } }, { $skip: skips }, { $limit: batchSize.value }]
                }
            },
        ];

        apiRequest("post",`${env.COMPANYACTION}/find`,{findQuery: query})
        .then((resp) => {
            if(resp.status === 200) {
                const response = resp.data;
                if(response.length > 0){
                    let arrayData = response[0].data;
                    companies.value = arrayData;
                    let metaData = response[0].metadata[0];
                    let totalRecords = metaData ? metaData.total : 0;
                    totalPages.value = Math.ceil(totalRecords / batchSize.value);
                    getSpinner.value = false;
                }else{
                    getSpinner.value = false;
                }
            }
        }).catch((error) => {
            console.error(`Error ${error}`);
            getSpinner.value = false;
        });
    }

    function openCompanyDeatil(data) {
        router.push({ name: 'Company_Detail', params: {id: data._id}});
    }

    function previousPage(){
        if (currentPage.value > 1) {
            currentPage.value--;
            fetchCompanyData();
        }
    }

    function nextPage() {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
            fetchCompanyData();
        }
    }

    function goToPage(page) {
       currentPage.value = page;
       fetchCompanyData();
    }

    function closeFunction() {
        isEdit.value = false;
        isAdd.value = false;
    }

    function saveClickFun () {
        childRef.value.saveCompanyData();
        // saveClick.value = true;
    }

    function editCompany (data) {
        isEdit.value = true;
        companyData.value = {
            companyName : data.Cst_CompanyName,
            companyPhone : data.Cst_Phone,
            companyCountry : data.Cst_Country,
            companyState : data.Cst_State,
            companyCity : data.Cst_City,
            compnayDialCode : data.Cst_DialCode,
            companyId : data._id,
            Cst_stateCode: data.Cst_stateCode,
            Cst_countryCode: data.Cst_countryCode
        }
    }

    function createCompany () {
        isAdd.value = true;
        companyData.value = {
            companyName : '',
            companyPhone : '',
            companyCountry : '',
            companyState : '',
            companyCity : '',
            compnayDialCode : '',
            companyId : '',
            Cst_stateCode: '',
            Cst_countryCode: ''
        }
    }

    const handleSearch = () => {
        fetchCompanyData();
    }

    function disableLogin (item,value) {
        const axiosObj = {
            updateObject: { isDisable: value },
            companyId: item._id,
        }
        apiRequest("put",`${env.COMPANYACTION}`,axiosObj).then((resp) => {
            const index = companies.value.findIndex((x) => x._id === resp.data._id);
            if(index !== -1) {
                companies.value[index] = {...companies.value[index],...resp.data}; 
            }
            $toast.success("Updated Successfully.",{position: 'top-right'});
        }).catch((err) => {
            console.error("ERR:",err);
        })
    }

    function handleConfirm () {
        isDelete.value = false;
        isSpinner.value = true;
        apiRequestWithoutCompnay("post", env.DELETE_COMPANY, {
            companyId: selectedRow.value._id
        }).then((resp) => {
            if(resp.data.status == true) {
                isSpinner.value = false;
                fetchCompanyData();
                $toast.success("Deleted Successfully.",{position: 'top-right'});
            } else {
                isSpinner.value = false;
                $toast.success("Something went wrong.",{position: 'top-right'});
                console.error(resp.data,"ERROR");
            }
        }).catch((error) => {
            isSpinner.value = false;
            console.error(error,"ERROR IN DELETE COMPANY:")
        })
    }

    function updatedData (event) {
        let fIndex = companies.value.findIndex((x) => x._id === event._id);
        if(fIndex !== -1){
            companies.value[fIndex] = {...companies.value[fIndex],...event};
            commit('companyTab/mutateCompanies',{op:"modified",data: companies.value[fIndex]})
        }
    }
</script>
<style src="./style.css">
</style>