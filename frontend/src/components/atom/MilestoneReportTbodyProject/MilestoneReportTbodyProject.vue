<template>
    <tr class="bg-white project_name_wrapper">
        <td class="project_name_td" :class="[{'td_class_border':props.daysOrMonth && props.daysOrMonth.length ? new Date().getMonth() === 0 && new Date().getDate() === 1 : new Date().getMonth() === 0}]">
            <div class="d-flex justify-content-between">
                <div class="thtitle">
                    <img v-if="props.project._id === projectId" :src="arrowToogle" alt="arrowToogle" @click="handleToogleProject(props.project._id)" class="rotate_arrow cursor-pointer">
                    <img v-else :src="arrowToogle" alt="arrowToogle" @click="handleToogleProject(props.project._id)" class="cursor-pointer">
                    <span @click="redirectProjectList(props.project)" :class="[{'cursor-pointer':props.project.statusType !== 'close'}]" class="thtitle_currency_family GunPowder short_name padding_wrapper_left_arrow" :title="props.project.ProjectName">{{props.project.ProjectName}}</span>
                    <img  class="pl-20px vertical-middle" v-if="props.project.isPrivateSpace === false" :src="publicFolder" alt="private-project">
                </div>
                <div class="thtitle"></div>
                <div class="thtitle thtitle_currency_family GunPowder padding_wrappper_thtitle">
                    {{props.project.StartDate ? convertDateFormat(props.project.StartDate,'',{showDayName: false}) : ''}}
                </div>
                <div class="thtitle thtitle_currency_family GunPowder">
                    {{props.project.EndDate ? convertDateFormat(props.project.EndDate,'',{showDayName: false}) : ''}}
                </div>
            </div>
        </td>
        <template v-for="(monthDate,monthIndex) in props.daysOrMonth && props.daysOrMonth.length ? props.daysOrMonth : 12" :key="monthIndex">
            <td :class="[{
                    'border-color-highlight-left':props.daysOrMonth.length === 0 ? new Date().getMonth() === monthIndex : new Date().getMonth() === new Date(monthDate.date).getMonth() && new Date().getDate() === monthIndex + 1,
                    'border-color-highlight-left-next':props.daysOrMonth.length === 0 ? new Date().getMonth() + 1 === monthIndex : new Date().getMonth() === new Date(monthDate.date).getMonth() && new Date().getDate() === monthIndex
                }]"
                class="border_currency totalAmountCurrencyFamily lightGrey text-center font-weight-500 text-ellipsis"
                :title="`${totalProject(monthDate,monthIndex) === 0 ? '' : `${props.currencySymbol} ${getCommaSeperatedNumber(totalProject(monthDate,monthIndex))}`}`"
            >
                {{totalProject(monthDate,monthIndex) === 0 ? '' : `${props.currencySymbol} ${getCommaSeperatedNumber(totalProject(monthDate,monthIndex))}`}}
            </td>
        </template>
    </tr>
    <template v-if="props.project._id === projectId">
        <template v-for="(milestoneObj,milIndex) in props.project.milestoneArray" :key="milIndex">
            <MilestoneReportTbodyMilestone 
                :milestoneObj="milestoneObj"
                :currencySymbol="props.currencySymbol"
                :daysOrMonth="props.daysOrMonth"
                :yearSelected="props.yearSelected"
                :projectDetail="props.project"
            />
        </template>
    </template>
    <tr class="bg-white project_name_wrapper" v-if="props.project._id === projectId">
        <td class="project_name_mil_td" :class="[{'td_class_border':props.daysOrMonth && props.daysOrMonth.length ? new Date().getMonth() === 0 && new Date().getDate() === 1 : new Date().getMonth() === 0}]">
            <div class="d-flex justify-content-between align-items-center">
                <div class="thtitle">
                    <div class="thtitle_currency_family_mil lightGreyColor font-weight-500">
                        {{$t('Milestone.refunded_amount')}}
                    </div>
                </div>
                <div class="thtitle">
                </div>
                <div class="thtitle">
                </div>
                <div class="thtitle">
                </div>
            </div>
        </td>
        <template v-for="(monthDate,monthIndex) in props.daysOrMonth && props.daysOrMonth.length ? props.daysOrMonth : 12" :key="monthIndex">
            <td :class="[{
                    'border-color-highlight-left':props.daysOrMonth.length === 0 ? new Date().getMonth() === monthIndex : new Date().getMonth() === new Date(monthDate.date).getMonth() && new Date().getDate() === monthIndex + 1,
                    'border-color-highlight-left-next':props.daysOrMonth.length === 0 ? new Date().getMonth() + 1 === monthIndex : new Date().getMonth() === new Date(monthDate.date).getMonth() && new Date().getDate() === monthIndex
                }]"
                class="border_currency totalMilestoneCurrencyFamily lightGrey text-center"
            >
                {{handleRefundedAmount(monthDate,monthIndex) !== 0 ? `${props.currencySymbol} - ${getCommaSeperatedNumber(handleRefundedAmount(monthDate,monthIndex))}` : ''}}
            </td>
        </template>
    </tr>
