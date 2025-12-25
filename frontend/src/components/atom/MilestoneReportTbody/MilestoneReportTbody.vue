<template>
    <tr class="bg-white" :class="[{'background_color_currency':currencyIndex === props.index}]">
        <td class="fixed bg-white" :class="[{'background_color_currency':currencyIndex === props.index,'td_class_border':props.daysOrMonth && props.daysOrMonth.length ? new Date().getMonth() === 0 && new Date().getDate() === 1 : new Date().getMonth() === 0}]">
            <div class="d-flex justify-content-between">
                <div class="thtitle padding_wrapper_arrow">
                    <img v-if='currencyIndex === props.index' :src="arrowToogle" alt="arrowToogle" @click="handleToogleCurrency(props.index)" class="rotate_arrow cursor-pointer">
                    <img v-else :src="arrowToogle" alt="arrowToogle" @click="handleToogleCurrency(props.index)" class="cursor-pointer">
                    <span class="thtitle_currency_family black padding_wrapper_left_arrow">{{props.index}}</span>
                </div>
                <div class="thtitle"></div>
                <div class="thtitle"></div>
                <div class="thtitle">
                    <span class="thtitle_currency_family black text-ellipsis d-block" :title="`${props.objectProjectCurrencyBody.currencySymbol} ${props.daysOrMonth && props.daysOrMonth.length === 0 ? getCommaSeperatedNumber(calculateTotalAmount()) : getCommaSeperatedNumber(calculateTotalAmountDate())}`">
                        {{props.objectProjectCurrencyBody.currencySymbol}} {{props.daysOrMonth && props.daysOrMonth.length === 0 ? getCommaSeperatedNumber(calculateTotalAmount()) : getCommaSeperatedNumber(calculateTotalAmountDate())}}
                    </span>
                </div>
            </div>
        </td>
        <template v-for="(monthDate,monthIndex) in props.daysOrMonth && props.daysOrMonth.length ? props.daysOrMonth : 12" :key="monthIndex">
            <td 
            :class="[{
                'border-color-highlight-left':props.daysOrMonth.length === 0 ? new Date().getMonth() === monthIndex : new Date().getMonth() === new Date(monthDate.date).getMonth() && new Date().getDate() === monthIndex + 1,
                'border-color-highlight-left-next':props.daysOrMonth.length === 0 ? new Date().getMonth() + 1 === monthIndex : new Date().getMonth() === new Date(monthDate.date).getMonth() && new Date().getDate() === monthIndex
            }]" 
            class="border_currency totalAmountCurrencyFamily black text-center font-weight-700 text-ellipsis" :title="`${totalProjectCurrency(monthDate,monthIndex) === 0 ? '' : `${props.objectProjectCurrencyBody.currencySymbol} ${getCommaSeperatedNumber(totalProjectCurrency(monthDate,monthIndex))}`}`">{{totalProjectCurrency(monthDate,monthIndex) === 0 ? '' : `${props.objectProjectCurrencyBody.currencySymbol} ${getCommaSeperatedNumber(totalProjectCurrency(monthDate,monthIndex))}`}}</td>
        </template>
    </tr>
    <template v-if="currencyIndex === props.index">
        <template v-for="(project,proIndex) in props.objectProjectCurrencyBody.projectDeatil" :key='proIndex'>
            <MilestoneReportTbodyProject
                :project="project"
                :currencySymbol="props.objectProjectCurrencyBody.currencySymbol"
                :daysOrMonth="props.daysOrMonth"
                :yearSelected="props.yearSelected"
            />
        </template>
    </template>
    <MilestoneTotal 
        v-if="currencyIndex === props.index"
        :daysOrMonth="props.daysOrMonth"
        :allMilestoneArray="props.objectProjectCurrencyBody.allMilestoneArray"
        :currencySymbol="props.objectProjectCurrencyBody.currencySymbol"
        :yearSelected="props.yearSelected"
    />
</template>

