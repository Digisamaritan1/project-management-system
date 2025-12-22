<template>
       <tr class="open_project_data">
            <td :colspan="tableStyle.colspanCount" class="p-0">
                <table class="table" v-bind:class="[{ 'isWeeked': activeWeekObject.isWeeked,'isOneday': activeWeekObject.isOneday,
                    'isTwoday': activeWeekObject.isTwoday,'isThreeday': activeWeekObject.isThreeday,'isFourday': activeWeekObject.isFourday,
                    'isFiveday': activeWeekObject.isFiveday,
                    'isSixday': activeWeekObject.isSixday}]" :style="[{'width': tableStyle.tableWidth}]">
                    <tr v-for="taskObject in projectObjectData[userData.id]" :key="taskObject.id">
                        <td class="fixed p-0">
                            <div class="d-flex align-items-center">
                                <div class="projectSubTask"> {{ taskObject.TaskName }}</div>
                                <div> <span v-show="taskObject.deletedStatusKey == undefined || taskObject.deletedStatusKey == 0"  class="blue text-decoration-underline cursor-pointer" @click="toggleTaskDetail(taskObject)">{{ taskObject.TaskKey }}</span></div>
                                <div class="inner_div displayRate d-flex">
                                    <span class="bg-transparent pt-5px position-re coverted__time-string">
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
                                                    <DropDownOption class="font-weight-700 font-size-12 d-block converted__total-task">
                                                        {{taskObject.totalTaskTrackedLogMin ? convertedTimeString(taskObject.totalTaskTrackedLogMin,'update') : 0}}
                                                        <img class="d-block m3px-auto" v-if="taskObject.totalTaskTrackedLogMin" :src="green_line" />
                                                    </DropDownOption>
                                                    <DropDownOption class="font-weight-700 font-size-12 d-block converted__timestring-dropdown">
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
                                <span class="bg-transparent pt-5px position-re coverted__time-string" :class="{'cursor-pointer': taskObject?.taskFinalLogs ?  Object.keys(taskObject.taskFinalLogs).includes(colName.fullDate): false }" @click="openLogSetailSideBar(taskObject?.taskFinalLogs ?  Object.keys(taskObject.taskFinalLogs).includes(colName.fullDate): false,colName,'task',taskObject)">
                                    {{taskObject?.taskFinalLogs ?  Object.keys(taskObject.taskFinalLogs).includes(colName.fullDate) ? convertedTimeString(taskObject.taskFinalLogs[colName.fullDate],'update') : '' : ''}}
                                    <div class="logType__Img--show" v-if="Object.keys(taskObject.dateLogsType).includes(colName.fullDate)">
                                        <img v-if="taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2" :src="green_line"/>&nbsp;
                                        <img v-if="taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate] == 2" :src="purple_line"/>
                                    </div>
                                    <DropDown v-if="(taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2) && (taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate] == 2)" class="p-0 tracktime_dropdown" :bodyClass="{'tracktime_dropdown_wrapper' : true}" :hover="true">
                                        <template #button>
                                            <div class="logType__Img--show p-0">
                                                <img v-if="taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2" :src="green_line"/>&nbsp;
                                                <img v-if="taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate] == 2" :src="purple_line"/>
                                            </div>
                                        </template>
                                        <template #options>
                                            <div class="d-flex track-option-wrapper">
                                                <DropDownOption class="font-weight-700 font-size-12 d-block converted__total-task">
                                                    {{(taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2) ? convertedTimeString(taskObject.dateTrackTime[colName.fullDate],'update') : 0}}
                                                    <img class="d-block m3px-auto" v-if="taskObject.dateLogsType[colName.fullDate] == 1 || taskObject.dateLogsType[colName.fullDate] == 2" :src="green_line" />
                                                </DropDownOption>
                                                <DropDownOption class="font-weight-700 font-size-12 d-block converted__timestring-dropdown">
                                                    {{taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate] ? convertedTimeString(taskObject.dateManualTime[colName.fullDate],'update') : 0}}
                                                    <img class="d-block m3px-auto" v-if="taskObject.dateLogsType[colName.fullDate] == 0 || taskObject.dateLogsType[colName.fullDate] == 2" :src="purple_line"/>
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
    import { ref , defineProps,inject} from 'vue';
    import { getConvertedTimeString } from '@/composable/commonFunction';
    import TaskDetail from '@/views/TaskDetail/TaskDetail.vue'
    import LogTimeDetail from '@/components/atom/TimesheetView/LogDetailView/UserLogDetailView/LogDetailView.vue'
    import DropDown from '@/components/molecules/DropDown/DropDown.vue';
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
    const colData = ref();
    const taskDataLogView = ref({});
    const isLogTimeOpen = ref(false);
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
    const toggleTaskDetail = inject('toggleTaskDetail')
    const themodelValue = ref(props.modelValue);
    const convertedTimeString = (n, type)=>{
        return getConvertedTimeString(n,type);
    }
    const openLogSetailSideBar = (isOpen,data,key,taskObj) => {
        if (isOpen) {
            // if (Object.keys(projectObjectData.value.projectFinalLogs).includes(data.fullDate)) {
                if (key == 'task') {
                    taskDataLogView.value = taskObj
                } else {
                    taskDataLogView.value = {}
                }
                colData.value = data.mainDate;
                isLogTimeOpen.value = true;
            // }
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
.coverted__time-string{
    line-height: 28px;
}
.converted__total-task{
    margin:0 auto;
    background-color: #fff!important;
    color:#3E3E3E!important;
    padding: 0px 7px!important;
    border-right: 1px solid #ececec;
    border-radius: 0px!important;
}
.converted__timestring-dropdown{
    margin:0 auto;
    background-color: #fff!important;
    color:#3E3E3E!important;
    padding: 0px 7px!important;
}
.project__finalestimate-fulldate{
    line-height:38px;
}
</style>