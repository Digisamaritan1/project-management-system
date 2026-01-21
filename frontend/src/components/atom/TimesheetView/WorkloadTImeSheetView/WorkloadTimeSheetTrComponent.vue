<template>
    <tr class="white-row">
        <td class="fixed" :class="{'cursor-pointer' : trData.totalLoggedHours !==0 || trData.estMin!==0}" @click="toggle(), getTimesheetData(trData)">
            <img :style="{'opacity': (trData.totalLoggedHours !==0 || trData.estMin!==0)?1:0.1}"  alt="" :src="table_arrow" class="taable_arrow" :class="{'row-open': rowOpen && (trData.totalLoggedHours !==0 || trData.estMin!==0)}"/>
            <div class="d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <UserProfile
                        v-if="trData.profileImage && trData.profileImage != null && trData.profileImage != ''"
                        :showDot="false"
                        class="timesheet_user_profile p-0 mr-10px ml-0"
                        :data="{
                            id: trData.id,
                            title: trData.name,
                            image: trData.profileImage
                        }"
                        width="30px"
                        :thumbnail="'30x30'"
                    />
                    <img alt="" v-else src="@/assets/images/default_user.png" class="timesheet_user_profile"
                        :title="trData.name"/>
                    <p class="user_hrs_name">{{ trData.name }}</p>
                </div>
                <div></div>
                <div class="inner_div displayRate  d-flex">
                    <span class="total__project-title pt-5px position-re bg-transparent">
                    <p>{{ trData.totalLoggedHours != undefined ? convertedTimeString(trData.totalLoggedHours,'update') : ''}}</p>
                        <DropDown v-if="trData.manuallyLog.time && trData.trackdLog.time" class="p-0 tracktime_dropdown" :bodyClass="{'tracktime_dropdown_wrapper' : true}" :hover="true">
                            <template #button>
                                <div class="logType__Img--show p-0">
                                    <img v-if="trData.trackdLog.time" :src="green_line"/>&nbsp;
                                    <img v-if="trData.manuallyLog.time" :src="purple_line"/> 
                                </div>
                            </template>
                            <template #options>
                                <div class="d-flex track-option-wrapper">
                                    <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption">
                                        {{trData.trackdLog.time ? convertedTimeString(trData.trackdLog.time,'update') : 0}}
                                        <img class="d-block m3px-auto" v-if="trData.trackdLog.time" :src="green_line" />
                                    </DropDownOption>
                                    <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption-noborder">
                                        {{trData.manuallyLog.time ? convertedTimeString(trData.manuallyLog.time,'update') : 0}}
                                        <img class="d-block m3px-auto" v-if="trData.manuallyLog.time" :src="purple_line"/>
                                    </DropDownOption>
                                </div>
                            </template>
                        </DropDown>
                        <div v-else class="logType__Img--show p-0">
                            <img  v-if="trData.trackdLog.time ? trData.trackdLog.time : ''" :src="green_line"/>
                            <img v-if="trData.manuallyLog.time ? trData.manuallyLog.time : ''" :src="purple_line"/> 
                        </div>
                     </span>
                </div>
                <div >
                    {{trData.estMin != undefined ? getConvertedTimeString(trData.estMin,'update') : ''}}
                </div>
            </div>
        </td>
        <td v-for="(colName, index) in themodelValue" :key="index" v-bind:class="[{ 'weekoff': colName.day == 'Sat' || colName.day == 'Sun', 'current_date': colName.fullDate == colName.currentDate}]">
            <div class="inner_div displayRate d-flex">
                <span class="total__project-title pt-5px position-re" :class="{'cursor-pointer': Object.keys(colName.totalUserLogs).includes(trData.id) }" @click="openLogSetailSideBar(Object.keys(colName.totalUserLogs).includes(trData.id),colName)">
                    {{ Object.keys(colName.totalUserLogs).includes(trData.id)==true ? convertedTimeString(colName.totalUserLogs[`${trData.id}`],'update') : ''}}
                    <div class="logType__Img--show" v-if="Object.keys(colName.totalLogsType).includes(trData.id)==true">
                            <img v-if="colName.totalLogsType[`${trData.id}`] == 1 || colName.totalLogsType[`${trData.id}`] == 2" :src="green_line"/>&nbsp;
                            <img v-if="colName.totalLogsType[`${trData.id}`] == 0 || colName.totalLogsType[`${trData.id}`] == 2" :src="purple_line"/>
                    </div>
                    <DropDown v-if="(colName.totalLogsType[`${trData.id}`] == 1 || colName.totalLogsType[`${trData.id}`] == 2) && (colName.totalLogsType[`${trData.id}`] == 0 || colName.totalLogsType[`${trData.id}`] == 2)" class="p-0 tracktime_dropdown" :bodyClass="{'tracktime_dropdown_wrapper' : true}" :hover="true">
                        <template #button>
                            <div class="logType__Img--show p-0">
                                <img v-if="colName.totalLogsType[`${trData.id}`] == 0 || colName.totalLogsType[`${trData.id}`] == 2" :src="green_line"/>&nbsp;
                                <img v-if="colName.totalLogsType[`${trData.id}`] == 1 || colName.totalLogsType[`${trData.id}`] == 2" :src="purple_line"/> 
                            </div>
                        </template>
                        <template #options>
                            <div class="d-flex track-option-wrapper">
                                <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption">
                                     {{colName.totalLogsType[`${trData.id}`] == 0 || colName.totalLogsType[`${trData.id}`] == 2 ? convertedTimeString(colName.totalTrackedLogs[`${trData.id}`],'update') : 0}}
                                    <img class="d-block m3px-auto" v-if="colName.totalLogsType[`${trData.id}`] == 0 || colName.totalLogsType[`${trData.id}`] == 2" :src="green_line" />
                                </DropDownOption>
                                <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption-noborder">
                                    {{colName.totalLogsType[`${trData.id}`] == 1 || colName.totalLogsType[`${trData.id}`] == 2 ? convertedTimeString(colName.totalManualLogs[`${trData.id}`],'update') : 0}}
                                    <img class="d-block m3px-auto" v-if="colName.totalLogsType[`${trData.id}`] == 1 || colName.totalLogsType[`${trData.id}`] == 2" :src="purple_line"/>
                                </DropDownOption>
                            </div>
                        </template>
                    </DropDown>
                </span>
                <span :class="{'yellowText': colName.totalUserEst[`${trData.id}`] > 540, 'greenText': colName.totalUserEst[`${trData.id}`] == 540, 'redText': colName.totalUserEst[`${trData.id}`] < 540}">
                   <p  v-if="Object.keys(colName.totalUserEst).includes(trData.id)==true"> {{ colName.totalUserEst[`${trData.id}`] ? getConvertedTimeString(colName.totalUserEst[`${trData.id}`],'update') : ''}} </p>
                </span>
            </div>
        </td>
    </tr>
        <tr class="data-row" v-if="isOpen && (trData.totalLoggedHours !==0 || trData.estMin!==0)">
            <td v-if="!isView" :colspan="tableStyl.colspanCount" class="p-0">
                <table class="table open_project_table" v-bind:class="[{ 'isWeeked': activeWeek.isWeeked,'isOneday': activeWeek.isOneday,
                        'isTwoday': activeWeek.isTwoday,'isThreeday': activeWeek.isThreeday,'isFourday': activeWeek.isFourday,
                        'isFiveday': activeWeek.isFiveday,
                        'isSixday': activeWeek.isSixday}]" :style="[{'width': tableStyl.tableWidth}]">
                    <tbody v-for="projectObject in trData.projectArray" :key="projectObject.id">
                        <WorkloadTimeSheetProjectComponent v-model="themodelValue" :userData="trData" :projectData="projectObject" :tableStyle="tableStyl" :activeWeekObject="activeWeek"  @update:getTaskData="getTaskDatass"/>
                    </tbody>                     
                </table>
            </td>
            <td v-if="isView && isTaskShow" :colspan="tableStyl.colspanCount" class="p-0">
                <table class="table open_project_table" v-bind:class="[{ 'isWeeked': activeWeek.isWeeked,'isOneday': activeWeek.isOneday,
                        'isTwoday': activeWeek.isTwoday,'isThreeday': activeWeek.isThreeday,'isFourday': activeWeek.isFourday,
                        'isFiveday': activeWeek.isFiveday,
                        'isSixday': activeWeek.isSixday}]" :style="[{'width': tableStyl.tableWidth}]">
                    <tbody>
                        <WorkloadViewTaskComponent v-model="themodelValue" :userData="trData" :projectData="workloadViewTaskData" :tableStyle="tableStyl" :activeWeekObject="activeWeek"/>
                    </tbody>                     
                </table>
            </td>
        </tr>
         <LogTimeDetail v-if="isLogTimeOpen" @isSClose="(val) => {isLogTimeOpen = !val}" :date="colData" :userData="trData" :projectData="isView ? projectData : {}"  :taskData={} :filterType="filterType" :checkedFilter="checkedFilter" />