<script setup>

    // import 
    import { ref,watch,defineProps } from 'vue';
    import MilestoneReportTbodyProject from '@/components/atom/MilestoneReportTbodyProject/MilestoneReportTbodyProject.vue'
    import MilestoneTotal from '@/components/atom/MilestoneTotal/MilestoneTotal.vue'
    import {milestoneData} from '@/components/organisms/FixMilestone/helper.js';
    const { getCommaSeperatedNumber } = milestoneData();
    // Variable
    const currencyIndex = ref('');
    const prevCurrencyIndex = ref('');
    // const totalCurrency = ref(0)

    // image
    const arrowToogle = require("@/assets/images/table_arrow.png");

    // watch 
    watch(()=> currencyIndex.value,(newValue) =>{
        prevCurrencyIndex.value = newValue;
    });
    

    // props
    const props = defineProps({
        objectProjectCurrencyBody: {type:Object,default: () => {}},
        index: {type:String,default: ''},
        daysOrMonth:{type:Array,default:()=>[]},
        yearSelected:{type:String,require:true}
    });

    // function start
    // toogle event for currency
    const handleToogleCurrency = (value) => {
        if(prevCurrencyIndex.value && prevCurrencyIndex.value === currencyIndex.value ){
            currencyIndex.value = "";
        }else{
            currencyIndex.value = value;
        }
    };
    // all milesetoneCalculation
    const calculateTotalAmount = () => {
        return props.objectProjectCurrencyBody.allMilestoneArray.reduce((accumulator, currentValue) => {
            let totalAmount = accumulator;
            if (currentValue.refundedAmount && currentValue.refundedAmount.length) {
                if(`${new Date(currentValue.statusDate).getFullYear()}` === props.yearSelected){
                    totalAmount += currentValue.amount;
                    currentValue.refundedAmount.filter((filteramonut) => `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e) => {
                        totalAmount -= e.amount;
                    });
                }else{
                    currentValue.refundedAmount.filter((filteramonut) => `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e) => {
                        totalAmount -= e.amount;
                    });
                }
            } else {
                totalAmount += currentValue.amount;
            }
            return totalAmount;
        },0);
    };
    const calculateTotalAmountDate = () => {
        let start = new Date(props.daysOrMonth[0].date).setHours(0,0,0)
        let filterMile = props.objectProjectCurrencyBody.allMilestoneArray.filter((ele)=>{
            return ele.refundedAmount && ele.refundedAmount.length ? ele : new Date(ele.statusDate).getMonth() === new Date(start).getMonth()
        });
        return filterMile.reduce((accumulator, currentValue) => {
            let totalAmount = accumulator;
            if (currentValue.refundedAmount && currentValue.refundedAmount.length) {
                if(new Date(currentValue.statusDate).getMonth() === new Date(start).getMonth()){
                    totalAmount += currentValue.amount;
                    currentValue.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getMonth() === new Date(start).getMonth() && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e) => {
                        totalAmount -= e.amount;
                    });
                }else{
                    currentValue.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getMonth() === new Date(start).getMonth() && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e) => {
                        totalAmount -= e.amount;
                    });
                }
            } else {
                totalAmount += currentValue.amount;
            }
            return totalAmount;
        }, 0);
    };
    // total currency
    const totalProjectCurrency = (value,ele) => {
        let total = 0
        if(props.daysOrMonth && props.daysOrMonth.length){
            props.objectProjectCurrencyBody.allMilestoneArray.filter((filterELe) => {return (filterELe.refundedAmount && filterELe.refundedAmount.length) ? filterELe : new Date(filterELe.statusDate).getDate() === ele + 1 && new Date(value.date).getMonth() === new Date(filterELe.statusDate).getMonth()}).forEach((element) => {
                if(element.refundedAmount && element.refundedAmount.length){
                    if(new Date(element.statusDate).getDate() === ele + 1 && new Date(value.date).getMonth() === new Date(element.statusDate).getMonth() && `${new Date(element.statusDate).getFullYear()}` === props.yearSelected){
                        total += element.amount
                        element.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getDate() === ele + 1 && new Date(filteramonut.date).getMonth() === new Date(value.date).getMonth() && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e)=>{
                            total -= e.amount
                        });
                    }else{
                        element.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getDate() === ele + 1 && new Date(filteramonut.date).getMonth() === new Date(value.date).getMonth() && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e)=>{
                            total -= e.amount
                        });
                    }
                }else{
                    total += element.amount;
                }
            });
        }else{
            props.objectProjectCurrencyBody.allMilestoneArray.filter((filterELe) => {return (filterELe.refundedAmount && filterELe.refundedAmount.length) ? filterELe : new Date(filterELe.statusDate).getMonth() === ele}).forEach((element) => {
                if(element.refundedAmount && element.refundedAmount.length){
                    if(new Date(element.statusDate).getMonth() === ele && `${new Date(element.statusDate).getFullYear()}` === props.yearSelected){
                        total += element.amount
                        element.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getMonth() === ele && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e)=>{
                            total -= e.amount
                        });
                    }else{
                        element.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getMonth() === ele && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e)=>{
                            total -= e.amount
                        });
                    }
                }else{
                    total += element.amount; 
                }
            });
        }
        return total
    };
</script>
