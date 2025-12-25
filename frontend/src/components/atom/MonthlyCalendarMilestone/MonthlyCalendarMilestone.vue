<template>
    <div class="calendar_wrapper z-index-2" >
        <div class="d-flex align-items-center calendar_year_wrapper" @click.stop.prevent="dropDownYearMonthly=false">
            <img class="cursor-pointer" :src="nextArrow" alt="nextArrow" @click.stop.prevent="decremenetYear(monthValueRange)">
            <div class="position-re"  id="dropDownmonthlyyear">
                <h5 class="monthyearfontfamily cursor-pointer" @click.stop.prevent="dropDownYearMonthly=true">{{monthValueRange}}</h5>
                <div v-if="Object.keys(monthlyOrweeklyRangesValue).length > 0 && dropDownYearMonthly === true" class="drop_down_month_year drop_down_month_year_month">
                    <ul class="d-block p-0">
                        <li class="select_drop_down_range" v-for="(value,index) in monthlyOrweeklyRangesValue" :key="index">
                            <span class="w-100 d-block"  @click.stop.prevent="yearFullMonth(index),dropDownYearMonthly=false">{{index}}</span>
                        </li>
                    </ul>
                </div>
            </div>
            <img class="cursor-pointer next__arrow" :src="nextArrow" alt="nextArrow" @click.stop.prevent="incrementYear(monthValueRange)">
        </div>
        <div class="d-flex calendar_month_wrapper" v-if="Object.keys(rangeValueMonthly).length" @click.stop.prevent="dropDownYearMonthly=false">
            <div class="common_class" v-for="(tempValue,indextemp) in months" :key='indextemp'>
                <div class="calendar_month_Font" v-if="checkMonth(tempValue)">
                    <span class="cursor-pointer" @click.stop.prevent="hourlyCalendar(rangeValueMonthly[tempValue][0])" :class="[{'addActiveClassForCurrentDate':tempValue === months[new Date().getMonth()] && monthValueRange === new Date().getFullYear().toString(), 'addActiveClass':tempValue === months[new Date(startDate).getMonth()] && monthValueRange === new Date(startDate).getFullYear().toString()}]">{{tempValue}}</span>
                </div>
                <div class="calendar_month_Font isDisable" v-else>
                    <span :class="[{'addActiveClass':tempValue === months[new Date().getMonth()] && monthValueRange === new Date().getFullYear().toString()}]">{{tempValue}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { defineProps,ref,defineEmits } from 'vue';
    import '@/components/atom/MonthlyCalendarMilestone/MonthlyCalendar.css';
    const props = defineProps({
        startDate: {type: [String,Object],required: true},
        rangeObject:{type:Object,required: true}
    });
    import { useI18n } from "vue-i18n";
    const { t } = useI18n();
    const emit = defineEmits(['startEndDate']);
    const monthlyOrweeklyRangesValue = ref(Object.keys(props.rangeObject).length ? props.rangeObject.monthlyOrweeklyRangesValue : {});
    const nextArrow = require('@/assets/images/svg/nextArrow.svg');
    const months = ref([t('monthName.jan'),t('monthName.feb'),t('monthName.mar'),t('monthName.apr'), t('monthName.may'), t('monthName.jun'),t('monthName.jul'),t('monthName.aug'),t('monthName.sep'),t('monthName.oct'),t('monthName.nov'),t('monthName.dec')]);
    const monthValueRange = ref(Object.keys(props.rangeObject).length ? props.rangeObject.monthValueRange : '');
    const rangeValueMonthly = ref(Object.keys(props.rangeObject).length ? props.rangeObject.rangeValueMonthly : {});
    const dropDownYearMonthly = ref(false);
    
    const checkMonth = (month) => {
        let isActive = false;
        Object.keys(rangeValueMonthly.value).forEach((key) => {
            if(month === months.value[new Date(rangeValueMonthly.value[key][0].start).getMonth()]) {
                isActive = true;
            }
        })
        return isActive;
    };
    const hourlyCalendar = (value) => {
        emit('startEndDate',value)
    };
    const decremenetYear = (value) => {
        Object.keys(monthlyOrweeklyRangesValue.value).forEach((val,index)=>{
            if(val === value){
                if(Object.keys(monthlyOrweeklyRangesValue.value)[index - 1] === undefined){
                    return;
                }
                monthValueRange.value = Object.keys(monthlyOrweeklyRangesValue.value)[index - 1]
                return rangeValueMonthly.value = monthlyOrweeklyRangesValue.value[monthValueRange.value]
            }
        })
    };
    const incrementYear = (value) => {
        Object.keys(monthlyOrweeklyRangesValue.value).forEach((val,index)=>{
            if(val === value){
                if(Object.keys(monthlyOrweeklyRangesValue.value)[index + 1] === undefined){
                    return;
                }
                monthValueRange.value = Object.keys(monthlyOrweeklyRangesValue.value)[index + 1]
                return rangeValueMonthly.value = monthlyOrweeklyRangesValue.value[monthValueRange.value]
            }
        })
    };
    const yearFullMonth = (value) => {
        if(value){
            monthValueRange.value = value 
            rangeValueMonthly.value = monthlyOrweeklyRangesValue.value[value]
        }
    };
</script>
<style scoped>
.next__arrow{
    transform: rotate(180deg);
}
</style>