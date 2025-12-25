<template>
<Sidebar  width="923px">
    <template #head-left>
            <div class="d-flex align-items-center">
                <p class="user_hrs_name">{{projectObject.projectCode}} | {{ projectObject.projectName }}</p>
            </div>
        </template>
        <template #head-right>
            <span><img src="@/assets/images/svg/Close_screenshotview.svg" @click="closeSidebar()" class="close_icon_sidebar"/></span>
        </template>
        <template #body>
            <LogDetailViewHeaderComponent
                :date="dateValue"
                @update:dateChange="dateChangeFunction"
                :total="total"
                :tracked="track"
                :manual="manual"
                :userData="userFilterData"
                @update:filterUser="filterUserChangeFunction"
            />
            <LogDetailViewBodyComponent :data="finalData" :isUser="isUser"/>
        </template>
</Sidebar>
</template>
<script setup>
    import {ref , onMounted , inject , computed} from "vue";
    import LogDetailViewHeaderComponent from '@/components/atom/TimesheetView/LogDetailView/LogDetailViewHeaderComponent' 
    import LogDetailViewBodyComponent from '@/components/atom/TimesheetView/LogDetailView/LogDetailViewBodyComponent'
    import * as helper from '@/components/atom/TimesheetView/LogDetailView/helper.js'
    import Sidebar from '@/components/molecules/Sidebar/Sidebar.vue';
    import { useStore } from "vuex";
    import { useGetterFunctions } from "@/composable/index.js";
    import moment from "moment";
    const { getters } = useStore();
    const userId = inject('$userId');
    const emit = defineEmits(["isSClose"])
    const isUser = ref(true);
    const projectsGetter = computed(() => getters["projectData/allProjects"]);
    const allUsers = computed(() => getters["users/users"]);
    const {getUser} = useGetterFunctions()
    const props = defineProps({
        date: {type: Date},
        userData: {type: Object},
        projectData: {type: Object},
        taskData: {type: Object},
        track: {type: Number},
        manual: {type: Number},
        total: {type: Number},
        projectTimesheetPermission: { type : Boolean, default:()=>(false) },
        filterUserIds: {type: Array},
        filterProjectIds: {type: Array}
    });
    // const user = ref(props.userData);
    const manual = ref(props.manual);
    const track = ref(props.track);
    const total = ref(props.total);
    const projectTimesheetPermission = ref(props.projectTimesheetPermission)
    const finalData = ref();
    const userFilterData = ref([]);
    const getTimeSheetData = ref([]);
    const themodelValue = ref(props.date);
    const dateValue = ref(new Date());
    const companyId = inject('$companyId');
    const projectObject = ref(props.projectData);
    const taskObject = ref(props.taskData);
    const filterUserIds = ref(props.filterUserIds);
    // const filterProjectIds = ref(props.filterProjectIds);
    onMounted(() => {        
        dateValue.value = themodelValue.value ? themodelValue.value : new Date();
        getData(dateValue.value);
    })
    const closeSidebar = () => {
        emit("isSClose",true)
    }
    const dateChangeFunction = (val) => {
        getData(val);
    }
    const filterUserChangeFunction = (val) => {
        const tmpData = JSON.parse(JSON.stringify(getTimeSheetData.value));
        const ids = JSON.parse(JSON.stringify(val));
        if (ids && ids.length) {
            const finaltmpData = tmpData.filter((x) => ids.indexOf(x.Loggeduser) !== -1)
            prepareArray(finaltmpData, true);
        } else {
            prepareArray(tmpData);
        }
    }
    const getData = (date) => {
        let s_date = new Date(new Date(date).setHours(0,0,0,0)).getTime() / 1000;
        let e_date = new Date(new Date(date).setHours(23,59,59)).getTime() / 1000;
        let userIds = [];
        if (!projectTimesheetPermission.value) {
            const userId = localStorage.getItem('userId');
            userIds.push(userId);
        }
        if (projectTimesheetPermission.value) {
            const ffilterUserIds = JSON.parse(JSON.stringify(filterUserIds.value));
            if (ffilterUserIds && ffilterUserIds.length) {
                userIds = ffilterUserIds;
            }
        }
        helper.getTimeSheetData(companyId.value,userIds,s_date,e_date,projectObject.value?.id ? projectObject.value.id : "",taskObject.value?.id ? taskObject.value.id : '' ).then((response)=>{
            getTimeSheetData.value = response;
            prepareArray(response);
        }).catch((error)=>{
            console.error(error,"error");
        })
    }
    const prepareArray = async (data, filter) => {
        let array = [];
        let finalArray = [];
        let userFilterDataArray = [];
        let projectName = [];
        let taskName = [];
        const userIds = [...new Map(data.map(item => [item['Loggeduser'], item])).values()].map(a => a.Loggeduser);
        // const ticketIds = [...new Map(data.map(item => [item['TicketID'], item])).values()].map(a => a.TicketID);
        const allUsersData = JSON.parse(JSON.stringify(allUsers.value))
        if (userIds && userIds.length) {
            userIds.forEach((id) => {
                let userObj = getUser(id).ghostUser ? getUser(id) : allUsersData.filter((x) => x._id === id)[0];
                finalArray.push({
                    id: id,
                    name: userObj.Employee_Name,
                    profileImage: userObj.Employee_profileImageURL,
                    total: data.filter((x) => x.Loggeduser == id).reduce((a,b) => a + b.LogTimeDuration, 0),
                    manageArray: []
                });
                if (!filter) {
                    userFilterDataArray.push({
                        id: id,
                        profileImage: userObj.Employee_profileImageURL,
                        Employee_Name: userObj.Employee_Name,
                    })
                }
            });
            if (!filter) {
                userFilterData.value = userFilterDataArray;
            }
        }


        // finalData.value = finalArray;




        if (Object.keys(projectObject.value).length === 0) {
            projectName = await getProjectName(data)
            taskName = await helper.getTaskName(companyId.value,data)
        }
        if (Object.keys(projectObject.value).length !== 0 && Object.keys(taskObject.value).length === 0) {
            taskName = await helper.getTaskName(companyId.value,data)
            projectName = [{id: projectObject.value.id, name: projectObject.value.projectName, key: projectObject.value.ProjectCode ? projectObject.value.ProjectCode : projectObject.value.projectCode}]
        }
        if (Object.keys(projectObject.value).length !== 0 && Object.keys(taskObject.value).length !== 0) {
            taskName = [{
                id: taskObject.value.id,
                name: taskObject.value.TaskName,
                key: taskObject.value.TaskKey ? taskObject.value.TaskKey : taskObject.value.TaskCode,
                isFolderSprint: taskObject.value.folderObjId ? true : false,
                sprintName: taskObject.value.sprintArray.name,
                folderName: taskObject.value.sprintArray.folderName ? taskObject.value.sprintArray.folderName : ""
            }]
            projectName = [{id: projectObject.value.id, name: projectObject.value.projectName, key: projectObject.value.ProjectCode ? projectObject.value.ProjectCode : projectObject.value.projectCode}]
            // TODO:
        }
        manual.value = 0;
        track.value = 0;
        total.value = 0;
        let newData = data.sort((a,b) => a.LogStartTime - b.LogStartTime)
        newData.forEach((dt) => {
            let trackArr = (dt.trackShots && dt.trackShots.length) ? dt.trackShots : ""
            let index = array.findIndex(x => x.loggeduser === dt.Loggeduser && x.TicketID === dt.TicketID)
            let proInd = projectName.findIndex(x => x.id === dt.ProjectId)
            let taskInd = taskName.findIndex(x => x.id === dt.TicketID)
            if (dt.logAddType == 0) {
                manual.value = manual.value + dt.LogTimeDuration
            } else {
                track.value = track.value + dt.LogTimeDuration
            }
            total.value = total.value + dt.LogTimeDuration
            if (index === -1) {
                let obj = {
                    projectName: projectName[proInd].name,
                    ProjectId: projectName[proInd].id,
                    TicketID: taskName[taskInd].id,
                    taskName: taskName[taskInd].name,
                    sprintName: taskName[taskInd].name,
                    isFolderSprint: taskName[taskInd].isFolderSprint,
                    folderName: taskName[taskInd].folderName,
                    projectKey: projectName[proInd].key,
                    taskKey: taskName[taskInd].key,
                    total: dt.LogTimeDuration,
                    loggeduser: dt.Loggeduser,
                    trackArray: []
                }
                let objecy = {
                    time: `${getTime(dt.LogStartTime)} - ${getTime(dt.LogEndTime)}`,
                    duration: dt.LogTimeDuration,
                    logAddType: dt.logAddType,
                    discription: dt.LogDescription,
                    trackShotArray: dt.logAddType == 1 ? trackArr : [],
                    startTimeTracker: dt.startTimeTracker ? dt.startTimeTracker : "",
                }
                obj.trackArray.push(objecy);
                array.push(obj);
            } else {
                array[index].total = array[index].total + dt.LogTimeDuration
                let ob = {
                    time: `${getTime(dt.LogStartTime)} - ${getTime(dt.LogEndTime)}`,
                    duration: dt.LogTimeDuration,
                    logAddType: dt.logAddType,
                    discription: dt.LogDescription,
                    trackShotArray: dt.logAddType == 1 ? trackArr : [],
                    startTimeTracker: dt.startTimeTracker ? dt.startTimeTracker : "",
                }
                array[index].trackArray.push(ob)
            }
        })
        for (let i = 0; i < array.length; i += 1) {
            if (userIds.indexOf(array[i].loggeduser) !== -1) {
                finalArray[userIds.indexOf(array[i].loggeduser)].manageArray.push(array[i])
            }
        }
        finalData.value = finalArray;
    }
    const getProjectName = (array) => {
        return new Promise((resolve, reject) => {
            try {
                let uniqueArray = [...new Set(array.map((x)=>{return x.ProjectId}))]
                let Array = [];
                uniqueArray.forEach((ele)=>{
                    let ind = projectsGetter.value.data.findIndex((x) =>{return x._id == ele})
                    if (ind != -1) {
                        Array.push({id: projectsGetter.value.data[ind]._id, name: projectsGetter.value.data[ind].ProjectName, key: projectsGetter.value.data[ind].ProjectCode})
                    }
                })
                resolve(Array);
            } catch (error) {
                reject(error)
            }
        })
    }
    const getTime = (time) => {
        let userFormat = getUser(userId.value).timeFormat;
        if (userFormat == "12") {
            return moment(new Date(time * 1000)).format("hh:mm A")
        } else {
            return moment(new Date(time * 1000)).format("HH:mm")
        }
    }
</script>