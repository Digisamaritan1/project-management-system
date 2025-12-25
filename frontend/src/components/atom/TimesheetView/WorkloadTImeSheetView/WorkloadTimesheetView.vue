
<template>
<div class="timesheet_table_wrapper" @scroll="checkScroll">
    <table class="table timesheet_table"  v-bind:class="[{ 'isWeeked': activeWeekObj.isWeeked,'isOneday': activeWeekObj.isOneday,
                    'isTwoday': activeWeekObj.isTwoday,'isThreeday': activeWeekObj.isThreeday,'isFourday': activeWeekObj.isFourday,
                    'isFiveday': activeWeekObj.isFiveday,
                    'isSixday': activeWeekObj.isSixday}]" :style="[{'width': tableStyle.tableWidth}]">
        <thead>
            <tr>
                <th class="fixed">
                    <div class="d-flex">
                        <div>{{$t('UserTimesheet.users')}}</div>
                        <div>{{$t('ProjectDetails.key')}}</div>
                        <div>{{$t('UserTimesheet.logged')}}<p class="m-0">{{$t('UserTimesheet.hours')}}</p></div>
                        <div>{{$t('UserTimesheet.planned')}}<p class="m-0">{{$t('UserTimesheet.hours')}}</p></div>
                    </div>
                </th>
                <th v-for="(colName, index) in theModel" :key="index" class="activeCurrentIndex" v-bind:class="[{ 'weekoff': colName.day == 'Sat' || colName.day == 'Sun', 'current_date': colName.fullDate == colName.currentDate}]">
                    <p>
                        <span class="color47 mr-4px">{{colName.day}},</span>
                            <strong class="m-0" v-if="colName.arabiDay != undefined && colName.arabiMonth != undefined">{{colName.date}}<sup>{{colName.arabiDay}}</sup> {{colName.arabiMonth}}</strong>
                            <strong class="m-0" v-else>{{colName.date}} {{colName.dateMonth}}</strong>
                    </p>
                   <div class="inner_div displayRate">
                            <span>{{$t('UserTimesheet.logged')}}<br> {{$t('UserTimesheet.hours')}}</span>
                            <span>{{$t('UserTimesheet.planned')}}<br>{{$t('UserTimesheet.hours')}}</span>
                    </div>
                </th>
            </tr>
        </thead>
        <tbody v-for="row in usersArray" :key="row.id">
            <WorkloadTimeSheetTrComponent :filterType="filterType" :checkedFilter="checkedFilter" :userTrData="row" :isView="isView" :projectData="projectData" v-model="theModel" :tableStyl="tableStyle" :activeWeek="activeWeekObj" @update:getSubItem="getProjectData"  @update:getTaskData="getTask"/>
        </tbody>
        <tfoot v-if="usersArray.length">
            <tr class="total_hours_row">
                <td class="fixed">
                    <div class="d-flex">
                        <div>{{$t('TimeTracker.total')}}</div>
                        <div></div>
                        <div>{{ convertedTimeString(finalTotalLoggedHrs,'update') }}</div>
                        <div>{{ convertedTimeString(finalTotalEstimate,'update') }}</div>
                    </div>
                </td>
                <td v-for="(colName, index) in theModel" :key="index" 
                    v-bind:class="[{ 'weekoff': colName.day == 'Sat' || colName.day == 'Sun', 'current_date': colName.fullDate == colName.currentDate}]"
                    >
                    <div class="inner_div displayRate">
                        <span> {{ getTotalDateRowLog(colName,"totalUserLogs") && getTotalDateRowLog(colName,"totalUserLogs") > 0 ? convertedTimeString(getTotalDateRowLog(colName,"totalUserLogs"),'update') : ''}}</span>
                        <span> {{ getTotalDateRowLog(colName,"totalUserEst") && getTotalDateRowLog(colName,"totalUserEst") > 0 ? convertedTimeString(getTotalDateRowLog(colName,"totalUserEst"),'update') : ''}}</span>
                    </div>
                </td>
            </tr>
        </tfoot>
    </table>
    <div v-if="isNoRecordShow" class="text-center red mt-15px">{{$t('UserTimesheet.no_records_found')}}</div>
</div>
</template>
<script setup>
import { watch, ref, computed } from 'vue';
import { getConvertedTimeString, totalDateRowLog } from '@/composable/commonFunction';
import WorkloadTimeSheetTrComponent from '@/components/atom/TimesheetView/WorkloadTImeSheetView/WorkloadTimeSheetTrComponent'
    const props = defineProps({
        modelValue : {
            type : Array,
            default : ()=>([])
        },
        usersArray : {
            type : Array,
            default : ()=>([])
        },
        activeWeekObj : {
            type : Object,
            default:()=>({})
        },
        tableStyle : {
            type : Object,
            default : ()=>({})
        },
        isView : {
            type : Boolean,
            default: false
        },
        isNoRecordShow:{
            type: Boolean,
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
    })
    const theModel = ref(props.modelValue);
    const emit = defineEmits(["update:getSubItemView","update:getTaskData"]);
    watch(()=> props.modelValue ,(val)=>{
        theModel.value = val;
    })
    const finalTotalLoggedHrs = computed(()=>{
        return props.usersArray.reduce((acc, item) => acc + item.totalLoggedHours, 0);
    })
    const finalTotalEstimate = computed(()=>{
        return props.usersArray.reduce((acc, item) => acc + item.estMin, 0);
    })
    function convertedTimeString(n, type){
        return getConvertedTimeString(n,type);
    }
    function getTotalDateRowLog(colName,key){
        return totalDateRowLog(colName,props.usersArray,key)
    }
    const getProjectData = (userObj,cbd) => {
        emit("update:getSubItemView",userObj,(cb)=>{
            userObj = cb.data;
            cbd({'status' : true,'data':userObj});
        });
    }
    const getTask = (projectObje,cbd) => {
        emit("update:getTaskData",projectObje,(cb)=>{
            projectObje = cb.data;
            cbd({'status' : true,'data':projectObje});
        });
    }
    let minimized = false;
    function checkScroll(e) {
        if(minimized && e.target.scrollLeft <= 150) {
            minimized = false;
            document.querySelectorAll(".fixed").forEach((x) => {
                x.classList.remove('make-width-small')
            })
        } else if(!minimized && e.target.scrollLeft >= 150) {
            minimized = true;
            document.querySelectorAll(".fixed").forEach((x) => {
                x.classList.add('make-width-small')
            })
        }
    }
</script>
<style src="../style.css"></style>
<style scoped>
.inner_div {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
}
.inner_div.displayRate span {
  width: 100%;
}
.inner_div span {
  width: 50%;
  height: 40px;
}
.workload_view table.table.timesheet_table tr th .inner_div.displayRate {
    margin-bottom: 0px;
}
th.fixed div {
    font-size: 15px;
}
.workload_view table.table.timesheet_table tr th p {
    margin-top: 7px!important;
    font-size: 15px;
}
th {
    padding: 6px 10px;
    padding-top: 5px;
    padding-bottom: 3px;
    border: 0;
    text-align: left;
    font-size: .85rem;
}
.workload_view table.table.timesheet_table tr th.fixed p {
    margin-top: 0!important;
}

</style>