</template>
<script setup>
    import { defineProps,defineEmits, ref ,watch } from 'vue';
    import WorkloadTimeSheetProjectComponent from '@/components/atom/TimesheetView/WorkloadTImeSheetView/WorkloadTimeSheetProjectComponent';
    import LogTimeDetail from '@/components/atom/TimesheetView/LogDetailView/UserLogDetailView/LogDetailView.vue'
    import WorkloadViewTaskComponent from '@/views/Projects/WorkloadView/WorkloadViewTaskComponent.vue'
    import UserProfile from "@/components/atom/UserProfile/UserProfile.vue";
    import { getConvertedTimeString } from '@/composable/commonFunction';
    import DropDown from '@/components/molecules/DropDown/DropDown.vue';
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
    const rowOpen = ref(false);
    const purple_line = require('@/assets/images/svg/purple_line.svg');
    const green_line = require('@/assets/images/svg/green_line.svg');
    const emit = defineEmits(["update:getSubItem","update:getTaskData"]);
    const workloadViewTaskData = ref({});
    const colData = ref();
    const isTaskShow = ref(false);
    const isLogTimeOpen = ref(false);
      const props = defineProps({
        userTrData: {type: Object},
        modelValue : {
            type : Array,
            default : ()=>([])
        },
        tableStyl : {
            type : Object,
            default : ()=>({})
        },
        activeWeek : {
            type : Object,
            default:()=>({})
        },
        isView : {
            type : Boolean,
            default: false
        },
        projectData: {
            type: Object,
            default: () => ({})
        },
        filterType:{
            type: String,
            default: ''
        },
        checkedFilter : {
            type : Array,
            default : ()=>([])
        }
    });
    const table_arrow = ref(require("@/assets/images/table_arrow.png"))
    const themodelValue = ref(props.modelValue);
    const trData = ref(props.userTrData);
    const isOpen = ref();
    watch(()=> props.modelValue ,(val)=>{
        themodelValue.value = val;
    })
    const toggle =() => {
        isOpen.value = !isOpen.value;
        if (isOpen.value) {
            rowOpen.value = true;
        } else {
            rowOpen.value = false;
        }
    }
    const getTimesheetData = (userData) =>{
        if (isOpen.value) {        
            emit("update:getSubItem",userData,(cb)=>{
                if (!props.isView) {
                    userData = cb.data;
                } else {
                    workloadViewTaskData.value = cb.data;
                    isTaskShow.value = true;
                }
            });
        }
    }
    const convertedTimeString = (n, type)=>{
        return getConvertedTimeString(n,type);
    }
    const getTaskDatass = (proObj,cbd) =>{
        emit("update:getTaskData",proObj,(cb)=>{
            proObj = cb.data;
            cbd({'status' : true,'data':proObj});
        });
    }
    const openLogSetailSideBar = (isOpen,data) => {
        if (isOpen) {
               colData.value = data.mainDate;
               isLogTimeOpen.value = true;
        }
    }
</script>
<style scoped>
.inner_div.displayRate span {
  width: 100%;
}
.inner_div span {
  width: 50%;
  height: 40px;
}
td .inner_div span:last-child {
    background-color: #e6f8f9;
}
.total__project-title{
    line-height: 28px; 
}
.track__dropdownoption{
    background-color: #fff!important;
    color:#3E3E3E!important;
    padding: 0px 7px!important;
    border-right: 1px solid #ececec;
    border-radius: 0px!important;
}
.track__dropdownoption-noborder{
    margin:0 auto;
    background-color: #fff!important;
    color:#3E3E3E!important;
    padding: 0px 7px!important;
}
</style>