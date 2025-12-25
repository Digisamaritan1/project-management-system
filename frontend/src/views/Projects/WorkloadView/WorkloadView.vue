<template>
    <div v-if="!currentCompany?.planFeature?.workloadView">
        <UpgradePlan
            :buttonText="$t('Upgrades.upgrade_your_plan')"
            :lastTitle="$t('conformationmsg.unlock_workload_view')"
            :secondTitle="$t('Upgrades.unlimited')"
            :firstTitle="$t('Upgrades.upgrade_to')"
            :message="$t('Upgrades.the_feature_not_available')"
        />
    </div>
    <div v-else class="timesheet_view Usertimesheet_view workload_view timesheet_workload_view workload__view--main">
        <div class="timesheet__wrapper page-content">
                <div class="page_top_data d-flex align-items-center justify-content-between" :class="clientWidth <= 1200 ? 'flex-wrap' : ''">
                    <div class="d-flex" :style="[{width : clientWidth <=1200 ? '100%' : 'calc(100% - 253px)'}]" :class="clientWidth <=767 ? 'flex-column' : ''"> 
                        <RangePickerComp 
                            class="rangeComp"
                            @SelectedDate="handleDate"
                            :class="{'disabled': isSpinner}"
                            :isValidate="false"
                            preSelectType="week"
                        />
                        <div class="wf_filter" :class="{'disabled': isSpinner, 'cursor-pointer': !isSpinner}" v-if="isEveryOne"  @click.stop="$refs.filter_wv_click.click()">
                            <span class="timesheet_user_filter">
                                <DropDown id="" class="status_change_dropdown" :bodyClass="{'timesheetDropdown_wrapper' : true}">
                                    <template #button>
                                        <button class="btn-white border cursor-pointer dot-btn" ref="filter_wv_click">
                                            <a href="#" class="link_disable_css">{{$t('Filters.filter_by')}}</a>
                                        </button>
                                    </template>
                                    <template #options>
                                    <DropDownOption v-show="filterType=='' && isEveryOne" @click="handleFilterType('select','Users')">
                                        {{$t('UserTimesheet.Users')}}
                                    </DropDownOption>
                                    <DropDownOption v-show="filterType=='' && isEveryOne" @click="handleFilterType('select','Teams')">
                                        {{$t('UserTimesheet.Teams')}}
                                    </DropDownOption>
                                    <div v-if="filterType!=''">
                                        <div class="wf_header">
                                            <a @click="handleFilterType('back','')">
                                                <img src="@/assets/images/svg/filter_back_icon.svg"/>&nbsp;
                                                {{ $t('UserTimesheet.back') }}

                                            </a>
                                            <span>{{ $t(`UserTimesheet.${filterType}`) }}</span>
                                        </div>
                                        <span class="filter_search_block">
                                            <input type="search" class="form-control" ref="filter_dd_search" :placeHolder="$t('PlaceHolder.search')" v-model="filterSearch"/>
                                        </span>
                                        <div class="wf_body filter_body_scroll checklist-main" :class="{'filter_body_scroll': optionFilter.length >= 5}">
                                            <span
                                            v-for="(item,index) in optionFilter"
                                            class="wf_listItem users_filter_items"
                                            :key="index"
                                            v-show="filterType.toLowerCase()=='users' && isEveryOne">
                                                <a class="vs-dropdown-users d-flex align-items-center">
                                                    <input type="checkbox" v-show="filterType.toLowerCase() == 'users'" @click="handleFilterItem(item,'checkEvent',true)" :value="item.id" v-model="checkedFilter">&nbsp;
                                                    <template v-if="filterType.toLowerCase() == 'users'">
                                                        <UserProfile
                                                            :showDot="false"
                                                            class="timesheet_user_profile mr-10px"
                                                            :data="{
                                                                id: item.id,
                                                                title: item.name,
                                                                image: item.profile ? item.profile : defaultImage
                                                            }"
                                                            width="22px"
                                                            :thumbnail="'22x22'"
                                                            @click="handleFilterItem(item,'checkEvent',true)"
                                                        />
                                                    </template>
                                                    <span class="filter_list_item cursor-pointer" @click="handleFilterItem(item,'checkEvent',true)">{{ item.name }}</span>
                                                </a>
                                            </span>
                                            <span
                                            v-for="item in optionFilter"
                                            class="wf_listItem users_filter_items"
                                            :key="item.id"
                                            v-show="filterType.toLowerCase()=='teams' && isEveryOne">
                                                <span class="filter_list_item cursor-pointer" @click="handleFilterItem(item,'add'),$refs.filter_wv_click.click()">&nbsp;&nbsp;{{ item.name }}</span>
                                            </span>
                                            <span v-if="!optionFilter || optionFilter.length == 0" class="invalid-feedback d-block p-5px">{{$t('UserTimesheet.no_records_found')}}.</span>
                                        </div>
                                    </div>
                                    </template>
                                </DropDown>
                            </span>
                            <div class="chipusername_main">
                                <span class="chipusername_wrapper" v-for="(chip,chipKey) in selectedFilters" :key="chipKey">
                                    <span class="user_name" :title="chip.name" >
                                            {{  `${$t(`general.${chip.type.slice(0,-1)}`)} : ${chip.name}` }}
                                        </span>
                                        <button @click.stop.prevent="handleFilterItem(chip,'remove')" type="button" class="btn-close vs-chip--close">
                                            <img :src="close" alt="cancel"/>
                                        </button>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="d-flex align-items-center" :class=" clientWidth <= 1200 ? 'm-0 pt-10px' : 'ml-1 '">
                            <div class="circlegreen mr-6px"></div>
                            <span class="font-size-14 GunPowder font-weight-400">{{$t('UserTimesheet.tracked_time')}}</span>
                        </span>
                        <span class="d-flex align-items-center" :class=" clientWidth <=1200 ? 'm-0 pt-10px ml-1' : 'ml-1'">
                            <div class="circlePurple mr-6px"></div>
                            <span class="font-size-14 GunPowder font-weight-400">{{ $t('UserTimesheet.manual_time') }}</span>
                        </span>
                    </div>
                </div>
            <WorkloadTimesheetView v-if="dateColumns.length > 0" v-model="dateColumns" :usersArray="usersArray" :activeWeekObj="activeWeekObj" :tableStyle="tableStyle" :isView="true" :projectData="projectData" @update:getSubItemView="getProjectData" :isNoRecordShow="(usersArray.length === 0 && !isSpinner) ? true : false"/>
            <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        </div>    
    </div>
