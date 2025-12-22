<template>
    <div class="w-100 h-100 overflow-y-auto" v-if="checkPermission('project') !== null && checkPermission('project.project_list') !== null && checkPermission('task.task_list') !== null">
        <div class="bg-timesheet-title px-1 d-flex white align-items-center justify-content-between p-15px border-gray">
            <div><h3 class="m-0 font-size-18 font-weight-700 blue">{{ $t('Home.Home') }}</h3> </div>
            <div class="dashboard__calendar-wrapper">
                <span class="cursor-pointer"><img :src="showCalender == true ? dashboardCalendar : dashboardCalendar2" @click="showCalender = !showCalender"/></span>
                <!-- <span class="ml-10px cursor-pointer"><img :src="dashboardScreenActivity" /></span>     -->
            </div>
        </div>
        <div class="d-flex main_component-wrapper" :class="[{'flex-column' : clientWidth <= 991}]">
            <div class="d-flex flex-column w-100 overflow-hidden overflow-y-scroll dashboard__left style-scroll" :style="[{'width': showCalender === true ? '55.8%' : '100%'}]">
                <div class="">
                    <QueueListComponent @openTaskDetail="(taskData)=>{openInNewTab(taskData)}"/>
                </div>
                <div class="home-maincomponent pt-3px" :style="[{'maxWidth': showCalender === true ? '100%' : '100%'}]">
                    <h2 class="font-size-22 font-weight-500 black font-roboto-sans m-0 mb-15px">{{ $t('Home.My_Work') }}</h2>
                    <div class="border-bottom-serach">
                        <ul class="m-0 p-0 d-flex">
                            <li class="cursor-pointer font-size-14 GunPowder position-re pb-3px mr-40px home__component-li" :class="[{'active__tab font-weight-500 blue' : activeTab == 'todo' }]" @click="activeTab = 'todo'">{{ $t('Home.To_Do') }}</li>
                            <li class="cursor-pointer font-size-14 GunPowder position-re pb-3px home__component-li" :class="[{'active__tab font-weight-500 blue' : activeTab == 'done' }]"  @click="activeTab = 'done'">{{ $t('Home.Done') }}</li>
                        </ul>
                    </div>
                    <div v-if="activeTab == 'todo'" class="pt-10px">
                        <template v-if="separateArrays && Object.keys(separateArrays).length">
                            <MainLabledComponent
                                :isLoading="loading['Today']" 
                                :isFetching="sortLoading['Today']" 
                                :isDragValue="isDrag" 
                                @openTaskDetail="(taskData)=>{openInNewTab(taskData)}"
                                :separateArrays="separateArrays"
                                :key="'Today'"
                                :totalTask="separateArrays['Today']?.count"
                                :lable="$t(`Home.Today`)"
                                :taskArray="separateArrays['Today']?.value"
                                :allProjectsArray="allProjectsArray"
                                @update:dataToGrandparent="getDataOnDueDateChange"
                                @dataToGrandparentScrool="(data,sort)=>scrollFunction(data,sort)"
                            />
                            <MainLabledComponent
                                :isLoading="loading['Overdue']" 
                                :isFetching="sortLoading['Overdue']" 
                                :isDragValue="isDrag" 
                                @openTaskDetail="(taskData)=>{openInNewTab(taskData)}"
                                :separateArrays="separateArrays"
                                :key="'Overdue'"
                                :totalTask="separateArrays['Overdue']?.count"
                                :lable="$t(`Home.Overdue`)"
                                :taskArray="separateArrays['Overdue']?.value"
                                :allProjectsArray="allProjectsArray"
                                @update:dataToGrandparent="getDataOnDueDateChange"
                                @dataToGrandparentScrool="(data,sort)=>scrollFunction(data,sort)"
                                @update:dateSort="(label,sort)=>{sortDueDate(label,sort)}"
                            />
                            <MainLabledComponent
                                :isLoading="loading['Next']" 
                                :isFetching="sortLoading['Next']" 
                                :isDragValue="isDrag" 
                                @openTaskDetail="(taskData)=>{openInNewTab(taskData)}"
                                :separateArrays="separateArrays"
                                :key="'Next'"
                                :totalTask="separateArrays['Next']?.count"
                                :lable="$t(`Home.Next`)"
                                :taskArray="separateArrays['Next']?.value"
                                :allProjectsArray="allProjectsArray"
                                @update:dataToGrandparent="getDataOnDueDateChange"
                                @dataToGrandparentScrool="(data,sort)=>scrollFunction(data,sort)"
                                @update:dateSort="(label,sort)=>{sortDueDate(label,sort)}"
                            />
                            <MainLabledComponent
                                :isLoading="loading['Unscheduled']" 
                                :isFetching="sortLoading['Unscheduled']" 
                                :isDragValue="isDrag" 
                                @openTaskDetail="(taskData)=>{openInNewTab(taskData)}"
                                :separateArrays="separateArrays"
                                :key="'Unscheduled'"
                                :totalTask="separateArrays['Unscheduled']?.count"
                                :lable="$t(`Home.Unscheduled`)"
                                :taskArray="separateArrays['Unscheduled']?.value"
                                :allProjectsArray="allProjectsArray"
                                @update:dataToGrandparent="getDataOnDueDateChange"
                                @dataToGrandparentScrool="(data,sort)=>scrollFunction(data,sort)"
                            />
                        </template>
                    </div>
                    <div v-if="activeTab == 'done'" class="pt-10px">
                        <div v-if="allProjectsArray.length && separateArrays && Object.keys(separateArrays).length">
                            <MainLabledComponent :isLoading="loading[data.lable]" :isFetching="sortLoading[data.lable]" v-for="(data) in Object.fromEntries(Object.entries(separateArrays).filter(([key]) => key.includes('Done')))" @openTaskDetail="(taskData)=>{openInNewTab(taskData)}" :separateArrays="separateArrays" :key="data.label" :totalTask="data.count" :lable="$t(`Home.${data.lable}`)" :taskArray="data.value" :allProjectsArray="allProjectsArray" @update:dataToGrandparent="getDataOnDueDateChange" @dataToGrandparentScrool="(data,sort)=>scrollFunction(data,sort)" @update:dateSort="(label,sort)=>{sortDueDate(label,sort)}"/>
                        </div>
                        <div class="text-center" v-else>
                            {{ $t('Home.no_task_found') }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-100 dashboard__right style-scroll" :class="[{'bg-light-gray': (clientWidth < 992 && isSpinner == false) || clientWidth >= 992}]">
                <template v-if="separateArrays && Object.keys(separateArrays).length && showCalender">
                    <CalendarComponent @openTaskDetail="(taskData)=>{openInNewTab(taskData)}" :allProjectsArray="allProjectsArray" :updatedObject="updatedObject" @hideCalender="(value)=>{showCalender = value}"/>
                </template>
            </div>
        </div>
        <TaskDetail
            v-if="isTaskDetail"
            :companyId="companyId"
            :projectId="projectId"
            :sprintId="sprintId"
            :taskId="taskId"
            :isTaskDetailSideBar="isTaskDetail"
            @toggleTaskDetail="toggleTaskDetail"
            :zIndex='5'
        />
    </div>
    <div v-else class="d-flex bg-light-gray align-items-center justify-content-center w-100 h-100">
        <img :src="accessDeniedImage" alt="accessDenied">
    </div>
     <ConfirmModal
        :modelValue="showSidebar"
        :acceptButtonText="$t('Home.Confirm')"
        :cancelButtonText="$t('Projects.cancel')"
        :header="true"
        :showCloseIcon="false"
        @accept="updateTourStatusInUser"
        @close="closeModal"
    >
        <template #header>
            <h3 class="m-0">{{ $t('Home.Confirm') }}</h3>
        </template>
        <template #body>
            <span>{{ $t('Home.tourclose') }}</span>
        </template>
    </ConfirmModal>
</template>
<script setup>
import { defineComponent ,ref,inject,computed,onMounted,provide, nextTick} from "vue";
import { useCustomComposable } from '@/composable';
import { useGetterFunctions } from "@/composable/index.js";
import { apiRequest, apiRequestWithoutCompnay } from '@/services';
import * as env from '@/config/env';
import { useRouter } from 'vue-router';
const { getters,dispatch } = useStore();
import { useStore } from 'vuex';
const { checkPermission } = useCustomComposable();
const clientWidth = inject("$clientWidth");
const companyUserDetail = computed(() => getters["settings/companyUserDetail"]);
const projectsGetter = computed(() => getters["projectData/onlyActiveProjects"]);
const accessDeniedImage = require("@/assets/images/access_denied_img.png");
const loading = ref({ "Today": false, "Overdue": false, "Next": false, "Unscheduled": false, "Done": false });
const sortLoading = ref({ "Today": true, "Overdue": true, "Next": true, "Unscheduled": true, "Done": true });
const dashboardCalendar = require('@/assets/images/svg/dashboardCalendar.svg')
const dashboardCalendar2 = require('@/assets/images/svg/dashboard_Calendar.svg')
const allProjectsArrayFilter = ref(JSON.parse(JSON.stringify(projectsGetter.value)));
import TaskDetail from '@/views/TaskDetail/TaskDetail.vue';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import ConfirmModal from '@/components/atom/Modal/Modal.vue';

const companyId = inject("$companyId");
const userId = inject("$userId");
const separateArrays = ref({});
const allProjectsArray = ref([]);
const ProjectIdArray = ref([]);
const activeTab = ref('todo');
const isSpinner = ref(false);
const isDrag = ref(false);
const isTaskDetail = ref(false);
const showCalender = ref(true);
const timer = ref(null);
const memorizationArray = ref([]);
const router = useRouter();
const updatedObject = ref({});
const projectId = ref('');
const sprintId = ref('');
const taskId = ref('');
const {getUser} = useGetterFunctions();
const scrollStop = ref(false);
const hasCompletedTour = ref(false);
const showSidebar = ref(false)
const driverObj = driver({
  popoverClass: 'driverjs-theme',
  showProgress: true,
  overlayColor: 'black',
  showButtons: ['next', 'previous','close'],
  disableActiveInteraction : true,
  smoothScroll: true,
  steps: [
    { element: '#addqueue', popover: { title: 'Create Queue', description: 'Here you can add queue task', side: "left", align: 'start' }},
    { element: '#queuelist', popover: { title: 'Queue Tasks', description: 'Here you can see queue list', side: "left", align: 'start' }},
    { element: '#TodaySection', popover: { title: 'Today Task', description: 'Here you can see today tasks', side: "left", align: 'start' }},
    { element: '#OverdueSection', popover: { title: 'Overdue Task', description: 'Here you can see overdue tasks', side: "left", align: 'start' }},
    { element: '#NextSection', popover: { title: 'Next Task', description: 'Here you can see next tasks', side: "left", align: 'start' }},
    { element: '#UnscheduledSection', popover: { title: 'Unscheduled Task', description: 'Here you can see unscheduled tasks', side: "left", align: 'start' }},
    { element: '#calenderSection', popover: { title: 'Calender', description: 'Here you can see Calender', side: "left", align: 'start' }},
    { element: '#calenderDatesSection', popover: { title: 'Calender Date Change', description: 'Here you can changes date of calender', side: "left", align: 'start' }},
    { popover: { title: 'Discover Alien Hub: A Journey into the Unknown.', description: "Let's embark on an exciting journey! Explore the boundless possibilities waiting to be discovered." } }
  ],
  onCloseClick: () => closeButtonClick(),
  onDestroyStarted: () => {
    if (!driverObj.hasNextStep()) {
        updateTourStatusInUser();
        driverObj.destroy();
    }
  },
});
const closeButtonClick = () => {
    hasCompletedTour.value = true;
    showSidebar.value = true
    driverObj.destroy();
}
const closeModal = () => {
    showSidebar.value = false
}
const updateTourStatusInUser = () => {
    try {
        let tourObject = {
            ...(getUser(userId.value).tourStatus && getUser(userId.value).tourStatus),
            isDashboardTourComplete: true
        }
        const updateObject = {
            $set: { tour: tourObject } 
        }
        showSidebar.value = false;
        apiRequestWithoutCompnay("put",env.USER_UPATE,{
            userId: userId.value,
            updateObject: updateObject,
        }).then(()=>{
        }).catch((err)=>{
            console.error("ERROR: ", err);
        });
    } catch (error) {
        console.error(error.message);
    }
}
defineComponent({
    name: "HomeView",
})
onMounted(() => {
    if(companyId.value== '' && getUser(userId.value).assigneeCompany.length === 0){
        router.replace({name: "Create_Company"});
    } else{
        getData();
    }
    // setTimeout(()=>{
    //     if(getUser(userId.value)?.tourStatus?.isDashboardTourComplete === false || getUser(userId.value)?.tourStatus == undefined || Object.keys(getUser(userId.value)?.tourStatus).length == 0) {
    //         driverObj.drive();
    //     }
    // },1000)
});
const dataArray = ref([
    {
        currentTaskCount:0,
        TodayPageNumber: 0,
        lable: 'Today',
        typeSenseQuery:{
            statusType:['default_active','active','done'],
            dueDate:{
                DueDate:{
                    dbDate: {
                        $gte:parseInt(new Date(new Date().setHours(0,0,0)).getTime()),
                        $lte:parseInt(new Date(new Date().setHours(23,59,59)).getTime())
                    }
                }
            },
            sortBy:-1
        },
        id: 'Today'
    },
    {
        currentTaskCount:0,
        OverduePageNumber: 0,
        lable: 'Overdue',
        typeSenseQuery:{
            statusType:['default_active','active','done'],
            dueDate:{
                DueDate:{
                    dbDate: {
                        $lte:parseInt(new Date(new Date().setHours(0,0,0)).getTime())
                    }
                }
            },
            sortBy:-1
        },
        id: 'Overdue'
    },
    {
        currentTaskCount:0,
        NextPageNumber: 0,
        lable: 'Next',
        typeSenseQuery:{
            statusType:['default_active','active','done'],
            dueDate:{
                DueDate:{
                    dbDate: {
                        $gte:parseInt(new Date(new Date().setHours(23,59,59)).getTime())
                    }
                }
            },
            sortBy:1
        },
        id: 'Next'
    },
    {
        currentTaskCount:0,
        UnscheduledPageNumber: 0,
        lable: 'Unscheduled',
        typeSenseQuery:{
            statusType:['default_active','active','done'],
            dueDate:{
                DueDate:{
                    $in:[null,'','_undefined_']
                }
            },
        },
        id: 'Unscheduled'
    },
    {
        currentTaskCount:0,
        DonePageNumber: 0,
        lable: 'Done',
        typeSenseQuery:{
            statusType:['close'],
            sortBy:-1
        },
        id: 'Done'
    }
])

async function executeQuery (typeSenseQuery, customSortBy, label, labelToUpdate) {
    let sortValue = false;
    loading.value[label] = true;

    let sortBy = {};
    if (customSortBy !== null) {
        if(typeSenseQuery.sortBy !== undefined) {
            if(label.toLowerCase() === 'today') {
                sortBy = {'DueDate': -1};
            } else {
                sortBy = {'DueDate': customSortBy};
                if (labelToUpdate === label && separateArrays.value[label] && Object.keys(separateArrays.value[label]).length !== 0) {
                    if(separateArrays.value[label].value.length == 0) {
                        sortValue = true;
                        resetLabelPageNumbers(label);
                    }
                }
            }
        }
    } else if (label.toLowerCase() !== 'unscheduled' && typeSenseQuery.sortBy !== undefined) {
        sortBy = {'DueDate': typeSenseQuery.sortBy};
    }

    const pageNumber = getLabelPageNumber(label);
    let searchResult = {
        $match: {
            $and: [
                {
                    ProjectID: {objId: { $in: ProjectIdArray.value}},
                    AssigneeUserId : { $in: [userId.value] },
                    statusType: {$in : typeSenseQuery.statusType},
                    deletedStatusKey: { $in: ['_undefined_', 0] },
                    ...(label && label !== 'Done' && {
                        ...typeSenseQuery.dueDate
                    }),
                }
            ],
        },
    }
    let sprintLookup = {
        $lookup: {
            from: 'sprints',
            localField: 'sprintId',
            foreignField: '_id',
            as: 'sprintArray',
            pipeline: [
                {
                    $project: {
                        name: 1,
                        folderId:1
                    }
                }
            ],
        }
    }
    let folderLookup = {
        $lookup: {
            from: 'folders',
            localField: 'folderObjId',
            foreignField: '_id',
            as: 'folderArray',
            pipeline: [
                {
                    $project: {
                        name: 1
                    }
                }
            ],
        }
    }
    let sprintUnwind = {
        $unwind: '$sprintArray'
    }
    let folderUnwind = {
        $unwind: { path: '$folderArray', preserveNullAndEmptyArrays: true }
    }
    let nextData = pageNumber * 10;
    const query = [
        {
            $facet: {
                "results": [
                    searchResult,
                    sprintLookup,
                    folderLookup,
                    sprintUnwind,
                    folderUnwind,
                    {
                        $sort: { ...sortBy,_id:1 }
                    },
                    {
                        $skip: nextData,
                    },
                    {
                        $limit: 10,
                    },
                ],
            }
        },
    ]

    query[0].$facet = {...query[0].$facet,count:[] }
    query[0].$facet.count.push(
        searchResult,
        sprintLookup,
        folderLookup,
        sprintUnwind,
        folderUnwind,
        { $count: "count" }
    );

    try {
        apiRequest('post',`${env.TASK}/find`,{findQuery: query, replaceUndefined: true}).then((response) => {
            if(response.status === 200){
                let taskArray = response.data[0].results;
                let taskCount = response.data[0]?.count[0]?.count ?? 0;
                if(!taskCount){
                    taskCount = 0;
                }
                updateSeparateArrays(label, taskArray,sortValue);
                updateManageCount(label, taskCount);
                setTimeout(()=>{
                    sortLoading.value[label] = false;
                },1000)
                setTimeout(() => {
                    isSpinner.value = false; 
                    loading.value[label] = false;
                    scrollStop.value = false;
                })
            } else {
                console.error(`ERROR: ${response.status} - ${response.data.message}`);
            }
        })

    } catch (error) {
        isSpinner.value = false;
        scrollStop.value = false;
        loading.value[label] = false;
        sortLoading.value[label] = false;
        separateArrays.value[label] = { value: [], lable: label, count: 0 };
        console.error(`ERROR in search tasks for label ${label}:`, error);
    }
}
async function searchDynamicTypesenseTasks(labelToUpdate = null, customSortBy = null) {
    if(labelToUpdate == null) {
        for (const item of dataArray.value) {
            const label = item.lable;
            const typeSenseQuery = item.typeSenseQuery;

            if (labelToUpdate !== null && labelToUpdate !== label) {
                continue;
            }
            await executeQuery(typeSenseQuery, customSortBy, label, labelToUpdate)
        }
    } else {
        const updateIndex = dataArray.value.findIndex((x) => labelToUpdate === x.lable);

        if(updateIndex !== -1) {
            const {typeSenseQuery, lable} = dataArray.value[updateIndex];
            await executeQuery(typeSenseQuery, customSortBy, lable, labelToUpdate)
        }
    }
}
const getSubTaskData = async (id1) => {
    const query = [
        {
            "$match": {
                objId: {
                    _id: id1
                }
            }
        }
    ];

    const findIndex = memorizationArray.value.findIndex((ele) => ele._id === id1);
    if (findIndex === -1) {
        try {
            const response = await apiRequest('post', `${env.TASK}/find`, { findQuery: query });
            if (response.status === 200) {
                memorizationArray.value.push({ ...response.data[0] });
                return { ...response.data[0] };
            } else {
                console.error(`ERROR: ${response.status} - ${response.data.message}`);
                return null;
            }
        } catch (error) {
            console.error("Error fetching subtask data:", error);
            return null;
        }
    } else {
        return memorizationArray.value[findIndex];
    }
};

const getNameOfParentTask = async (id) => {
    if (id && id !== "") {
        for (const value in separateArrays.value) {
            const value1 = separateArrays.value[value].value.filter((e) => e._id == id);
            if (value1 && value1.length) {
                return value1[0];
            }
        }

        try {
            const valueSub = await getSubTaskData(id);
            if (valueSub) {
                return valueSub;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting subtask data:", error);
            return null;
        }
    } else {
        return null;
    }
};


function resetLabelPageNumbers(label) {
    separateArrays.value[label] = { value: [], lable: label, count: 0 };
    const labelPageNumberKey = label + 'PageNumber';
    dataArray.value.find(item => item.lable === label)[labelPageNumberKey] = 0;
    dataArray.value.find(item => item.lable === label)['taskCount'] = 0;
    dataArray.value.find(item => item.lable === label)[label +'taskCount'] = 0;
}

function getLabelPageNumber(label) {
    return dataArray.value.find(item => item.lable === label)[label + 'PageNumber'];
}

async function updateSeparateArrays(label, hits,sortValue) {
    if(sortValue) {
        separateArrays.value[label] = { value: [], lable: label, count: 0 };
    }
    if (!separateArrays.value[label]) {
        separateArrays.value[label] = { value: [], lable: label, count: 0 };
    }
    if(hits.length) {
        if(separateArrays.value[label] && Object.keys(separateArrays.value[label]).length !== 0 && separateArrays.value[label].value.length !== 0) {
            const uniqueIds = new Set(separateArrays.value[label].value.map(x => x._id));
            const uniqueDocuments = hits.filter(x => !uniqueIds.has(x._id));
            separateArrays.value[label].value.push(...uniqueDocuments.map(x => ({ ...x, collectionType: 'task' })));
        } else {
            separateArrays.value[label] = { value: [], lable: label, count: 0 };
            separateArrays.value[label].value.push(...hits.map(x => ({ ...x, collectionType: 'task' })));
        }
        let count = 0
        const updateTask = async(ele) => {
            if(count >= separateArrays.value[label].value.length) {
                return;
            } else {
                if(ele.parentTaskName == undefined && !ele.isParentTask) {
                    let dataVar = await getNameOfParentTask(ele.ParentTaskId)
                    ele.parentTaskName = dataVar ? `/ ${dataVar?.TaskName}` : '';
                    count++;
                    updateTask(separateArrays.value[label].value[count])
                } else {
                    count++;
                    updateTask(separateArrays.value[label].value[count])
                }
            }
        }
        updateTask(separateArrays.value[label].value[count])
    }
}


function updateManageCount(label, found) {
    const manageCountItem = dataArray.value.find(item => item.lable === label);
    if(separateArrays.value[label]) {
        separateArrays.value[label].count = found;
    }
    manageCountItem[label + 'PageNumber'] = manageCountItem[label + 'PageNumber'] + 1;
}

const getDataOnDueDateChange = (ele,taskId,lable,sort,olddateval = null) => {
    updatedObject.value = taskId;
    if(lable !== 'Done') {
        if(olddateval == null) {
            const oldDate = getDateLabel(0);
            const newDate = getDateLabel(new Date(ele).getTime()/1000);
            moveTasksToNewLabel(oldDate,newDate,taskId,sort).catch((error)=>{
                console.error(error);   
            })
        } else {
            const oldDate = getDateLabel(new Date(olddateval).getTime()/1000);
            const newDate = getDateLabel(new Date(ele).getTime()/1000);
            moveTasksToNewLabel(oldDate,newDate,taskId,sort).catch((error)=>{
                console.error(error);   
            })
        }
    }
}
function insertClosest(array, newObject,sort) {
    let closestIndex = -1;
    let closestDiff = Infinity;

    for (let i = 0; i < array.length; i++) {
        let checkDiff = newObject.DueDate ? new Date(newObject.DueDate).getTime()/1000 : 0;
        let checkDiffDate = array[i].DueDate ? new Date(array[i].DueDate).getTime()/1000 : 0;
        const diff = parseInt(checkDiff - checkDiffDate);
        if (diff < closestDiff) {
            closestDiff = diff;
            closestIndex = i;
        }
    }
    if (closestIndex === -1) {
        array.push(newObject);
    } else {
        if(sort !== 1) {
            let fIndex = array.findIndex((e)=>e._id == newObject._id)
            if(fIndex === -1) {
                array.splice(closestIndex + 1, 0, newObject);
            } else {
                array.splice(fIndex, 1, newObject);
            }
        } else {
            let fIndex = array.findIndex((e)=>e._id == newObject._id)
            if(fIndex === -1) {
                array.splice(closestIndex, 0, newObject);
            } else {
                array.splice(fIndex, 1, newObject);
            }
        }
    }
}
function moveTasksToNewLabel(previousLabel, newLabel, taskIdsToMove,sort) {
    return new Promise((resolve, reject) => {
        try {
            let fIndex = JSON.parse(JSON.stringify(separateArrays.value[newLabel].value)).findIndex((e)=>e._id == taskIdsToMove._id)
            insertClosest(separateArrays.value[newLabel].value, taskIdsToMove,sort);
            if(newLabel !== previousLabel) {
                if(fIndex == -1) {
                    separateArrays.value[newLabel].count = parseInt(separateArrays.value[newLabel].count) + 1;
                }
            }
            if(newLabel !== previousLabel) {
                const prevLabelData1 = dataArray.value.find(item => item.lable === previousLabel);
                prevLabelData1.currentTaskCount++;
                if(prevLabelData1.currentTaskCount >=10) {
                    prevLabelData1.currentTaskCount = 0
                    prevLabelData1[previousLabel + 'PageNumber'] = Math.max(1, prevLabelData1[previousLabel + 'PageNumber'] - 1);
                } 
    
                const newLabel1 = dataArray.value.find(item => item.lable === newLabel);
                newLabel1.currentTaskCount++;
                if(newLabel1.currentTaskCount >= 10) {
                    newLabel1.currentTaskCount = 0
                    newLabel1[newLabel + 'PageNumber'] = Math.max(1, newLabel1[newLabel + 'PageNumber'] + 1);
                }
            }
            let findIndex = separateArrays.value[previousLabel].value.findIndex((ele) => ele._id === taskIdsToMove._id);
            if (findIndex !== -1) {
                separateArrays.value[previousLabel].value.splice(findIndex, 1);
                if(newLabel !== previousLabel) {
                    separateArrays.value[previousLabel].count = parseInt(separateArrays.value[previousLabel].count) - 1;
                }
            }
            if(separateArrays.value[previousLabel].value.length == 9 && separateArrays.value[previousLabel].count - separateArrays.value[previousLabel].value.length > 0) {
                searchDynamicTypesenseTasks(previousLabel);
            }

            resolve();
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

function sortDueDate(lable,sort) {
    sortLoading.value[lable] = true;
    scrollStop.value = true;
    separateArrays.value[lable] = { value: [], lable: lable, count: 0 };
    debouncer(50).then(() => {
        searchDynamicTypesenseTasks(lable,sort);
    })
}
function debouncer(timeout = 1000) {
    return new Promise((resolve) => {
        if(timer.value) {
            clearTimeout(timer.value);
        }
        timer.value = setTimeout(() => {
            resolve();
        }, timeout);
    })
}
function getDateLabel(inputDate) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime() / 1000;
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime() / 1000;
    if (inputDate > todayEnd && inputDate !== 0) {
        return "Next";
    } else if (inputDate < todayStart && inputDate !== 0) {
        return "Overdue";
    } else if(inputDate > todayStart && inputDate <= todayEnd && inputDate !== 0) {
        return "Today";
    } else {
        return "Unscheduled";
    }
}
function scrollFunction(lable,sort) {
    if(scrollStop.value === false){
        searchDynamicTypesenseTasks(lable,sort)
    }
}
const {getTeamsData} = useGetterFunctions();

const getData = () => {
    isSpinner.value = true;
    if(!projectsGetter.value || !Object.keys(projectsGetter.value).length) {
        getTeamsData().then((response) => {
            const uid = userId.value;
            const filterteam = response.filter((x) => x.assigneeUsersArray.indexOf(uid) !== -1);
            const teamIds = filterteam.map((x) => 'tId_'+x._id);
            let publicQuery = {
                isPrivateSpace:false
            }
            if(companyUserDetail.value.roleType !== 1 && companyUserDetail.value.roleType !== 2 && !getters["settings/rules"].toggle.showAllProjects) {
                publicQuery.AssigneeUserId = {
                    $in:[uid]
                }
                if (teamIds && teamIds.length) {
                    publicQuery.AssigneeUserId.$in = [...publicQuery.AssigneeUserId.$in.concat(teamIds)]
                }
            }
            let privateQuery = {
                isPrivateSpace:true
            }
            if(companyUserDetail.value.roleType !== 1 && companyUserDetail.value.roleType !== 2) {
                privateQuery.AssigneeUserId = {
                    $in:[uid]
                }
                if (teamIds && teamIds.length) {
                    privateQuery.AssigneeUserId.$in = [...privateQuery.AssigneeUserId.$in.concat(teamIds)]
                }
            }
            const roleType = companyUserDetail.value.roleType;
            
            if(checkPermission('project.project_list') !== null) {
                dispatch("projectData/setProjects", {
                    ...(checkPermission("project.public_projects") === true ? publicQuery : {}),
                    restrictPublic: checkPermission("project.public_projects") !== true,
                    privateQuery,
                    roleType,
                    uid
                }).then(()=>{
                    allProjectsArray.value = projectsGetter.value.data ? [...projectsGetter.value.data] : [];
                    allProjectsArrayFilter.value = projectsGetter.value.data ? [...projectsGetter.value.data] : [];
                    if(allProjectsArray.value && allProjectsArray.value.length){
                        allProjectsArray.value = allProjectsArray.value.filter((x) => x._id !== '6571e7195470e64b1203295c' && !x.isRestrict)
                        ProjectIdArray.value = allProjectsArray.value.map(obj => obj._id);
                    }
                    if(allProjectsArrayFilter.value && allProjectsArrayFilter.value.length){
                        allProjectsArrayFilter.value = allProjectsArrayFilter.value.filter((x) => x._id !== '6571e7195470e64b1203295c' && !x.isRestrict)
                    }
                    separateArrays.value = {};
                    searchDynamicTypesenseTasks()
                })
                .catch((error) => {
                    isSpinner.value = false;
                    console.error("ERROR in setProjects: ", error);
                })
            } else {
                isSpinner.value = false;
            }
        }).catch((error) => {
            console.error(error,"ERROR IN GET TEAMS DATA");
        });
    }else{
        allProjectsArray.value = [...projectsGetter.value.data.filter((x) => !x.isRestrict)];
        allProjectsArrayFilter.value = [...projectsGetter.value.data.filter((x) => !x.isRestrict)];
        if(allProjectsArray.value && allProjectsArray.value.length){
            allProjectsArray.value = allProjectsArray.value.filter((x) => x._id !== '6571e7195470e64b1203295c')
            ProjectIdArray.value = allProjectsArray.value.map(obj => obj._id);
        }
        if(allProjectsArrayFilter.value && allProjectsArrayFilter.value.length){
            allProjectsArrayFilter.value = allProjectsArrayFilter.value.filter((x) => x._id !== '6571e7195470e64b1203295c')
        }
        searchDynamicTypesenseTasks()
    }
};
const dragFunction = (value) => {
    isDrag.value = value;
}
provide('dragFunction', dragFunction);
const openInNewTab = (task) => {
    projectId.value = task.ProjectID
    sprintId.value = task.sprintId
    taskId.value = task._id
    isTaskDetail.value = true;
};
const toggleTaskDetail = (task,close=false) => {
    isTaskDetail.value = false;
    if(close == true) {
        router.push({name: 'Home',query: {}, params: {cid: companyId.value}})
        return;
    }
    projectId.value = '';
    sprintId.value = '';
    taskId.value = '';
    nextTick(()=>{
        router.push({name: 'Home',query: {detailTab: "task-detail-tab"}, params: {cid: companyId.value}})
        openInNewTab(task);
    })
}
provide('toggleTaskDetail', toggleTaskDetail);
provide('showArchived', ref(false));
provide('isRouteRequired', false);
provide('isSupport', ref(false));
</script>
<style scoped src="../css/style.css">
</style>