<template>
    <div class="transection__detail bg-white border-radius-10-px p15x-20px position-re">
        <div class="planDetailBox__title font-size-22 font-weight-500 GunPowder mb-20px">
            {{$t('Header.billing_history')}}
        </div>
        <SpinnerComp :is-spinner="isSpinner" />
        <div v-if="!isSpinner">
            <div class="planDetailBox__title font-size-22 font-weight-500 GunPowder mb-20px">
                {{$t('Billing.Invoices')}}
            </div>
            <InvoiceTableComponent :transections="transections.invoiceArray" :isInvoice="true" @payPendingInvoice="(data) => payInvocie(data)" @download="(data) => downloadFunction(data)" />
            <div class="planDetailBox__title font-size-22 font-weight-500 GunPowder mb-20px mt-10px">
                {{$t('Billing.credit_notes')}}
            </div>
            <InvoiceTableComponent  :transections="transections.creditNoteArray" :isInvoice="false" @download="(data) => downloadFunction(data)"/>
        </div>
        <div v-if="isModelShow" class="project__upgradwrapper-popup pendingInvoice m0-auto bg-light-gray border-radius-15-px" :style="{'border-radius': (showSomethingWentWrong || showSuccessPlanPurchase || insufficientFunds) ? '20px' : '15px'}" style="width:680px">
            <SpinnerComp :is-spinner="billingSpinner" />
            <div class="upgrade__mainsection-wrapper addonWrapper"  :style="{'opacity': billingSpinner ? 0.5 : 1, 'pointer-events': billingSpinner ? 'none' : ''}" v-if="!showSomethingWentWrong && !showSuccessPlanPurchase && !insufficientFunds"  :class="{'p-15px' : clientWidth <=767 , 'p-30px' : clientWidth > 767 }">
                <div class="form-check_wrapper bg-white p-20px border-radius-12-px mb-20px">
                    <div>{{$t('Billing.proceed_with_payment')}} <span class="font-weight-500">{{pendingInvoice.id}}</span> {{$t('Billing.amounting_to')}} <span class="font-weight-500">${{Number(pendingInvoice.amount / 100).toFixed(2)}}</span></div>
                </div>
                <div class="buy__now-btn buy_now-btn--half d-flex">
                    <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer" @click="payPendingInvoice()">{{$t('Filters.Yes')}}</button>
                    <button class="font-size-16 font-weight-400 outline-primary cursor-pointer" @click="isModelShow = false,pendingInvoice = {}">{{$t('Filters.No')}}</button>
                </div>
             </div>
            <div v-if="showSuccessPlanPurchase" class="upgrade__mainsection-wrapper addonWrapper">
                <div class="success__bg-green bg-dark-greenmodal"></div>
                <div class="success__planimg d-flex justify-content-center position-ab m0-auto">
                    <span><img :src="successIcon" alt="success"></span>
                </div>
                <div class="plan__upgradesucessfully-wrapper w-100 m0-auto text-center bg-white">
                    <div>
                        <span class="payment__text font-size-22 font-weight-700 black pb-20px text-capitalize">{{$t('Billing.payment_successful')}}</span>
                        <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px">{{$t('Billing.payment_successful_details')}}</span>
                        <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">
                            <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="isModelShow = false,showSomethingWentWrong = false,showSuccessPlanPurchase = false,insufficientFunds = false">{{$t('Projects.close')}}</button>
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
                    <span class="payment__text font-size-22 font-weight-700 black pb-20px">{{$t('Upgrades.something_wrong')}}</span>
                    <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px">{{$t('Billing.payment_unsuccessful')}}</span>
                    <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">
                        <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="isModelShow = false,showSomethingWentWrong = false,showSuccessPlanPurchase = false">{{$t('Projects.close')}}</button>
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
                    <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px"></span>
                    <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">{{$t('Billing.plan_upgrade_unsuccessful')}}
                        <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="isModelShow = false,showSomethingWentWrong = false,showSuccessPlanPurchase = false">{{$t('Projects.close')}}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { inject, onMounted, ref, defineEmits} from "vue";
    // import InvoiceTableComponent from '@/views/Payment/InvoiceTableComponent';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import { apiRequest  } from "@/services";
    import { download } from "@/utils/StorageOprations/download";
    import * as env from '@/config/env';
    const rejectIcon = require("@/assets/images/rejectpayment.png");
    const successIcon = require("@/assets/images/approve.png");
    const isSpinner = ref(false);
    const billingSpinner = ref(false);
    const companyId = inject("$companyId");
    const transections = ref([]);
    const userId = inject('$userId');
    const isModelShow = ref(false);
    const pendingInvoice = ref({});
    const showSomethingWentWrong = ref(false);
    const insufficientFunds = ref(false);
    const showSuccessPlanPurchase =ref(false);
    const clientWidth = inject('$clientWidth');
    const emits = defineEmits(["invoiceAndCreditNoteData"]);
    const props = defineProps({
        currentCard: {
            type: String
        }
    })
    onMounted(() => {
        isSpinner.value = true;
        apiRequest("post", env.GETINVOICEANDCREDITNOTES, {
            userId: userId.value,
            companyId: companyId.value
        }).then((resp) => {
            transections.value = resp.data
            emits("invoiceAndCreditNoteData", transections.value);
            isSpinner.value = false;
        }).catch((error) => {
            console.error(error);
            emits("invoiceAndCreditNoteData", {invoiceArray: [], creditNoteArray: []});
            isSpinner.value = false;
        })
    })

    function downloadFunction(data) {
        apiRequest("post", env.GETTRANSECTIONPDFURL, {
            transectionId: data.transectionId,
        }).then((resp) => {
            download(resp.data.message, `${data.id}.pdf`).catch((error) => {
                console.error('Error while downloading file.', error);
            });
        }).catch((error) => {
            console.error(error);
        })
    }

    function payInvocie(data) {
        isModelShow.value = true;
        pendingInvoice.value = data;
        document.getElementById('pendingInvoice')?.scrollIntoView({behavior: 'smooth',block: "start"})
    }

    function payPendingInvoice() {
        billingSpinner.value = true;
        apiRequest("post", env.PENDING_INVOICE_PAYMENT, {
            invoiceId: pendingInvoice.value.id,
            paymentSourceId: props.currentCard
        }).then((resp) => {
            if (resp.data.status && !resp.data.error) {
                showSuccessPlanPurchase.value = true;
                billingSpinner.value = false;
            } else {
                if(resp.data?.statusText?.message?.includes("Insufficient funds")) {
                    insufficientFunds.value = true;
                    billingSpinner.value = false;
                } else {
                    console.error("Error In Payment",resp.data.statusText)
                    showSomethingWentWrong.value = true;
                    billingSpinner.value = false;
                }
            }
        }).catch((error) => {
            console.error(error);
            billingSpinner.value = false;
        })
    }
</script>
<style scoped src="../css/style.css">

</style>