</template>

<script setup>
    import { ref,defineProps,watch,inject } from 'vue';
    import { useConvertDate } from "@/composable";
    import MilestoneReportTbodyMilestone from '@/components/atom/MilestoneReportTbodyMilestone/MilestoneReportTbodyMilestone.vue'
    import { useRouter } from 'vue-router';
    import {milestoneData} from '@/components/organisms/FixMilestone/helper.js';
    const { getCommaSeperatedNumber } = milestoneData();
    const router = useRouter();
    const { convertDateFormat } = useConvertDate();

    // Variable
    const prevProjectId = ref('');
    const projectId = ref('');

    // image
    const arrowToogle = require("@/assets/images/table_arrow.png");
    const publicFolder = require("@/assets/images/public_folder.png");
    //inject
    const companyId = inject('$companyId');
    // watch
    watch(()=> projectId.value,(newValue) =>{
        prevProjectId.value = newValue;
    });
    // props
    const props = defineProps({
        project: {type:Object,default: () => {}},
        currencySymbol: {type:String,required:true},
        daysOrMonth:{type:Array,default:()=>[]},
        yearSelected:{type:String,require:true}
    });

    // function start
    // toogle event for project
    const handleToogleProject = (value) => {
        if(prevProjectId.value && prevProjectId.value === projectId.value ){
            projectId.value = "";
        }else{
            projectId.value = value;
        }
    };
    const totalProject = (value,ele) => {
        let total = 0
        if(props.daysOrMonth && props.daysOrMonth.length){
            props.project.milestoneArray.filter((filterELe) => {return (filterELe.refundedAmount && filterELe.refundedAmount.length) ? filterELe : new Date(filterELe.statusDate).getDate() === ele + 1 && new Date(value.date).getMonth() === new Date(filterELe.statusDate).getMonth()}).forEach((element) => {
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
            props.project.milestoneArray.filter((filterELe) => {return (filterELe.refundedAmount && filterELe.refundedAmount.length) ? filterELe : new Date(filterELe.statusDate).getMonth() === ele}).forEach((element) => {
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
    // refund amount
    const handleRefundedAmount = (value,ele) => {
        let total = 0;
        if(props.daysOrMonth && props.daysOrMonth.length){
            props.project.milestoneArray.filter((filterELe) => {return (filterELe.refundedAmount && filterELe.refundedAmount.length) ? filterELe : new Date(filterELe.statusDate).getDate() === ele + 1 && new Date(value.date).getMonth() === new Date(filterELe.statusDate).getMonth()}).forEach((element)=>{
                element.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getDate() === ele + 1 && new Date(value.date).getMonth() === new Date(filteramonut.date).getMonth() && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e)=>{
                    total += e.amount
                });
            });
        }else{
            props.project.milestoneArray.filter((filterELe) => {return (filterELe.refundedAmount && filterELe.refundedAmount.length) ? filterELe : new Date(filterELe.statusDate).getMonth() === ele}).forEach((element) => {
                element.refundedAmount.filter((filteramonut) => new Date(filteramonut.date).getMonth() === ele && `${new Date(filteramonut.date).getFullYear()}` === props.yearSelected).forEach((e)=>{
                    total += e.amount
                });
            });
        }
        return total
    };
    const redirectProjectList = (data) => {
        if(data.statusType !== 'close'){
            router.push({ name: 'Project', params: {cid: companyId.value, id: data._id},query: {tab: 'ProjectDetail'}});
        }
    };
</script>