</template>
<script setup>
    import { useCustomComposable ,useGetterFunctions } from '@/composable';
    import { defineComponent , onMounted ,ref , computed , inject ,watch} from "vue";
    import { useStore } from "vuex";
    import RangePickerComp from '@/components/molecules/RangePickerComp/RangePickerComp.vue';
    import moment from 'moment';
    import '@vuepic/vue-datepicker/dist/main.css';
    import WorkloadTimesheetView from '@/components/atom/TimesheetView/WorkloadTImeSheetView/WorkloadTimesheetView.vue'
    import DropDown from '@/components/molecules/DropDown/DropDown.vue'
    import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import * as helper from '@/views/Timesheet/helper';
    import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';
    import UserProfile from '@/components/atom/UserProfile/UserProfile.vue';
    import { apiRequest } from '../../../services';
    import * as env from '@/config/env';
    defineComponent({
        name: "UserTimesheet",
        components: {
            DropDown,
            DropDownOption,
            RangePickerComp,
        }
    })
    const props = defineProps({
        projectData: Object,
    })
    const defaultImage = require("@/assets/images/default_user.png")
    const close = require("@/assets/images/svg/close_timesheet.svg")

    const clientWidth = inject("$clientWidth");
    const { getters} = useStore();
    const {getUser} = useGetterFunctions();
    const {checkPermission, debouncerWithPromise} = useCustomComposable();
    const selectedFilters = ref([]);
    const isSpinner = ref(false);
    const activeWeekObj = ref({
        isWeeked: false,
        isOneday: false,
        isTwoday: false,
        isThreeday: false,
        isFourday: false,
        isFiveday: false,
        isSixday: false,
    });
    const tableStyle = ref({'colspanCount':  "35",'tableWidth': "4885px"});
    const users = ref();
    const dateColumns = ref([]);
    const dateRange = ref({});
    const selectedDates = ref([]);
    const currentUserId = inject('$userId');
    const companyUserDetail = computed(() => getters["settings/companyUserDetail"]);
    const checkedFilter = ref([]);
    const filterType = ref("");
    const filter_wv_click = ref(null);
    const filterSearch = ref("");
    const companyId = inject('$companyId');
    const timesheetDocArray = ref([]);
    const estimateDocArray = ref([]);
    const teams = computed(() => getters["settings/teams"]);
    const currentCompany = computed(() => getters["settings/selectedCompany"]);
    watch(() => getters["settings/teams"],(val) => {
        teams.value = val;
    })
    const finalFilter = ref([]);
    const usersArray = ref([]);
    selectedDates.value = [dateRange.value.startDate,dateRange.value.endDate];
    const projects = ref([props.projectData]);
    const isEveryOne = ref(false);
    onMounted(async () => {
        getUserData();
        // initData(dateRange.value.startDate, dateRange.value.endDate);
    })

    watch(() => props.projectData,(prValue) => {
        if(prValue._id !== projects.value[0]._id){
            projects.value[0] = prValue;
            initData(dateRange.value.startDate, dateRange.value.endDate);
            handleFilterType('back','')
            usersArray.value = [];
        }
    })

    watch([() => dateRange.value.startDate, () => dateRange.value.endDate], ([start, end]) => {
        if(start && end) {
            debouncerWithPromise(500)
            .then(() => {
                initData(dateRange.value.startDate, dateRange.value.endDate)
            })
        }
    })

    const getUserData = async () => {
        if (checkPermission('sheet_settings.workload_timesheet') === true || checkPermission('sheet_settings.workload_timesheet') === 2) {
            isEveryOne.value = true;
            const allUser = computed(() => getters["users/users"])
            if(projects.value[0] && projects.value[0].isPrivateSpace === true) {
                const usersData = allUser.value.filter(x => projects.value[0]?.AssigneeUserId?.includes(x._id))
                users.value = usersData || [];
            } else {
                users.value = allUser.value;
            }
        } else {
            isEveryOne.value = false;
            users.value = [getUser(currentUserId.value, true)]
        }
    }
    const getProjectData = async (userObj,cb) => {
        projects.value[0].selectedUserId = userObj.id
        projects.value[0].activitiesArray = []
        getTaskDataFunction(projects.value[0], (res) => {
            cb(res)
        })
    }
    const handleDate = (modelData) => {
        dateRange.value.startDate = modelData.dateVal[0]
        dateRange.value.endDate = modelData.dateVal[1]
        // initData(modelData.dateVal[0] ? modelData.dateVal[0] : '',modelData.dateVal[1] ? modelData.dateVal[1]: '');
    }
    const getTaskDataFunction = (projectObject,cb) => {
        isSpinner.value = true;
        Promise.allSettled([helper.getTaskData(projectObject,timesheetDocArray,companyId),helper.getTaskEstimateData(projectObject._id,projectObject.selectedUserId,estimateDocArray,companyId)]).then((result)=>{
            let proResu = result.filter((x) => x.status === 'fulfilled').map((x) => x.value);
            let logArray = proResu.filter((x) => x.key === "logtime")[0]
            let esti =  proResu.filter((x) => x.key === "estimate")[0]
            let count = 0;
            let countFunction = (ele) => {
                if (count >= logArray.data.activitiesArray.length) {
                    esti.data.forEach((dt)=>{
                        let ind = logArray.data.activitiesArray.findIndex((x)=> x._id === dt._id);
                        if (ind === -1) {
                            logArray.data.activitiesArray.push(dt);
                        }
                    })
                    isSpinner.value = false;
                    logArray.data[projectObject.selectedUserId] = logArray.data.activitiesArray;
                    cb(logArray)
                    return;
                } else {
                    let estiInd = esti.data.findIndex((x)=> x._id === ele._id)
                    if (estiInd !== -1) {
                        ele.totalTaskEstMin = esti.data[estiInd].totalTaskEstMin
                        ele.taskFinalEstimate = esti.data[estiInd].taskFinalEstimate
                        count++;
                        countFunction(logArray.data.activitiesArray[count]);
                    }
                    count++;
                    countFunction(logArray.data.activitiesArray[count]);
                }
            }
            countFunction(logArray.data.activitiesArray[count]);
            logArray.data.activitiesArray.forEach((ele)=>{
                let estiInd = esti.data.findIndex((x)=> x._id === ele._id)
                if (estiInd !== -1) {
                    ele.totalTaskEstMin = esti.data[estiInd].totalTaskEstMin
                    ele.taskFinalEstimate = esti.data[estiInd].taskFinalEstimate
                }
            })
        })
    }
    const getTimesheetMongo = (sdate,edate) => {
        return new Promise((resolve, reject) => {
            let start = sdate / 1000
            let end = edate / 1000
            let userArray = [];
            let filterIds = selectedFilters.value.filter((x)=>{return x.type == 'Users'});
            if (filterIds.length) {
                filterIds.forEach((element) => {
                    userArray.push(element.id)
                });
            }
            let teamsIds = selectedFilters.value.filter((x)=>{return x.type == 'Teams'});
            if (teamsIds.length) {
                teamsIds.forEach((element)=>{
                    let ind = teams.value.findIndex((x)=>{return x._id == element.id});
                    teams.value[ind].assigneeUsersArray.forEach((dt)=>{
                        userArray.push(dt)
                    })
                })
            }
            if (filterIds.length === 0 && teamsIds.length === 0) {
                users.value.forEach((element) => {
                    userArray.push(element._id)
                });
            }
            let mongo_search_eta_parameters = [];

                mongo_search_eta_parameters = [{
                    UserId: { 
                        $in: userArray 
                    },
                    ProjectId: {
                        $in: [projects.value[0]._id]
                    },
                    Date: {
                        dbDate: {
                            $gte: (start * 1000),
                            $lte: (end * 1000)
                        }
                    }
                }]

                if (filterIds.length === 0 && teamsIds.length === 0 && (companyUserDetail.value.roleType === 1 || companyUserDetail.value.roleType === 2)) {
                    mongo_search_eta_parameters = [{
                         ProjectId: {
                            $in: [projects.value[0]._id]
                        },
                        Date: {
                            dbDate: {
                                $gte: (start * 1000),
                                $lte: (end * 1000)
                            }
                        }
                    }]
                }
                const axiosObj = {
                    selectedFilter : selectedFilters.value,
                    projectArray: [projects.value[0]._id],
                    userArray: userArray,
                    start: start,
                    end: end,
                    companyUserDetail: companyUserDetail.value,
                    timeZone: currentUserId.value.Time_Zone ? currentUserId.value.Time_Zone : "Asia/Kolkata",
                    isFrom: "workloadview"
                }
            let queryeta = [
                {
                    $match: {
                        // This $and is not strictly necessary as MongoDB implicitly treats multiple fields in $match as an AND operation.
                        $and: mongo_search_eta_parameters
                    }
                },
                {
                    $group: {
                        _id: {
                            date: "$Date",
                            user: "$UserId",
                            // projectId: "$ProjectId"
                        },
                        data: {
                            $push: {
                                projectId: "$ProjectId",
                                taskId: "$TaskId",
                                logMinutes: "$EstimatedTime",
                                userId: "$UserId",
                                date: "$Date",
                            }
                        },
                        user: {
                            $first: "$UserId" // Getting the first user in each group
                        },
                        totalCount: {
                            $sum: "$EstimatedTime" // Calculate sum of all LogTimeDuration for each group
                        }
                    }
                }
            ]
            apiRequest("post", `${env.TIMESHEET}/workload`,axiosObj)
                .then((result) => {
                    let tempTypesSenseDocs = [];
                    result.data.map((vals) => {
                        let docTemp = vals;
                        tempTypesSenseDocs.push({...docTemp,'logType':docTemp._id.logType ? docTemp._id.logType : 0});
                    })
                    timesheetDocArray.value = tempTypesSenseDocs;
                    timesheetDocArray.value.forEach((x) => {
                        if(getUser(x.user).ghostUser){
                            const index = users.value.findIndex((user) => user._id === x.user);
                            if(index === -1){
                                users.value.push(getUser(x.user));
                            }
                        }
                    })
                    apiRequest("post", `${env.ESTIMATED_TIME}`,{queryeta: queryeta})
                    .then((estimated) => {
                        estimateDocArray.value = estimated.data
                        resolve()
                    }).catch((error)=>{
                        console.error(error)
                        estimateDocArray.value = [];
                        reject([])
                    })
                }).catch((error)=>{
                    console.error(error)
                    timesheetDocArray.value = [];
                    reject([])
                })
        })
    }
    const initData = (startDate,EndDate) => {
        if(!(startDate) && !(EndDate)) {
            return;
        }
        isSpinner.value = true;
        var sDate = startDate ? new Date(startDate).getTime() : new Date(dateRange.value.startDate).getTime();
        var eDate = new Date(EndDate || dateRange.value.endDate);
        eDate.setHours(23, 59, 59);
        dateColumns.value = [];
        usersArray.value = [];
        for (let i = sDate; i < eDate.getTime(); i += 86400000) {
            const momentDate = moment(new Date(i));
            const DateColumn = {
                date: momentDate.format('DD'),
                day: momentDate.format('ddd'),
                fullDate: momentDate.format('YYYY-MM-DD'),
                currentDate: moment(new Date()).format('YYYY-MM-DD'),
                arabiDay: momentDate.format('Do').replace(/[0-9]/g, ''),
                arabiMonth: momentDate.format('MMM'),
                mainDate: new Date(i),
                weekNumber: (momentDate.weeks() - momentDate.startOf('month').weeks() + 1 + 52) % 52,
                weekName: ["1st", "2nd", "3rd", "4th", "5th"][(momentDate.weeks() - momentDate.startOf('month').weeks() + 1 + 52) % 52 - 1] || "",
                dateMonth: momentDate.format('MM'),
                totalUserEst: {},
                totalUserLogs: {},
                totalManualLogs:{},
                totalTrackedLogs:{},
                totalDayEst: 0,
                totalDayLogs: 0,
                totalLogsType: {},
            };
            dateColumns.value.push(DateColumn);
            const dateColumnsLength = dateColumns.value.length;
            activeWeekObj.value = {
                isOneday: dateColumnsLength === 1,
                isTwoday: dateColumnsLength === 2,
                isThreeday: dateColumnsLength === 3,
                isFourday: dateColumnsLength === 4,
                isFiveday: dateColumnsLength === 5,
                isSixday: dateColumnsLength === 6,
            };
            if (dateColumnsLength <= 20) {
                tableStyle.value.colspanCount = "27";
                tableStyle.value.tableWidth = "1888px";
                activeWeekObj.value.isWeeked = true;
            }
            if (dateColumnsLength > 7) {
                activeWeekObj.value.isWeeked = true;
                const noOfDays = dateColumnsLength;
                const tblWidth = noOfDays * 135 + 445;
                tableStyle.value.tableWidth = tblWidth + 'px';
                const tblColspan = 6 + 3 * noOfDays;
                tableStyle.value.colspanCount = tblColspan;
            }
        }
        getTimesheetMongo(sDate,eDate.getTime()).then(()=>{
            let promise = []
            displayUserArray().then((response)=>{
                response.forEach((user)=>{
                    promise.push(userArrayPromise(user));
                })
            })
            Promise.allSettled(promise).then(()=>{
                isSpinner.value = false;
            }).catch((error)=>{
                isSpinner.value = false;
                console.error(error,"error");
            })
        })
    }
    const displayUserArray = () => {
        return new Promise((resolve, reject) => {
        try {
            let userArray = [];
            const filterIds = selectedFilters.value.filter(x => x.type === 'Users');
            const teamsIds = selectedFilters.value.filter(x => x.type === 'Teams');
            const filterProject = selectedFilters.value.filter(x => x.type === 'Projects');
            if (timesheetDocArray.value.length) {
                timesheetDocArray.value.forEach(ele => {
                    const index = users.value.findIndex(x => x._id === ele.user);
                    if (index !== -1) {
                        userArray.push(users.value[index]);
                    }
                });
            }
            if (estimateDocArray.value.length) {
                estimateDocArray.value.forEach(ele => {
                    const index = users.value.findIndex(x => x._id === ele.user);
                    if (index !== -1) {
                        userArray.push(users.value[index]);
                    }
                });
            }
            teamsIds.forEach(element => {
                const ind = teams.value.findIndex(x => x._id === element.id);
                if (ind !== -1) {
                const userArr = teams.value[ind].assigneeUsersArray;
                userArr.forEach(data => {
                    const index = users.value.findIndex(x => x._id === data);
                    if (index !== -1) {
                    userArray.push(users.value[index]);
                    }
                });
                }
            });
            filterIds.forEach(element => {
                const ind = users.value.findIndex(x => x._id === element.id);
                if (ind !== -1) {
                userArray.push(users.value[ind]);
                }
            })
            if (filterProject.length === 0 && filterIds.length === 0 && teamsIds.length === 0) {
                userArray = [...users.value];
            }
            const uniqueArray = Array.from(new Set(userArray.map(item => item._id))).map(_id => userArray.find(item => item._id === _id));
            resolve(uniqueArray);
        } catch (error) {
            reject(error);
        }
        })
    }
    const userArrayPromise = (userData) => {
        return new Promise((resolve, reject) => {
            try {
                let finalMongoData = timesheetDocArray.value.filter((x)=>{return x.user.trim() == userData._id.trim()});
                let finalEstimateData = estimateDocArray.value.filter((x)=>{return x.user.trim() === userData._id.trim()});
                Promise.allSettled([manageLoggTime(finalMongoData,userData._id),manageEstimate(finalEstimateData,userData._id)]).then((result)=>{
                    let proResu = result.filter((x) => x.status === 'fulfilled').map((x) => x.value);
                    if(proResu?.find((x) => x.key === "logtime")?.totalLogedHours > 0 || proResu?.find((x) => x.key === "estimate")?.estiMateTime > 0){
                        let index = usersArray.value.findIndex((x) => x.id === userData._id);
                        if(index === -1)
                        {
                            usersArray.value.push({
                                'id': userData._id,
                                'name': userData.Employee_Name,
                                'profileImage': userData.Employee_profileImageURL,
                                'activitiesArray': [],
                                'totalLoggedHours': proResu.filter((x) => x.key === "logtime")[0].totalLogedHours,
                                'estMin': proResu.filter((x) => x.key === "estimate")[0].estiMateTime,
                                'projectArray' : [],
                                'manuallyLog' : {'name' : 'Manually Time',time : proResu.filter((x) => x.key === "logtime")[0].manuallyLogtime},
                                'trackdLog' : userData.trackdLog = {'name' : 'Track Time',time : proResu.filter((x) => x.key === "logtime")[0].trackedLogtime}
                            })
                        }
                    }
                    resolve();
                }).catch((error)=>{
                    reject(error);
                })
            } catch (error) {
                reject(error)
            }
        })
    }
    const manageEstimate = (finalEstimateData,userId) => {
        return new Promise((resolve, reject) => {
            try {
                let estMin = 0;
                let count = 0;
                let countFunction = (element) => {
                    if (count >= finalEstimateData.length) {
                        resolve({key: 'estimate', estiMateTime: estMin});
                    } else {
                        let estimate = element.totalCount ? element.totalCount : 0;
                        let tempDate = element._id.date ? moment(new Date(element._id.date)).format("YYYY-MM-DD") : '';
                        let searchInd = dateColumns.value.findIndex((x) => {
                            return x.fullDate == tempDate
                        });
                        if(element.user.toString().trim() === userId.trim()){
                            estMin += estimate;
                            if(searchInd !== -1){
                                dateColumns.value[searchInd].totalDayEst += estimate;
                                let getUserKey = Object.keys(dateColumns.value[searchInd].totalUserEst).includes(element.user.toString().trim());
                                if(!getUserKey){
                                    dateColumns.value[searchInd].totalUserEst[`${element.user.toString()}`] = estimate;
                                    count++;
                                    countFunction(finalEstimateData[count]);
                                }
                                else{
                                    dateColumns.value[searchInd].totalUserEst[`${element.user.toString()}`] = estimate + parseInt(dateColumns.value[searchInd].totalUserEst[`${element.user.toString()}`] ? dateColumns.value[searchInd].totalUserEst[`${element.user.toString()}`] : 0);
                                    count++;
                                    countFunction(finalEstimateData[count]);
                                }
                            } else {
                                count++;
                                countFunction(finalEstimateData[count]);
                            }
                        } else {
                            count++;
                            countFunction(finalEstimateData[count]);
                        }
                    }
                }   
                countFunction(finalEstimateData[count]);
            } catch (error) {
                reject(error);
            }
        })
    }
    const manageLoggTime = (finalMongoData,userId) => {
        return new Promise((resolve, reject) => {
            try {
                let count = 0;
                let manuallyLog = 0;
                let totalLoghrs = 0;
                let trackdLog = 0;
                let tmpAllRecord = finalMongoData.map(item => item['data']).flat();
                let countFunction = (element) => {
                    if (count >= tmpAllRecord.length) {
                        resolve({key: 'logtime', manuallyLogtime : manuallyLog , trackedLogtime : trackdLog, totalLogedHours: totalLoghrs});
                    } else {
                        let totalMin = element.logMinutes ? parseInt(element.logMinutes) : 0;
                        let tempDate = element.date ? moment(new Date(element.date)).format("YYYY-MM-DD") : '';
                        let searchInd = dateColumns.value.findIndex((x) => {
                            return x.fullDate == tempDate
                        });
                        if(element.userId.toString().trim() === userId.trim()){
                            totalLoghrs += totalMin;
                            // totalLoghrs += totalMin;
                            if(element.logType == 0){
                                manuallyLog += totalMin; 
                            }
                            else if(element.logType == 1){
                                trackdLog += totalMin; 
                            }
                            else if(element.logType == undefined){
                                manuallyLog += totalMin; 
                            }
                            if(searchInd !== -1){
                                dateColumns.value[searchInd].totalDayLogs += totalMin;
                                let getUserKey = Object.keys(dateColumns.value[searchInd].totalUserLogs).includes(element.userId.toString().trim());
                                if(!getUserKey){
                                    dateColumns.value[searchInd].totalUserLogs[`${element.userId.toString()}`] = totalMin;
                                    dateColumns.value[searchInd].totalLogsType[`${element.userId.toString()}`] = element.logType;
                                    if (element.logType === 0 || element.logType === undefined) {
                                        dateColumns.value[searchInd].totalManualLogs[`${element.userId.toString()}`] = totalMin
                                    } else {
                                        dateColumns.value[searchInd].totalTrackedLogs[`${element.userId.toString()}`] = totalMin
                                    }
                                    count++;
                                    countFunction(tmpAllRecord[count]);
                                }
                                else{
                                    dateColumns.value[searchInd].totalUserLogs[`${element.userId.toString()}`] = totalMin + parseInt(dateColumns.value[searchInd].totalUserLogs[`${element.userId.toString()}`] ? dateColumns.value[searchInd].totalUserLogs[`${element.userId.toString()}`] : 0);
                                    if(dateColumns.value[searchInd].totalLogsType[`${element.userId.toString()}`] != element.logType){
                                        dateColumns.value[searchInd].totalLogsType[`${element.userId.toString()}`] = 2;
                                    }
                                    if (element.logType === 0 || element.logType === undefined) {
                                        dateColumns.value[searchInd].totalManualLogs[`${element.userId.toString()}`] = totalMin + parseInt(dateColumns.value[searchInd].totalManualLogs[`${element.userId.toString()}`] ? dateColumns.value[searchInd].totalManualLogs[`${element.userId.toString()}`] : 0)
                                    } else {
                                        dateColumns.value[searchInd].totalTrackedLogs[`${element.userId.toString()}`] = totalMin + parseInt(dateColumns.value[searchInd].totalTrackedLogs[`${element.userId.toString()}`] ? dateColumns.value[searchInd].totalTrackedLogs[`${element.userId.toString()}`] : 0)
                                    }
                                    count++;
                                    countFunction(tmpAllRecord[count]);
                                }
                            } else {
                                count++;
                                countFunction(tmpAllRecord[count]);
                            }
                        } else {
                            count++;
                            countFunction(tmpAllRecord[count]);
                        }
                    }
                }
                countFunction(tmpAllRecord[count]);
            } catch (error) {
                reject(error);
            }
        })
    }
    function handleFilterType(type,item){
        if(type != 'back'){
            setTimeout(()=>{ filterType.value =item;openFilterMenu() },100);
        }else{
            setTimeout(()=>{ filterType.value ='' },100);
        }
    }
    function openFilterMenu(){
        try{
            filterSearch.value ='';
            // const userIds = usersArray.value.map(user => user.id);
            // const userData = users.value.filter(user => userIds.includes(user._id));
            getUserData();
            helper.getFinalFilter(filterType.value, users.value, teams.value, projects.value).then((filterRes) => {
                if(filterRes.status){
                    finalFilter.value = filterRes.data.finalFilter;
                }
            })
        }catch(error){
            console.error(error);
        }
    }
    function handleFilterItem(selectedItem, type, isUser=false){
        helper.handleFilterItem(selectedItem,type,selectedFilters.value, checkedFilter.value, filterType.value).then((filterRes)=>{
            if(filterRes.status){
                let userFilter = filterRes.data.selectedFilters.filter((x) => x.type == "Users");
                if (isUser && userFilter.length == 0) {
                    filter_wv_click.value.click()
                }
                selectedFilters.value = filterRes.data.selectedFilters;
                checkedFilter.value = filterRes.data.checkedFilter;
                initData(dateRange.value.startDate,dateRange.value.endDate);
            }
        })
    }
    const optionFilter = computed(()=>{
        const searchArray = [];
        if (filterSearch.value && filterSearch.value.length > 0) {
            const filterTypeLower = filterType.value.toLowerCase();
            if (filterTypeLower === "users") {
                users.value.forEach(rawData => {
                if (rawData.Employee_Name.trim().toLowerCase().includes(filterSearch.value.trim().toLowerCase())) {
                    searchArray.push({
                    "id": rawData._id,
                    'name': rawData.Employee_Name,
                    'profile': rawData.Employee_profileImageURL || ''
                    });
                }
                });
            } else if (filterTypeLower === "teams") {
                teams.value.forEach(val => {
                if (val.name.trim().toLowerCase().includes(filterSearch.value.trim().toLowerCase())) {
                    searchArray.push({
                    "id": val._id,
                    'name': val.name
                    });
                }
                });
            }
        }
        return filterSearch.value.length ?  searchArray : finalFilter.value;
    })
