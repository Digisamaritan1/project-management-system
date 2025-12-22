<template>
    <div class="project__upgradwrapper-popup addon-popup cards-popup position-ab m0-auto bg-light-gray border-radius-15-px" :style="{'border-radius': (showSomethingWentWrong || showSuccessPlanPurchase) ? '20px' : '15px'}" style="width:680px">
        <SpinnerComp :is-spinner="isSpinner" />
            <div :style="{'opacity': isSpinner ? 0.5 : 1, 'pointer-events': isSpinner ? 'none' : ''}">
                <div class="position-ab close__modal-wrapper" v-if="!showSomethingWentWrong && !showSuccessPlanPurchase && !insufficientFunds">
                    <img :src="cancelIcon" alt="" class="cursor-pointer"  @click="cancelModel"/>
                </div>
                <div class="upgrade__mainsection-wrapper addonWrapper" v-if="!showSomethingWentWrong && !showSuccessPlanPurchase && !isSpinner && !insufficientFunds"  :class="{'p-15px' : clientWidth <=767 , 'p-30px' : clientWidth > 767 }">
                    <div class="payment__text font-size-22 font-weight-700 black pb-20px">
                        {{$t('Subscription.update_subscription')}}
                    </div>
                    <div class="plan__detail-wrapper border-radius-12-px bg-light-blue p-20px mb-20px" v-if="!showConfirmation">
                        <div class="font-size-22 pb-10px font-weight-500">{{$t('Subscription.updated_subscription_price')}}</div>
                        <div class="d-flex align-items-baseline border-radius-12-px justify-content-between plan__statusprice-wrapper">
                            <div class="plan__dynamic-text font-size-22 font-weight-700 black">
                                {{updatedData.planDetails.name}} Plan<span class="plan__count-multipliaction font-size-16 font-weight-400 black d-block pt-5px"> {{planText}}</span>
                            </div>
                            <div class="plan__use-total font-size-22 font-weight-700 black">
                                <span>$</span>{{planPrice}}
                            </div>
                        </div>
                    </div>
                    <div class="plan__detail-wrapper border-radius-12-px bg-white p-20px mb-20px" v-if="!showConfirmation && noteShow && !isOverWrite">
                        <div class="ml-15px font-weight-700">{{$t('Subscription.subscription_upgrade_from')}} {{moment(subscriptionData.next_billing_at * 1000).format("DD MMM,YYYY")}}</div>
                        <div class="buy__now-btn upgrade_subscription">
                            <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer" @click="makePayment()">{{$t('Subscription.upgrade_subscription')}}</button>
                        </div>
                    </div>
                    <div class="plan__detail-wrapper border-radius-12-px bg-light-blue p-20px mb-20px" v-if="!showConfirmation && creditNoteText !== '' && !noteShow">
                        <div class="font-weight-400">{{creditNoteText}}</div>
                    </div>
                    <div class="plan__detail-wrapper border-radius-12-px bg-white p-20px" v-if="!showConfirmation && (!noteShow || isOverWrite)">
                        <div class="font-size-22 pb-10px font-weight-500">{{$t('Subscription.current_billing_for_upgrade')}}</div>
                        <div class="align-items-center border-radius-12-px mb-20px justify-content-between plan__statusprice-wrapper">
                            <div class="plan__dynamic-text font-weight-700 black">
                                {{updatedData.planDetails.name}} Plan<span class="plan__count-multipliaction font-size-16 font-weight-400 black d-block pt-5px"> <span class="font-weight-400">{{billingText}}</span></span>
                            </div>
                            <div class="plan__use-total black font-weight-700 black">
                                <div class="d-flex justify-content-between"><span>{{$t("TimeTracker.total")}}:</span><span>${{invoicePrice}}</span></div>
                                <div class="d-flex justify-content-between"><span>{{$t('Subscription.credits_applied')}}:</span><span>${{totalAppliedCredits}}</span></div>
                                <div class="d-flex justify-content-between"><span>{{$t('Subscription.total_payable_amount')}}:</span><span>${{totalPaybleAmount}}</span></div>
                            </div>
                        </div>
                        <div class="buy__now-btn paybtn--green pb-20px" v-if="!showConfirmation">
                            <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer bg-dark-green" @click="makePayment()">Pay ${{totalPaybleAmount}}</button>
                        </div>
                    </div>
                    <div class="form-check_wrapper bg-white p-20px border-radius-12-px mb-20px" v-if="showConfirmation">
                        <div v-html="confirmText"></div>
                        <!-- <div class="mt-30px font-weight-700" v-if="noteShow">Note: The subscription update will take effect at the end of the current term.</div> -->
                    </div>
                    <div class="buy__now-btn buy_now-btn--half d-flex"  v-if="showConfirmation">
                        <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer" @click="updateSubscriptionEstimate(false)">{{$t('Home.yes')}}</button>
                        <button class="font-size-16 font-weight-400 outline-primary cursor-pointer" @click="cancelModel()">{{$t('Filters.No')}}</button>
                    </div>
                </div>
                <div v-if="showSuccessPlanPurchase" class="upgrade__mainsection-wrapper addonWrapper">
                    <div class="success__bg-green bg-dark-greenmodal"></div>
                    <div class="success__planimg d-flex justify-content-center position-ab m0-auto">
                        <span><img :src="successIcon" alt="success"></span>
                    </div>
                    <div class="plan__upgradesucessfully-wrapper w-100 m0-auto text-center bg-white">
                        <div>
                            <span class="payment__text font-size-22 font-weight-700 black pb-20px text-capitalize">{{$t('Upgrades.plane_upgrade')}}</span>
                            <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px" v-if="(!noteShow || isOverWrite)">{{$t('Upgrades.plane_upgrade_msg')}}</span>
                            <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px" v-if="(noteShow && !isOverWrite)">{{$t('Subscription.plan_upgrade_success')}}</span>
                            <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">
                                <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="$router.push({name: 'Projects'})">{{$t('UserTimesheet.back_projects')}}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="showSomethingWentWrong" class="upgrade__mainsection-wrapper addonWrapper">
                    <div class="success__bg-green bg-dark-redmodal"></div>
                    <div class="success__planimg d-flex justify-content-center position-ab m0-auto">
                        <span><img :src="rejectIcon" alt="reject"></span>
                    </div>
                    <div class="plan__upgradesucessfully-wrapper w-100 m0-auto text-center bg-white">
                        <span class="payment__text font-size-22 font-weight-700 black pb-20px">{{errorMessage || $t('Upgrades.something_wrong')}}</span>
                        <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px">{{$t('Upgrades.unsucessfull_msg')}}</span>
                        <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">
                            <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="$router.push({name: 'Projects'})">{{$t('UserTimesheet.back_projects')}}</button>
                        </div>
                    </div>
                </div>
                <div v-if="insufficientFunds" class="upgrade__mainsection-wrapper addonWrapper">
                    <div class="success__bg-green bg-dark-redmodal"></div>
                    <div class="success__planimg d-flex justify-content-center position-ab m0-auto">
                        <span><img :src="rejectIcon" alt="reject"></span>
                    </div>
                    <div class="plan__upgradesucessfully-wrapper w-100 m0-auto text-center bg-white">
                        <span class="payment__text font-size-22 font-weight-700 black pb-20px">{{$t('Billing.insufficient_funds')}}</span>
                        <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px">{{$t('Billing.plan_upgrade_unsuccessful')}}</span>
                        <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">
                            <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="$router.push({name: 'Projects'})">{{$t('UserTimesheet.back_projects')}}</button>
                        </div>
                    </div>
                </div>
            </div>
    </div>
