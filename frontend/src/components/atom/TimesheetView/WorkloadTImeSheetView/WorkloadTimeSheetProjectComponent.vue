<template>
    <tr class="data-row" >
        <td class="fixed p-0"  @click="toggleTask(projectObjectData)">
            <div class="d-flex align-items-center">
                <div class="d-flex align-items-center">
                    <img alt="" v-if="projectObjectData.status !== 'close' && (projectObjectData.deletedStatusKey == 0 || projectObjectData.deletedStatusKey == undefined)" :src="table_arrow" class="taable_arrow mr-10px" :class="{'row-open': rowOpen}"/>
                    <p class="user_hrs_name" :title="projectObjectData.ProjectName">{{ projectObjectData.ProjectName }}</p>
                    <img v-if="projectObjectData.status == 'close' || !(projectObjectData.deletedStatusKey == 0 || projectObjectData.deletedStatusKey == undefined)" :src="logk_icon" alt="loclIcon"  class="ml-5px" />
                </div>
                <div><span v-if="projectObjectData.status !== 'close' && (projectObjectData.deletedStatusKey == 0 || projectObjectData.deletedStatusKey == undefined)" @click="projectPush" class="blue text-decoration-underline cursor-pointer">{{projectObjectData.ProjectCode }}</span></div>
                <div class="inner_div displayRate d-flex">
                    <span class="total__project-title pt-5px position-re bg-transparent">
                        <p>{{ projectObjectData.totalProjectTime != undefined ? convertedTimeString(projectObjectData.totalProjectTime,'update') : ''}}</p>
                        <DropDown v-if="projectObjectData.projectTrackeTime && projectObjectData.projectManualTime" class="p-0 tracktime_dropdown" :bodyClass="{'tracktime_dropdown_wrapper' : true}" :hover="true">
                            <template #button>
                                <div class="logType__Img--show p-0">
                                    <img v-if="projectObjectData.projectTrackeTime" :src="green_line"/>&nbsp;
                                    <img v-if="projectObjectData.projectManualTime" :src="purple_line"/> 
                                </div>
                            </template>
                            <template #options>
                                <div class="d-flex track-option-wrapper">
                                    <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption">
                                        {{projectObjectData.projectTrackeTime ? convertedTimeString(projectObjectData.projectTrackeTime,'update') : 0}}
                                        <img class="d-block m3px-auto" v-if="projectObjectData.projectTrackeTime" :src="green_line" />
                                    </DropDownOption>
                                    <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption-noborder">
                                        {{projectObjectData.projectManualTime ? convertedTimeString(projectObjectData.projectManualTime,'update') : 0}}
                                        <img class="d-block m3px-auto" v-if="projectObjectData.projectManualTime" :src="purple_line"/>
                                    </DropDownOption>
                                </div>
                            </template>
                        </DropDown>
                        <div v-else class="logType__Img--show p-0">
                            <img v-if="projectObjectData.projectTrackeTime ? projectObjectData.projectTrackeTime : ''" :src="green_line"/>
                            <img v-if="projectObjectData.projectManualTime ? projectObjectData.projectManualTime : ''" :src="purple_line"/> 
                        </div>
                    </span>
                </div>
                <div>
                     <p>{{ projectObjectData.totalProjectEstimate != undefined ? convertedTimeString(projectObjectData.totalProjectEstimate,'update') : ''}}</p>
                </div>
            </div>
        </td>
        <td v-for="(colName, index) in themodelValue" :key="index"  v-bind:class="[{ 'weekoff': colName.day == 'Sat' || colName.day == 'Sun', 'current_date': colName.fullDate == colName.currentDate}]">
            <div class="inner_div displayRate d-flex">
                <span class="total__project-title pt-5px position-re" :class="{'cursor-pointer': Object.keys(projectObjectData.projectFinalLogs).includes(colName.fullDate) }" @click="openLogSetailSideBar(Object.keys(projectObjectData.projectFinalLogs).includes(colName.fullDate),colName,'project')">
                    {{ Object.keys(projectObjectData.projectFinalLogs).includes(colName.fullDate) ? convertedTimeString(projectObjectData.projectFinalLogs[colName.fullDate],'update') : ''}}
                    <div class="logType__Img--show" v-if="Object.keys(projectObjectData.dateWiseProjectType).includes(colName.fullDate)">
                        <img v-if="projectObjectData.dateWiseProjectType[colName.fullDate] == 1 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2" :src="green_line"/>&nbsp;
                        <img v-if="projectObjectData.dateWiseProjectType[colName.fullDate] == 0 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2" :src="purple_line"/>
                    </div>
                    <DropDown v-if="(projectObjectData.dateWiseProjectType[colName.fullDate] == 1 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2) && (projectObjectData.dateWiseProjectType[colName.fullDate] == 0 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2)" class="p-0 tracktime_dropdown" :bodyClass="{'tracktime_dropdown_wrapper' : true}" :hover="true">
                        <template #button>
                            <div class="logType__Img--show p-0">
                                <img v-if="projectObjectData.dateWiseProjectType[colName.fullDate] == 1 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2" :src="green_line"/>&nbsp;
                                <img v-if="projectObjectData.dateWiseProjectType[colName.fullDate] == 0 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2" :src="purple_line"/>
                            </div>
                        </template>
                        <template #options>
                            <div class="d-flex track-option-wrapper">
                                <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption">
                                     {{(projectObjectData.dateWiseProjectType[colName.fullDate] == 1 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2) ? convertedTimeString(projectObjectData.dateWiseTrackTime[colName.fullDate],'update') : 0}}
                                    <img class="d-block m3px-auto" v-if="projectObjectData.dateWiseProjectType[colName.fullDate] == 1 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2" :src="green_line" />
                                </DropDownOption>
                                <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption-noborder">
                                    {{projectObjectData.dateWiseProjectType[colName.fullDate] == 0 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2 ? convertedTimeString(projectObjectData.dateWiseManulTime[colName.fullDate],'update') : 0}}
                                    <img class="d-block m3px-auto" v-if="projectObjectData.dateWiseProjectType[colName.fullDate] == 0 || projectObjectData.dateWiseProjectType[colName.fullDate] == 2" :src="purple_line"/>
                                </DropDownOption>
                            </div>
                        </template>
                    </DropDown>
                </span>
                <span class="project__finalestimate-fulldate">
                    {{ projectObjectData.projectFInalEstimate ? Object.keys(projectObjectData.projectFInalEstimate).includes(colName.fullDate) ? getConvertedTimeString(projectObjectData.projectFInalEstimate[colName.fullDate],'update') : '' : ''}}
                </span>
            </div>
        </td>
    </tr>  
       <tr v-if="isOpen" class="open_project_data">
            <td :colspan="tableStyle.colspanCount" class="p-0">
                <table class="table" v-bind:class="[{ 'isWeeked': activeWeekObject.isWeeked,'isOneday': activeWeekObject.isOneday,
                    'isTwoday': activeWeekObject.isTwoday,'isThreeday': activeWeekObject.isThreeday,'isFourday': activeWeekObject.isFourday,
                    'isFiveday': activeWeekObject.isFiveday,
                    'isSixday': activeWeekObject.isSixday}]" :style="[{'width': tableStyle.tableWidth}]">
                    <tr v-for="taskObject in projectObjectData.activitiesArray" :key="taskObject.id">
                        <td class="fixed p-0">
                            <div class="d-flex align-items-center">
                                <div class="projectSubTask" :title="taskObject.TaskName">{{ taskObject.TaskName }}</div>
                                <div> <span v-show="taskObject.deletedStatusKey == undefined || taskObject.deletedStatusKey == 0"  class="blue text-decoration-underline cursor-pointer" @click="taskDetailOpen(taskObject)">{{ taskObject.TaskKey }}</span></div>
                                <div class="inner_div displayRate d-flex">
                                    <span class="total__project-title pt-5px position-re bg-transparent">
                                        {{taskObject.totalTaskLogMin!= undefined ? convertedTimeString(taskObject.totalTaskLogMin,'update') : ''}}
                                        <DropDown v-if="taskObject.totalTaskManualLogMin && taskObject.totalTaskTrackedLogMin" class="p-0 tracktime_dropdown" :bodyClass="{'tracktime_dropdown_wrapper' : true}" :hover="true">
                                            <template #button>
                                                <div class="logType__Img--show p-0">
                                                    <img v-if="taskObject.totalTaskTrackedLogMin" :src="green_line"/>&nbsp;
                                                    <img v-if="taskObject.totalTaskManualLogMin" :src="purple_line"/> 
                                                </div>
                                            </template>
                                            <template #options>
                                                <div class="d-flex track-option-wrapper">
                                                    <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption">
                                                        {{taskObject.totalTaskTrackedLogMin ? convertedTimeString(taskObject.totalTaskTrackedLogMin,'update') : 0}}
                                                        <img class="d-block m3px-auto" v-if="taskObject.totalTaskTrackedLogMin" :src="green_line" />
                                                    </DropDownOption>
                                                    <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption-noborder">
                                                        {{taskObject.totalTaskManualLogMin ? convertedTimeString(taskObject.totalTaskManualLogMin,'update') : 0}}
                                                        <img class="d-block m3px-auto" v-if="taskObject.totalTaskManualLogMin" :src="purple_line"/>
                                                    </DropDownOption>
                                                </div>
                                            </template>
                                        </DropDown>
                                        <div v-else class="logType__Img--show p-0">
                                            <img v-if="taskObject.totalTaskTrackedLogMin ? taskObject.totalTaskTrackedLogMin : ''" :src="green_line"/>
                                            <img v-if="taskObject.totalTaskManualLogMin ? taskObject.totalTaskManualLogMin : ''" :src="purple_line"/> 
                                        </div>
                                    </span>
                                </div>
                               
                                <div>
                                    {{taskObject.totalTaskEstMin!= undefined ? getConvertedTimeString(taskObject.totalTaskEstMin,'update') : ''}}
                                </div>
                            </div>
                        </td>
                        <td v-for="(colName, index) in themodelValue" :key="index"  v-bind:class="[{ 'weekoff': colName.day == 'Sat' || colName.day == 'Sun', 'current_date': colName.fullDate == colName.currentDate}]">
                            <div class="inner_div displayRate d-flex" >
                                <span class="total__project-title pt-5px position-re" :class="{'cursor-pointer': taskObject?.taskFinalLogs ?  Object.keys(taskObject.taskFinalLogs).includes(colName.fullDate): false }" @click="openLogSetailSideBar(taskObject?.taskFinalLogs ?  Object.keys(taskObject.taskFinalLogs).includes(colName.fullDate): false,colName,'task',taskObject)">
                                    {{taskObject?.taskFinalLogs ?  Object.keys(taskObject.taskFinalLogs).includes(colName.fullDate) ? convertedTimeString(taskObject.taskFinalLogs[colName.fullDate],'update') : '' : ''}}
                                    <div class="logType__Img--show" v-if="Object.keys(taskObject.dateLogsType).includes(colName.fullDate)">
                                        <img v-if="taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2" :src="green_line"/>&nbsp;
                                        <img v-if="taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate] == 2" :src="purple_line"/>
                                    </div>
                                    <DropDown v-if="(taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2) && (taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate] == 2)" class="p-0 tracktime_dropdown" :bodyClass="{'tracktime_dropdown_wrapper' : true}" :hover="true">
                                        <template #button>
                                            <div class="logType__Img--show p-0">
                                                <img v-if="taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2" :src="green_line"/>&nbsp;
                                                <img v-if="taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate]  == 2" :src="purple_line"/>
                                            </div>
                                        </template>
                                        <template #options>
                                            <div class="d-flex track-option-wrapper">
                                                <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption">
                                                    {{(taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2) ? convertedTimeString(taskObject.dateTrackTime[colName.fullDate],'update') : 0}}
                                                    <img class="d-block m3px-auto" v-if="taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2" :src="green_line" />
                                                </DropDownOption>
                                                <DropDownOption class="font-weight-700 font-size-12 d-block m0-auto track__dropdownoption-noborder">
                                                    {{taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate]  == 2 ? convertedTimeString(taskObject.dateManualTime[colName.fullDate],'update') : 0}}
                                                    <img class="d-block m3px-auto" v-if="taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate]  == 2" :src="purple_line"/>
                                                </DropDownOption>
                                            </div>
                                        </template>
                                    </DropDown>
                                </span>
                                <span class="project__finalestimate-fulldate">
                                    {{ taskObject?.taskFinalEstimate ? Object.keys(taskObject?.taskFinalEstimate).includes(colName?.fullDate) ? getConvertedTimeString(taskObject?.taskFinalEstimate[colName?.fullDate],'update') : '' : ''}}
                                </span>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <TaskDetail
            v-if="isTaskDetail"
            :companyId="taskDetailOpenObject.CompanyId"
            :projectId="taskDetailOpenObject.ProjectID"
            :sprintId="taskDetailOpenObject.sprintId"
            :taskId="taskDetailOpenObject.id"
            :isTaskDetailSideBar="isTaskDetail"
            @toggleTaskDetail="toggleTaskDetail"
        />
        <LogTimeDetail v-if="isLogTimeOpen" @isSClose="(val) => {isLogTimeOpen = !val}" :date="colData" :userData="userObj" :projectData="projectObjectData" :taskData="taskDataLogView" />