</script>
<style scoped>
.disabled{
    pointer-events: none;
}
.page-content {
    padding: 15px;
    width: 100%;
}
table.table.timesheet_table tr td .d-flex:first-child::after, table.table.timesheet_table tr th .d-flex:first-child::after{
    display: none !important;
}
.timesheet_view.Usertimesheet_view.workload_view.timesheet_workload_view{
    width: 100%;
}
.page-title {
    width: 100%;
}
ul.breadcrumb.title_strip {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    height: 61px;
    background-color: #fff;
    border-bottom: 1px solid #DAE1E7;
    width: 100%;
    padding-left: 15px;
}
ul.breadcrumb.title_strip li:first-child {
    border-left: 0;
    padding-left: 0px;
}
ul.breadcrumb.title_strip li {
    list-style: none;
    padding-right:15px;
    border-left: 1px solid #b7b7b7;
    font-family: 'Roboto', sans-serif;
    font-weight:700;
    padding-left: 15px;
}
.dp__main.dp__theme_light {
    max-width: 100%;
    width: 260px;
    margin-right: 15px;
}
span.chipusername_wrapper {
    display: flex;
    background-color: #f1efef;
    border-radius: 10px;
    margin-right: 10px;
    padding: 2px 4px 2px 8px;
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    min-width: fit-content;
    align-items: center;
}
a.link_disable_css {
    color: #000;
    text-decoration: none;
    font-size: 16px;
}

