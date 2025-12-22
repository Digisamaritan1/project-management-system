<template>
    <div class="companydetail_wrapper">
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="d-flex align-items-start company_details--wrapper">
            <div class="company_details_div">
                <div class="company_image_name">
                    <div class="company_image--logo">
                        <WasabiIamgeCompp v-if="selectedCompany?.Cst_profileImage" :companyId="selectedCompany?._id" :data="{url:selectedCompany?.Cst_profileImage}" class="profile-image-detail"/>
                        <span v-else-if="!selectedCompany?.Cst_profileImage" class="no-img-span d-flex align-items-center profile-image-detail">{{selectedCompany?.Cst_CompanyName?.charAt(0)}}</span>
                    </div>
                    <span class="company_name">{{selectedCompany?.Cst_CompanyName}}</span>
                </div>
                <div class="company_data_div">
                    <div class="d-flex align-items-center justify-content-between details--mian">
                        <span class="font-size-18 font-weight-600 shade-black font-roboto-sans">Details</span>
                        <img :src="editIconBlue" @click="editClick()"/> 
                    </div>
                    <div class="detail_item--wrapper">
                        <div class="d-flex flex-column detail_item mb-20px">
                            <span class="gray font-size-14 font-weight-400 font-roboto-sans">Phone No.</span>
                            <span class="black font-size-14 font-weight-400 font-roboto-sans">{{selectedCompany?.Cst_Phone}}</span>
                        </div>
                        <div class="d-flex flex-column detail_item mb-20px">
                            <span class="gray font-size-14 font-weight-400 font-roboto-sans">Total No. of User</span>
                            <span class="black font-size-14 font-weight-400 font-roboto-sans">{{selectedCompany?.companyData?.[0]?.users}}</span>
                        </div>
                        <div class="d-flex flex-column detail_item mb-20px">
                            <span class="gray font-size-14 font-weight-400 font-roboto-sans">Company Created Date</span>
                            <span class="black font-size-14 font-weight-400 font-roboto-sans">{{selectedCompany?.createdAt}}</span>
                        </div>
                        <div class="d-flex flex-column detail_item mb-20px">
                            <span class="gray font-size-14 font-weight-400 font-roboto-sans">Owner</span>
                            <span class="black font-size-14 font-weight-400 font-roboto-sans">{{userData.Employee_Name}}</span>
                        </div>
                        <div class="d-flex flex-column detail_item">
                            <span class="gray font-size-14 font-weight-400 font-roboto-sans">Email</span>
                            <span class="black font-size-14 font-weight-400 font-roboto-sans">{{userData.Employee_Email}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="company_details_right pl-50px">
                <div class="d-flex align-items-center tab-list-wrapper">
                    <TabList
                        v-for="(view, index) in (viewsListArray)"
                        :key="view.id"
                        :id="view.keyName"
                        :item="view"
                        :active="activeTab === view.name"
                        :firstChild="index === 0"
                        @click="activeTab = view.name"
                    />
                </div>
                <component
                    v-if="!isLoad"
                    :is="getView(activeTab)"
                    :selectedCompany="selectedCompany"
                />
            </div>
        </div>
        <Sidebar 
            v-if="isEdit"
            width="1000px"
            :top="'0px'"
            :headClass="'add_plan--header'"
        >
            <template #head-left>
                <div class="blue">
                    <span>Edit Company Details</span>
                </div>
            </template>
            <template #head-right>
                <div>
                    <button class="close_button mr-20px font-size-16px" @click="()=> closeFunction()">Close</button>
                    <button v-if="saveClick === false" class="save-button font-size-16px" @click="saveClickFun()">Edit</button>
                    <button v-else class="save-button btn-disabled font-size-16px" disabled>Edit</button>
                </div>
            </template>
            <template #body>
                <CompanyForm :modelValue="companyData" @closeSidebar="isEdit = false, saveClick = false" :isAdd="false" ref="childRef" @onSpinner="(event) => saveClick = event" @updatedData="(event) => selectedCompany = event" />
            </template> 
        </Sidebar>
    </div>
</template>
<script setup>
    import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
    import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
    import Sidebar from '@/components/molecules/Sidebar/Sidebar';
    import CompanyForm from '@/components/molecules/CompanyForm/CompanyForm.vue';
    import TabList from '@/components/atom/TabList/TabList.vue'
    import SubscriptionDetail from '../SubscriptionDetail/SubscriptionDetail.vue';
    import Invoice from '../Invoice/Invoice.vue';
    import Payments from '../Payments/Payments.vue';
    import { onMounted, ref, watch } from 'vue';
    import { useRoute } from 'vue-router';
    import { useStore } from 'vuex';
    import { apiRequest } from '@/services';
    import * as env from '@/config/env';
    const selectedCompany = ref({});
    const userData = ref({})
    const isEdit = ref(false)
    const saveClick = ref(false);

    const { getters,dispatch } = useStore();

    const breadCrumbArray = ref([
        {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
        {name: 'Company', routeObj: {name: 'Company'}, isClickable: true},
        {name: '', routeObj: {name: 'Company_Detail'}, isClickable: false},
    ])
    const route = useRoute();
    const editIconBlue = require('@/assets/images/svg/edit_icon_blue.svg');

    const companyData = ref({
        companyName : '',
        companyPhone : '',
        companyCountry : '',
        companyState : '',
        companyCity : '',
        compnayDialCode : '',
        companyId : ''
    })
    const viewsListArray = ref([
        {name:"Subscription Details",id:1},
        {name:"Invoices",id:2},
        {name:"Payments",id:3}]
    )
    const activeTab = ref("Subscription Details");
    const isLoad = ref(true);
    const childRef = ref();

    onMounted(async() => {
        if(getters['companyTab/companies'] && getters['companyTab/companies'].length === 0) {
            await dispatch('companyTab/setCompanies').then((res) => {
                selectedCompany.value = res.find((x) => x._id === route.params.id);
                breadCrumbArray.value[2].name = selectedCompany.value.Cst_CompanyName;
                isLoad.value = false;
            })
        }else{
            selectedCompany.value = getters['companyTab/companies'].find((x) => x._id === route.params.id);
            breadCrumbArray.value[2].name = selectedCompany.value.Cst_CompanyName;
            isLoad.value = false;
        }
        await apiRequest('get',`${env.USER}/${selectedCompany.value.userId}`).then((res)=>{
            if(res.status === 200){
                userData.value = res.data;
            }else{
                userData.value = {};
            }
        })
        companyData.value = {
            companyName : selectedCompany.value.Cst_CompanyName,
            companyPhone : selectedCompany.value.Cst_Phone,
            companyCountry : selectedCompany.value.Cst_Country,
            companyState : selectedCompany.value.Cst_State,
            companyCity : selectedCompany.value.Cst_City,
            compnayDialCode : selectedCompany.value.Cst_DialCode,
            companyId : selectedCompany.value._id,
        }
    })

    watch(selectedCompany.value,(data) => {
        selectedCompany.value = data;
    })

    function closeFunction() {
        isEdit.value = false;
    }

    function saveClickFun () {
        childRef.value.saveCompanyData();
        saveClick.value = true;
    }

    function getView(val) {
        switch(val) {
            case "Subscription Details":
            return SubscriptionDetail;

            case "Invoices":
            return Invoice;

            case "Payments":
            return Payments;
        }
    }

    function editClick () {
        isEdit.value = true;
        companyData.value = {
            companyName : selectedCompany.value.Cst_CompanyName,
            companyPhone : selectedCompany.value.Cst_Phone,
            companyCountry : selectedCompany.value.Cst_Country,
            companyState : selectedCompany.value.Cst_State,
            companyCity : selectedCompany.value.Cst_City,
            compnayDialCode : selectedCompany.value.Cst_DialCode,
            companyId : selectedCompany.value._id,
        }
    }
</script>
<style src="./style.css">
</style>