<template>
<div class="ProjectManagementWrapper setting_template_wrapper" :style="[{padding : clientWidth > 767 ? '18px 0px' : '0px'}]">
    <div>
        <teleport to="#top_section" v-if="showHeader">
            <div class="templateBtnWrapper" id="import-default-template" v-if="!isDisplayDetail">
                <div class="Add-default-template d-flex">
                <button type="button" @click="openSidebar('createTemplate')" class="btn btn-blue cursor-pointer mr-0">+ {{ $t('Templates.add_new_templete') }}</button>
                </div>
            </div>
        </teleport>
        <div class="statusTaskWrapper statusTaskWrapperMain usetemplatesWrapper d-flex justify-content-between overflow-auto style-scroll" v-if="!isDisplayDetail">
            <div class="mainLeftside">
                <div class="template__brwose-category">
                    <h5 class="font-size-18">{{ $t('ProjectDetails.browse_by_category') }}</h5>
                    <div class="use-template-browsecategory">
                        <ul class="taskStatusLeftListWrapper p-0" v-if="categoryArray && categoryArray.length">
                            <li class="cursor-pointer"  v-for="(item,index) in categoryArray" v-bind:key="index" :class="`${selectedDefaultCategory.key === item.key ? 'active__template': ''}`"   :style="`${selectedDefaultCategory.key === item.key ? 'background-color: #DBF1FF !important;cursor:pointer;' : ''}`">
                                <span class="templated_name" @click="changeCategoryData(item,'defaultData')" :style="`${selectedDefaultCategory.key === item.key ? 'color: #535358 !important;' : ''}`"> {{item.name}} </span>
                            </li>
                        </ul>
                        <ul class="taskStatusLeftListWrapper p-0" v-else>
                            {{ $t('Projects.no_category_found') }}
                        </ul>
                    </div>
                    <h5 class="mobile-use-template-text">{{ $t('Templates.templates') }}</h5>
                    <div class="use-template-browsecategory">
                        <ul class="taskStatusLeftListWrapper p-0">
                            <li class="cursor-pointer" :class="`${selectedCategory === CompanyDatabase ? 'active__template': ''}`"   :style="`${selectedCategory === CompanyDatabase ? 'background-color: #DBF1FF !important;cursor:pointer;' : ''}`">
                                <span class="templated_name" @click="changeCategoryData('','basicData')" :style="`${selectedCategory === CompanyDatabase ? 'color: #535358 !important;' : ''}`">
                                    <p>{{userDataVal.companyData && userDataVal.companyData.filter((x) => x._id === CompanyDatabase)[0].Cst_CompanyName}}'{{$t('Templates.s')}} {{$t('Templates.templates')}}</p>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="template-right-side position-re" :class="{'template__settings__spinner' : clientWidth <= 767 && isSpinner}">
                <div v-if="!spinner">
                    <div v-if="selectedDefaultData && selectedDefaultData.length > 0 && !isSpinner">
                        <div v-if="!isDisplayTemplateDetail && !isSpinner" class="d-flex mobile-usetempllate-list-display w-100 flex-wrap">
                            <SingleTemplate v-for="(tempDefItem) in selectedDefaultData" v-bind:key="tempDefItem._id" :displayDataObject="tempDefItem" @click.prevent='displayTemplateDetail(tempDefItem)'/>
                        </div>
                        <TemplateDetail :currentSelectedKey="selectedDefaultCategory.key" :categoryType="categoryType"  v-if="isDisplayTemplateDetail" :templateView="templateView" :isUseTemplate="false" :isExportTemplate="true" @closeSecond="closeSecond" @click:updateSidebarVal="manageSelectedVal" @closeTemplateDetail="isDisplayTemplate = false"/>
                    </div>
                </div>
                <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
                <div class="overflow-auto style-scroll" v-if="isTemplateExist && !isSpinner">
                    <div class="text-center" v-if="(selectedDefaultData.length == 0) && !isSpinner">
                        <div class="position-ab position-center">
                            <img :src="noResultFound" alt="norecordfound"/>
                            <div class="error-text text-center">
                                <h2>{{$t('Filters.no_data_found')}}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <CreateTemplate v-if="createTemplateSidebar" :createTemplateSidebar="createTemplateSidebar" :defaultMainTemplate="defaultMainTemplate" @click:closeSidebar="closeEvent()" @closeSidebar="closeSidebar"/>
    <CreateTemplateWithAI v-if="isCreateWithAI" :isSidebar="isCreateWithAI" @click:closeSidebar="closeEvent()" @closeSidebar="isCreateWithAI = false" :existingTemplates="defaultMainTemplate"/>