</template>
<script setup>
import { computed, inject, onMounted, ref } from "vue";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import { useStore } from "vuex";
import { apiRequest } from "@/services";
import { useToast } from 'vue-toast-notification';
import * as env from '@/config/env';
import moment from "moment";
import { useI18n } from "vue-i18n";


const {getters} = useStore();
const { t } = useI18n();
const clientWidth = inject("$clientWidth");
const showSuccessPlanPurchase =ref(false);
const showSomethingWentWrong =ref(false);
const insufficientFunds =ref(false);
const showConfirmation = ref(true);
const isOverWrite = ref(false);
const creditNoteText = ref('');
const isSpinner = ref(false);
const confirmText = ref(false);
const planText = ref('');
const billingText = ref('');
const planPrice = ref('');
const invoicePrice = ref(null);
const errorMessage = ref("");
let updatesubscriptionObj = {};
const totalAppliedCredits = ref(null);
const totalPaybleAmount = ref(null);
const companyId = inject("$companyId");
const $toast = useToast();
const rejectIcon = require("@/assets/images/rejectpayment.png");
const successIcon = require("@/assets/images/approve.png");
const cancelIcon = require("@/assets/images/closemodal.png");
const emits = defineEmits(["closeUpdateModel"])
const props = defineProps({
    subscriptionData: {
        type: Object
    },
    updatedData: {
        type: Object
    },
    selectedPeriod: {
        type: String
    },
    currentPlan: {
        type: String
    },
    currentPeriod: {
        type: String
    }
})


