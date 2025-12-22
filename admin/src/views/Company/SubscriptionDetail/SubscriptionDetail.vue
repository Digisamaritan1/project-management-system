<template>
    <div>
        <div class="current_plan_wrapper">
            <span class="shade-black font-size-18 font-weight-500 rightBox-title">Current Plan</span>
            <div class="d-flex align-items-center justify-content-between current_plan--wrapperMain">
                <div class="cp_detail-left">
                    <div class="d-flex align-items-center cp_detail">
                        <span class="gray font-weight-400 font-size-14">Current Plan</span>
                        <span class="black font-weight-400 font-size-14">{{currentPlan}}</span>
                    </div>
                    <div class="d-flex align-items-center cp_detail">
                        <span class="gray font-weight-400 font-size-14">Subscription Plan</span>
                        <span class="black font-weight-400 font-size-14">{{newxtPaybleAmount}}</span>
                    </div>
                    <div class="d-flex align-items-center cp_detail">
                        <span class="gray font-weight-400 font-size-14">Next Renew Date</span>
                        <span class="black font-weight-400 font-size-14">{{nextRenewDate}}</span>
                    </div>
                </div>
                <div class="cp_detail-right">
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="black font-weight-500 font-size-16">Storage Use</span>
                        <span class="black font-weight-500 font-size-16">{{selectedCompany?.planFeature?.bucketStorage === null ? `${selectedCompany?.bucketSize ? (selectedCompany?.bucketSize/1024).toFixed(2) : 0} GB of Unlimited` : `${selectedCompany?.bucketSize ? (selectedCompany?.bucketSize/1024).toFixed(2) : 0} GB of ${selectedCompany?.planFeature?.bucketStorage === null ? 'Unlimited' : `${(selectedCompany?.planFeature?.bucketStorage / 1024).toFixed(2) || 0} GB Used`}`}}</span>
                    </div>
                    <Progress :value="usedSize || 0" :id="'file_storage'" />
                </div>
            </div>
        </div>
        <div class="billing_adress_wrapper">
            <span class="shade-black font-size-18 font-weight-500 rightBox-title">Billing Address</span>
            <div class="d-flex flex-wrap billing_adress_wrapper-contant">
                <div class="d-flex align-items-center billing_deail">
                    <span class="gray font-weight-400 font-size-14">Address</span>
                    <span class="black font-weight-400 font-size-14 ">{{selectedCompany?.billingDetails?.address1}}</span>
                </div>
                <div class="d-flex align-items-center billing_deail">
                    <span class="gray font-weight-400 font-size-14">Country</span>
                    <span class="black font-weight-400 font-size-14 ">{{selectedCompany?.billingDetails?.country}}</span>
                </div>
                <div class="d-flex align-items-center billing_deail">
                    <span class="gray font-weight-400 font-size-14">State</span>
                    <span class="black font-weight-400 font-size-14 ">{{selectedCompany?.billingDetails?.state}}</span>
                </div>
                <div class="d-flex align-items-center billing_deail">
                    <span class="gray font-weight-400 font-size-14">Zip Code</span>
                    <span class="black font-weight-400 font-size-14 ">{{selectedCompany?.billingDetails?.zipCode}}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed, onMounted, ref } from "vue"
import { useStore } from "vuex";
import Progress from '@/components/atom/Progress/Progress.vue'
const { getters, dispatch } = useStore();
import { paymentHelper } from '@/utils/paymentHelper/helper';
const {companySubscriptionDetailFunction} = paymentHelper();

const props = defineProps({
    selectedCompany: {
        type: Object,
        required: true
    }
})
const currentPlan = ref('');
const nextRenewDate = ref('');
const newxtPaybleAmount = ref('');
const chargeBeePriceData = computed(() => {
    return getters["planTab/chargeBeePrice"];
})

onMounted(async() => {
    if(chargeBeePriceData.value && !chargeBeePriceData.value.length){
        dispatch('planTab/setChargeBeePrice').then(async(res) => {
            chargeBeePriceData.value = res;
            getplanDetail();
        })
    }else{
        getplanDetail();
    }
})

function getplanDetail () {
    if (props.selectedCompany && props.selectedCompany.SubcriptionId && props.selectedCompany.SubcriptionId !== '') {
        companySubscriptionDetailFunction(props.selectedCompany.SubcriptionId,chargeBeePriceData.value).then((res)=>{
            newxtPaybleAmount.value = res.newxtPaybleAmount;
            currentPlan.value = res.currentPlan;
            nextRenewDate.value = res.nextRenewDate;
            nextRenewDate.value = res.nextRenewDate;
        }).catch((error)=>{
            console.error(error);
        })
    }
}
const usedSize = computed(() => {
    if(!props.selectedCompany?.bucketSize){
        return 0;
    }
    if(props.selectedCompany?.planFeature?.bucketStorage === null){
        return 100
    }else{
        return (props.selectedCompany?.bucketSize / props.selectedCompany?.planFeature?.bucketStorage) * 100;
    }
})
</script>
<style src="./style.css">
</style>