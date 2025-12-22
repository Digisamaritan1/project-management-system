
<template>
<div class="timesheet_table_wrapper" @scroll="checkScroll">
    <table class="table timesheet_table" v-bind:class="[{ 'isWeeked': activeWeekObj.isWeeked,'isOneday': activeWeekObj.isOneday,
                    'isTwoday': activeWeekObj.isTwoday,'isThreeday': activeWeekObj.isThreeday,'isFourday': activeWeekObj.isFourday,
                    'isFiveday': activeWeekObj.isFiveday,
                    'isSixday': activeWeekObj.isSixday}]" :style="[{'width': tableStyle.tableWidth}]">
        <thead>
            <tr>
                <th class="fixed">
                    <div class="d-flex">
                        <div>{{$t('UserTimesheet.users')}}</div>
                        <div>{{$t('ProjectDetails.key')}}</div>
                        <div></div>
                        <div> {{$t('UserTimesheet.logged')}} <p class="m-0">{{$t('UserTimesheet.hours')}}</p></div>
                    </div>
                </th>
                <th v-for="(colName, index) in theModel" :key="index" v-bind:class="[{ 'weekoff': colName.day == 'Sat' || colName.day == 'Sun', 'current_date': colName.fullDate == colName.currentDate}]">
                    <span class="color47 mr-4px">{{colName.day}}</span>
                    <p class="m-0 font-size-15" v-if="colName.arabiDay != undefined && colName.arabiMonth != undefined">{{colName.date}}<sup>{{colName.arabiDay}}</sup> {{colName.arabiMonth}}</p>
                    <p class="m-0 font-size-15" v-else>{{colName.date}} {{colName.dateMonth}}</p>
                    <div class="inner_div displayRate">
                    </div>
                </th>
            </tr>
        </thead>
        <tbody v-for="row in usersArray" :key="row.id">
            <UserTimeSheetTrComponent :filterType="filterType" :checkedFilter="checkedFilter" :userTrData="row" v-model="theModel" :tableStyl="tableStyle" :activeWeek="activeWeekObj" @update:getSubItem="getProjectData"  @update:getTaskData="getTask"/>
        </tbody>
        <tfoot v-if="usersArray.length">
            <tr class="total_hours_row">
                <td class="fixed">
                    <div class="d-flex">
                        <div>{{$t('TimeTracker.total')}}</div>
                        <div></div>
                        <div></div>
                        <div>{{ convertedTimeString(finalTotalLoggedHrs,'update') }}</div>
                    </div>
                </td>
                <td v-for="(colName, index) in theModel" :key="index" 
                    v-bind:class="[{ 'weekoff': colName.day == 'Sat' || colName.day == 'Sun', 'current_date': colName.fullDate == colName.currentDate}]"
                    >
                    <div>
                        <span> {{ getTotalDateRowLog(colName,"totalUserLogs") && getTotalDateRowLog(colName,"totalUserLogs") > 0 ? convertedTimeString(getTotalDateRowLog(colName,"totalUserLogs"),'update') : ''}}</span>
                    </div>
                </td>
            </tr>
        </tfoot>
    </table>
    <div v-if="isNoRecordShow"  class="text-center red mt-15px">{{$t('UserTimesheet.no_records_found')}}</div>
</div>
</template>
<script setup>
import { watch, ref, computed } from 'vue';
import { getConvertedTimeString, totalDateRowLog } from '@/composable/commonFunction';
import UserTimeSheetTrComponent from '@/components/atom/TimesheetView/UserTimeSheetView/UserTimeSheetTrComponent'
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
        isNoRecordShow:{
            type: Boolean,
            default: false
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
    function convertedTimeString(n, type){
        return getConvertedTimeString(n,type);
    }
    function getTotalDateRowLog(colName,key){
        return totalDateRowLog(colName,props.usersArray,key)
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
</script>
<style src="../style.css"></style>