const chargeBeePriceData = computed(() => {
    if (getters["settings/chargeBeePrice"]) {
        return getters["settings/chargeBeePrice"];
    } else {
        return [];
    }
})
const companyUsers = computed(() => {
    return getters['settings/companyUsers'].filter(user => user.isDelete === false);
});


onMounted(() => {
    confirmText.value = `${t('Subscription.confirm_subscription_change')} <b>${props.currentPlan}-${(props.currentPeriod == 'month') ? t('Subscription.monthly') : t('Subscription.yearly')} </b> to <b>${props.updatedData.planDetails.name}-${(props.selectedPeriod == 'month') ? t('Subscription.monthly') : t('Subscription.yearly')}</b> ?`
})



function cancelModel() {
    emits("closeUpdateModel",true);
}
function updateSubscriptionEstimate(isImmdiate) {
   showConfirmation.value = false;
   isSpinner.value = true;
    if (isImmdiate) {
        isOverWrite.value = true;
    }
   let obj = {
        subscriptionId: props.subscriptionData.subscriptionId,
        isPlanChange: !(props.currentPlan.toLocaleLowerCase() === props.updatedData.planDetails.name.toLocaleLowerCase()),
        isPeriodChange: !(props.currentPeriod === props.selectedPeriod),
        planId: props.updatedData.planName,
        isOverWrite: isImmdiate,
        currentUsers: companyUsers.value.length
   }
    apiRequest("post", env.UPDATESUBSCRIPTIONPAYMENTSTIMATE, obj).then((resp) => {
        if(resp.data.status == true) {
            isSpinner.value = false;
            let estimate = resp.data.statusText.estimate
            let invoiceEstimate = estimate.estimate.invoice_estimate || estimate.estimate.next_invoice_estimate
            invoicePrice.value = Number(Number(invoiceEstimate.total) / 100).toFixed(2);
            let planId = invoiceEstimate.line_items.find((x)=> x.entity_type === 'plan_item_price').entity_id || '';
            let price = chargeBeePriceData.value.find((x)=> x.itemPriceArray.find((y)=> y.id == planId)).itemPriceArray.find((a)=> a.id == planId).price || null;
            if (price) {
                let oneUserPrice = Number((price)/100)
                planPrice.value = Number((price * companyUsers.value.length)/100).toFixed(2);
                planText.value =  `($${props.selectedPeriod == 'year' ? Number((oneUserPrice/12)).toFixed(2) : Number(oneUserPrice).toFixed(2)} X ${companyUsers.value.length} ${companyUsers.value.length == 1 ? 'User' : 'Users'} X ${props.selectedPeriod == 'year' ?  '12 Months' : '1 Month'} )`;
                billingText.value = `${t('Subscription.invoice_period_coverage')} ${moment(invoiceEstimate.line_items[0].date_from * 1000).format("DD MMM, YYYY")} to ${moment(invoiceEstimate.line_items[0].date_to * 1000).format("DD MMM, YYYY")}`
                if (estimate.estimate.credit_note_estimates && estimate.estimate.credit_note_estimates.length) {
                    let total = estimate.estimate.credit_note_estimates.reduce((a,b) => a + b.total, 0)
                    creditNoteText.value = `${t('Subscription.credit_entitlement_congratulations')} $${Number(total / 100).toFixed(2)} ${t('Subscription.credit_note_application')}`
                }
                totalPaybleAmount.value = Number(invoiceEstimate.amount_due / 100).toFixed(2)
                totalAppliedCredits.value = Number(invoiceEstimate.credits_applied / 100).toFixed(2)
                updatesubscriptionObj = resp.data.statusText.updateObj
            } else {
                $toast.error(t('Toast.Something_went_wrong_Please_try_again'),{position: 'top-right'});
                console.error('price not found');
                isSpinner.value = false;
                cancelModel();    
            }
        } else {
            if (resp.data.error && resp.data.error.error_code && resp.data.error.error_code == 'scheduled_for_cancellation') {
                $toast.error(t('Toast.You_have_cancel_your_current_subscription_at_term_end_please_reactivate_subscription_and_try_again'),{position: 'top-right',duration: 10000});                
            } else {
                $toast.error(t('Toast.Something_went_wrong_Please_try_again'),{position: 'top-right'});
                console.error('error',resp.data.error.message);
            }
            isSpinner.value = false;
            cancelModel();    
        }
    }).catch((error) => {
        $toast.error(t('Toast.Something_went_wrong_Please_try_again'),{position: 'top-right'});
        console.error(error);
        isSpinner.value = false;
        cancelModel();
    })
}
function makePayment() {
    isSpinner.value = true;
    delete updatesubscriptionObj.subscription
    let obj = {
        subscriptionId: props.subscriptionData.subscriptionId,
        updateObj: updatesubscriptionObj,
        companyId: companyId.value
    }
    apiRequest("post", env.UPDATESUBSCRIPTIONPAYMENT, obj).then((resp) => {
        if(resp.data.status == true && !resp.data.error) {
            showSuccessPlanPurchase.value = true;
            isSpinner.value = false;
        } else {
            if(resp.data?.error?.message?.includes("Insufficient funds")) {
                insufficientFunds.value = true;
                isSpinner.value = false;
            } else if (resp.data?.error?.message?.includes("expired_card")) {
                showSomethingWentWrong.value = true;
                isSpinner.value = false;
                errorMessage.value = t('Toast.Your_card_is_expired');
            } else {
                showSomethingWentWrong.value = true;
                isSpinner.value = false;
                errorMessage.value = resp.data?.error?.message || t('Toast.Something_went_wrong_Please_try_again');
            }
        }
    }).catch((error) => {
        $toast.error(t('Toast.Something_went_wrong_Please_try_again'),{position: 'top-right'});
        console.error(error);
        isSpinner.value = false;
        cancelModel();
    })
}
</script>
<style scoped>
.buy__now-btn.upgrade_subscription {
    margin: 0 auto;
    margin-top: 10px;
    padding-bottom: 0;
}
.buy__now-btn.buy_now-btn--half {
    justify-content: space-between;
    background-color: #fff;
    padding: 20px;
    margin: -27px auto 0;
}
.buy__now-btn.buy_now-btn--half button {
    width: 48%;
    margin: 0;
}
.buy__now-btn.paybtn--green{padding-bottom: 0px;}
.buy__now-btn.paybtn--green .bg-dark-green {
    margin: 0;
    width: 100%;
    margin-top: 10px;
}
</style>