</div>
</template>

<script setup>
import { useStore } from "vuex";
import { defineComponent, nextTick } from "vue";
import { ref, inject, onMounted, computed, watch,defineEmits} from "vue";
const { getUser } = useGetterFunctions();
import { useGetterFunctions } from "@/composable";
import CreateTemplate from '@/views/Settings/Template/CreateTemplate.vue';
import { removeDuplicatesWithKey } from "./helper.js";
import TemplateDetail from '@/components/templates/CreateProject/TemplateDetail.vue';
import SingleTemplate from "@/views/Settings/Template/SingleTemplate.vue"
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import * as env from '@/config/env';
import { apiRequest } from "../../../services/index.js";
import CreateTemplateWithAI from '@/views/Settings/Template/CreateTemplateWithAI.vue';

const showHeader = ref(false)

    defineComponent({
        name: "TemplateComponent"
    })
    defineComponent({
        name: "TemplateComponent"
    })
    const { getters , dispatch} = useStore();
    const emit = defineEmits(["update:manageTempList"]);
    const categoryArray = ref([]);
    const userId = inject('$userId');
    const clientWidth = inject("$clientWidth");
    const CompanyDatabase = inject("$companyId");
    const selectedCategory = ref({});
    const userDataVal = getUserData();
    const selectedDefaultCategory = ref({});
    const isDisplayDetail = ref(false);
    const isDisplayTemplateDetail = ref(false);
    const defaultMainTemplate = ref([]);
    const allProjectTemplate = ref([]);
    const selectedDefaultData = ref([]);
    const isTemplateExist = ref(false);
    const createTemplateSidebar = ref(false);
    const isCreateWithAI = ref(false);
    const isSpinner = ref(false);
    const spinner = ref(false);
    const defaultCategory = ref({});
    const categoryType = ref("");
    const templateView = ref({});
    // image
    const noResultFound = require("@/assets/images/svg/No-Search-Result.svg");
    function getUserData() {
        const user = getUser(userId.value,true);
        const userData = {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyid : user.AssignCompany,
            companyData : [],
        }
        return userData;
    }
    const companies = computed(() => {
        return getters["settings/companies"];
    })
    const projectTemplateGetter = computed(() => {
        return getters["projectData/projectTemplate"];
    })
    if(companies.value && companies.value.length > 0){
        userDataVal.companyid.forEach(element => {
            let indexVal = companies.value.findIndex((item)=>{
                return item._id === element
            })
            if(indexVal !== -1){
                userDataVal.companyData.push(companies.value[indexVal])
            }
        });
    }
    onMounted(()=>{
        isSpinner.value = true;
        spinner.value = true;
        apiRequest("post", env.GLOBAL_PROJECT_TEMPLATE).then((result)=>{
            if(result.data.status){
                defaultMainTemplate.value = result.data.statusText;
                categoryArray.value = removeDuplicatesWithKey(defaultMainTemplate.value.map(ele=>ele.TemplateCategory),'key');
                selectedDefaultCategory.value = categoryArray.value.length ? categoryArray.value[0] : {};
                selectedDefaultData.value = defaultMainTemplate.value.filter(tempData=>tempData.TemplateCategory.key === selectedDefaultCategory.value.key);
            }
            spinner.value = false;
            isSpinner.value = false;
        }).catch((error)=>{
            spinner.value = false;
            isSpinner.value = false;
            console.error('Error in getting projectTemplate',error);
        });
        
        nextTick(() => {
            showHeader.value = true;
            if(categoryArray.value && categoryArray.value.length > 0){
                selectedDefaultCategory.value = categoryArray.value[0];
            }
        })
    })
    watch(() => getters['projectData/projectTemplate'],(newVal)=>{
        if(newVal && Object.keys(newVal).length == 0) {
            if(selectedDefaultCategory.value && Object.keys(selectedDefaultCategory.value).length == 0) {
                selectedDefaultData.value = [];
                isTemplateExist.value = true;
                isDisplayTemplateDetail.value = false;
            }
        } else {
            allProjectTemplate.value = newVal.data;
            if(selectedDefaultCategory.value && Object.keys(selectedDefaultCategory.value).length == 0) {
                if(newVal.data.length == 0) {
                    selectedDefaultData.value = [];
                    allProjectTemplate.value = [];
                }
                selectedDefaultData.value = allProjectTemplate.value;
                isTemplateExist.value = false;
            }
        }
    })
    function changeCategoryData(itemData,type){
        isDisplayTemplateDetail.value = false;
        if(type == "basicData"){
            if(categoryType.value == '' || categoryType.value !== 'basicData') {
                isTemplateExist.value = false;
                isSpinner.value = true;
                categoryType.value = "basicData";
                selectedCategory.value = CompanyDatabase.value;
                selectedDefaultCategory.value = {};
                getProjectTemplate().then(()=>{
                    selectedDefaultData.value = allProjectTemplate.value.sort((a, b) => a?.Created_At?.seconds > b?.Created_At?.seconds ? -1 : 1);
                    isSpinner.value = false;
                    if(allProjectTemplate.value?.length <= 0){
                        isTemplateExist.value = true;
                    }
                })
            }
        }
        if(type == "defaultData"){
            isTemplateExist.value = false;
            categoryType.value = '';
            selectedDefaultData.value = [];
            selectedCategory.value = {};
            selectedDefaultCategory.value = itemData;
            selectedDefaultData.value = defaultMainTemplate.value.filter(tempData=>tempData.TemplateCategory.key === selectedDefaultCategory.value.key)
            if(selectedDefaultData.value.length <= 0){
                isTemplateExist.value = true; 
            }
        }
    }
    function openSidebar(key) {
        createTemplateSidebar.value = (key === 'createTemplate') ? true : false;
        isCreateWithAI.value = (key === 'createTemplateWithAI') ? true : false;
        defaultCategory.value = Object.keys(selectedDefaultCategory.value).length > 0 ? selectedDefaultCategory.value : selectedCategory.value
    }
    function closeSidebar(value){
        createTemplateSidebar.value = value;
    }
    function displayTemplateDetail(item){
        isDisplayTemplateDetail.value = true;
        templateView.value = item;
    }
    function manageSelectedVal(value){
        isDisplayTemplateDetail.value = value;
        emit("update:manageTempList",isDisplayTemplateDetail.value);
    }
    function closeSecond () {
        isDisplayDetail.value = true;
    }
    function getProjectTemplate () {
        try {
            return new Promise((res)=>{
                dispatch('projectData/setprojectTemplate', CompanyDatabase.value)
                .then(() => {
                    if(projectTemplateGetter.value && Object.keys(projectTemplateGetter.value).length != 0) {
                        allProjectTemplate.value = projectTemplateGetter.value?.data ? projectTemplateGetter.value.data : [];
                    } else {
                        allProjectTemplate.value = [];
                    }
                    res();
                })
            })
        } catch (error) {
            console.error(error);
        }
    }

    function closeEvent(){
        closeSidebar(false);
        changeCategoryData('','basicData');
    }
</script>
<style scoped>
@import "./style.css";
</style>