</template>
<script setup>
    import { ref , defineProps, nextTick, provide} from 'vue';
    import { getConvertedTimeString } from '@/composable/commonFunction';
    import { useRouter, useRoute } from 'vue-router';
    import TaskDetail from '@/views/TaskDetail/TaskDetail.vue'
    import LogTimeDetail from '@/components/atom/TimesheetView/LogDetailView/UserLogDetailView/LogDetailView.vue'
    import DropDown from '@/components/molecules/DropDown/DropDown.vue';
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
     const rowOpen = ref(false);
    const router = useRouter();
    const route = useRoute();
    const colData = ref();
    const taskDataLogView = ref({});
    const isLogTimeOpen = ref(false);
    const emit = defineEmits(["update:getTaskData"]);
    const isOpen = ref();
    const table_arrow = ref(require("@/assets/images/table_arrow.png"))
    const logk_icon = ref(require("@/assets/images/timesheetcloseProject.png"))
    const isTaskDetail = ref(false);
    const taskDetailOpenObject = ref({});
    const props = defineProps({
        projectData: {type: Object},
        modelValue : {
            type : Array,
            default : ()=>([])
        },
        tableStyle : {
            type : Object,
            default : ()=>({})
        },
        activeWeekObject : {
            type : Object,
            default:()=>({})
        },
        userData : {
            type : Object,
            default:()=>({})
        }
    });
    const purple_line = require('@/assets/images/svg/purple_line.svg');
    const green_line = require('@/assets/images/svg/green_line.svg');
    const projectObjectData = ref(props.projectData);
    const userObj = ref(props.userData);
    const themodelValue = ref(props.modelValue);
    const toggleTask = (projectData) => {
        if (projectObjectData.value.status !== 'close' && (projectObjectData.value.deletedStatusKey == 0 || projectObjectData.value.deletedStatusKey == undefined)) {
            isOpen.value = !isOpen.value;
            if (isOpen.value) {
                getTaskData(projectData)
                rowOpen.value = true;
            } else {
                rowOpen.value = false;
            }
        }
    }
    const convertedTimeString = (n, type)=>{
        return getConvertedTimeString(n,type);
    }
    const taskDetailOpen = (taskData) => {
        taskDetailOpenObject.value = {}
        isTaskDetail.value = true;
        taskDetailOpenObject.value.CompanyId = taskData.CompanyId;
        taskDetailOpenObject.value.ProjectID = taskData.ProjectID;
        taskDetailOpenObject.value.sprintId = taskData.sprintId;
        taskDetailOpenObject.value.id = taskData._id;

    }
    const toggleTaskDetail = (task,close=false) => {
        isTaskDetail.value = false;
        if(close == true) {
            router.push({...route,query: {}})
            return;
        }
        taskDetailOpenObject.value ={};
        nextTick(()=>{
            router.push({...route,query: {detailTab: "task-detail-tab"}})
            taskDetailOpen(task);
        })
    }
    provide('toggleTaskDetail', toggleTaskDetail);
    provide('showArchived', ref(false));
    provide('isSupport', ref(false));
    provide('isRouteRequired', false);
    const projectPush = () => {
        router.push({
            name: "Project",
            params: {
                cid: projectObjectData.value.CompanyId,
                id: projectObjectData.value._id
            }
        })
    }
    const getTaskData = (projectData) => {
          if (isOpen.value) {        
            if (projectData.activitiesArray.length == 0) {
                emit("update:getTaskData",projectData,(cb)=>{
                    projectData = cb.data;
                });
            }
        }
    }
    const openLogSetailSideBar = (isOpen,data,key,taskObj) => {
        if (isOpen) {
            if (Object.keys(projectObjectData.value.projectFinalLogs).includes(data.fullDate)) {
                if (key == 'task') {
                    taskDataLogView.value = taskObj
                } else {
                    taskDataLogView.value = {}
                }
                colData.value = data.mainDate;
                isLogTimeOpen.value = true;
            }
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
.project__finalestimate-fulldate{
    line-height:38px;
}
</style>