span.chipusername_wrapper button {
    padding: 0;
    border: 0;
    margin-left: 4px;
    min-width: 17px;
    width: 17px;
    height: 17px;
    background: transparent !important;
}
span.timesheet_user_filter {
    position: sticky;
    left: 0;
    background-color: #fff;
    padding: 3px 10px 3px 10px;
    min-width: 75px;
}

.wf_filter::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #C1C1C1;
}
.wf_filter::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    background-color: #F5F5F5;
}
.chipusername_main {
    display: flex;
}
span.chipusername_wrapper span.user_name {
    font-size: 13px;
    min-width: max-content;
}
.circlegreen {
  width: 10px;
  height: 10px;
  background-color: #1CB303;
  border-radius: 50%;
}
.circlePurple {
  width: 10px;
  height: 10px;
  background-color: #7367F0;
  border-radius: 50%;
}
span.timesheet_user_filter button.dot-btn {
  min-width: 60px;
}
.wf_filter {
  display: flex;
  align-items: center;
  max-width: 85%;
  width: 100%;
  background-color: #fff;
  border: 1px solid #ececec;
  border-radius: 6px;
  padding: 0px 40px 0px 0px;
  overflow: auto;
  margin-left: 15px;
  background-image: url('../../../assets/images/svg/filter_icon.svg');
  background-repeat: no-repeat;
    background-position: 99% 54%;
}
.wf_body.checklist-main.filter_body_scroll.filter_body_scroll .wf_listItem {
  padding: 5px 10px 5px 10px;
  display: flex;
}
.wf_body.checklist-main.filter_body_scroll.filter_body_scroll .wf_listItem:hover{
  background-color: #EDEDF3;
}


@media(max-width: 1850px){
    span.timesheet_user_filter{min-width: 75px;}
}
@media(max-width: 767px){
.wf_filter {
    max-width: 100%;
    margin-left: 0;
    margin-top: 15px;
    margin-bottom: 5px;
}
.timesheet__wrapper .range-picker.rangeComp {
    min-width: 230px !important;
    width: -moz-fit-content !important;
    width: fit-content !important;
}
.wf_body.checklist-main.filter_body_scroll.filter_body_scroll .wf_listItem{height: 50px;}
}
</style>