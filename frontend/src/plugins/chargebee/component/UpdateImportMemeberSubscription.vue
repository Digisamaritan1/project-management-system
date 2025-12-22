<template>
    <div v-if="modelShow" class="project__upgradwrapper-popup addon-popup cards-popup position-ab m0-auto bg-light-gray border-radius-15-px" style="width:495px">
        <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        <div class="upgrade__mainsection-wrapper addonWrapper" :style="{'opacity': isSpinner ? 0.5 : 1, 'pointer-events': isSpinner ? 'none' : ''}" :class="{'p-15px' : clientWidth <=767 , 'p-30px' : clientWidth > 767 }">
            <div class="payment__text font-size-22 font-weight-700 black pb-20px">
                {{isRemove ? `${$t("Members.removeuser")} ` : $t("Members.adduser")}}
            </div>
            <div v-if="!isScheduleShow">
                <div class="form-check_wrapper bg-white p-20px border-radius-12-px mb-20px">
                    <div>{{confirmText}}</div>
                    <div class="mt-30px font-weight-500">Total Price: {{ totalUser }} {{ totalUser > 1 ? "Users" : "User"}} x ${{ perUserPrice }} = ${{ totalPrice }}</div>
                    <div class="mt-30px font-weight-700" v-if="paymentText!== ''">{{$t('general.note')}}: {{paymentText}}.</div>
                </div>
                <div class="buy__now-btn d-flex">
                    <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer" @click="addNewUser()">{{isRemove ? `${$t("Members.removeuser")} ` : $t("Members.adduser")}}</button>
                    <button class="font-size-16 font-weight-400 outline-primary cursor-pointer" @click="cancelModel()">{{$t('Projects.cancel')}}</button>
                </div>
            </div>
            <div v-else>
                <div class="form-check_wrapper bg-white p-20px border-radius-12-px mb-20px">
                    <div>{{$t('Subscription.subscription_cancelled')}} {{moment(subscriptionData.next_billing_at * 1000).format("DD MMM,YYYY")}}. {{isRemove ? 'Removing' : 'Adding'}} {{$t('Subscription.discard_changes')}}</div>
                    <div class="mt-10px font-weight-500">{{$t('Subscription.confirm_terminate_schedule')}}</div>
                </div>
                <div class="buy__now-btn d-flex">
                    <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer" @click="setEstimateData(true)">{{$t('Home.yes')}}</button>
                    <button class="font-size-16 font-weight-400 outline-primary cursor-pointer" @click="cancelModel()">{{$t('Projects.cancel')}}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { computed, inject, onMounted, ref,defineEmits } from "vue";
    import { useStore } from "vuex";
    import { apiRequest } from "@/services";
    import * as env from '@/config/env';
    import { useToast } from 'vue-toast-notification';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import moment from "moment";
    import { useI18n } from "vue-i18n";
    const { t } = useI18n();

    const $toast = useToast();
    const isRemoveUserYearly = ref(false);
    const isScheduleShow = ref(false);
    const isSpinner = ref(false);
    const {getters} = useStore();
    const clientWidth = inject("$clientWidth");
    const currentCompany = computed(() => {
        return getters['settings/companies'].find((x) => x._id == companyId.value)
    })
    const chargeBeePriceData = computed(() => {
        return getters["settings/chargeBeePrice"];
    })
    const subscriptionData = ref(null);
    const companyId = inject("$companyId");
    const modelShow = ref(false);
    const emits = defineEmits(["spinnerValue","paymentSubmit","closeModel","hideModel"]);
    const confirmText = ref(null);
    const paymentText = ref(null);
    const perUserPrice = ref(0);
    const totalPrice = ref(0);
    let updateObject = {};
    const props = defineProps({
        totalUser: {
            type: Number
        },
        isRemove:{
            type: Boolean
        }
    })
    onMounted(() => {
        if(currentCompany.value && currentCompany.value.SubcriptionId && currentCompany.value.SubcriptionId !== '') {
            apiRequest('get',`${env.SUBSCRIPTIONS}/${currentCompany.value.SubcriptionId}`).then((response)=>{
                if(response && response?.status === 200 && response?.data){
                    subscriptionData.value = response.data;
                    setDefault();
                }
            }).catch((error)=>{
                console.error(error);
            })
        }
    })

    function setDefault() {
        let curr = subscriptionData.value.subscription_items.find((x)=> x.item_type == 'plan')?.item_price_id || '';
        let itemPrice = chargeBeePriceData.value.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || '';
        
        if (itemPrice.defaultSubscribe) {
            modelShow.value = false;
            isRemoveUserYearly.value = false;
            emits("spinnerValue",false);
            emits("hideModel",true);
            emits("paymentSubmit", false);
        } else {
            let obj = {
                subscriptionId: subscriptionData.value.subscriptionId,
            }
            apiRequest("post", env.CHECKSUBSCRIPTIONSCHEDULE, obj).then((resp) => {
                if(resp.data.status == true) {
                    if (resp.data.scheduledChanges) {
                        isScheduleShow.value = true;
                        modelShow.value = true;
                        emits("spinnerValue",false);
                    } else {
                        setEstimateData(false);
                    }
                } else {
                    isSpinner.value = false;
                    console.error('error',resp.data.statusText);
                    cancelModel();
                }
            }).catch((error) => {
                isSpinner.value = false;
                $toast.error(t("Toast.Something_went_wrong_Please_try_again"),{position: 'top-right'});
                console.error(error);
                cancelModel();
            })
        }
    }
    function setEstimateData(isScheduled) {
        modelShow.value = false;
        isScheduleShow.value = false;
        emits("spinnerValue",false);
        let curr = subscriptionData.value.subscription_items.find((x)=> x.item_type == 'plan')?.item_price_id || '';
        let itemPrice = chargeBeePriceData.value.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || '';
        let currentUnit = itemPrice.itemPriceArray.find((x)=> x.id == curr).period_unit || '';
        let addOnId = itemPrice.addonPriceArray.find((x)=> x.period_unit == currentUnit).id || '';
        if (addOnId) {
            if (isScheduled) {            
                let obj = {
                    subscriptionId: subscriptionData.value.subscriptionId,
                    companyId: companyId.value
                }
                apiRequest("post", env.REMOVESUBSCRIPTIONSCHEDULECHANGES, obj).then(() => {
                    getEstimate(addOnId);
                }).catch((error)=>{
                    console.error(error);
                })
            } else {
                getEstimate(addOnId);
            }                
        } else {
            $toast.error(t("Toast.Something_went_wrong_Please_try_again"),{position: 'top-right'});
            console.error('No addon found');
            emits("spinnerValue",true);
        }
    }

    function getEstimate(addOnId) {
        let obj = {
            subscriptionId: subscriptionData.value.subscriptionId,
            addOnId: addOnId,
            addOnQuantity: props.totalUser,
            isAddOnAdd: true
        }
        apiRequest("post", env.ADDANDREMOVEUSERFROMSUBSCRIPTIONESTIMATE, obj).then((resp) => {
            if(resp.data.status == true) {
                modelShow.value = true;
                emits("spinnerValue",false);
                let estimate = resp.data.statusText.estimate
                updateObject = resp.data.statusText.updateObj
                let invoiceEstimate = estimate.estimate.invoice_estimate || estimate.estimate.next_invoice_estimate
                confirmText.value = t('Subscription.confirm_add_user');
                paymentText.value = `${t('Subscription.next_invoice_amount')} $${Number(invoiceEstimate.total / 100).toFixed(2)} on ${moment(new Date(invoiceEstimate.date * 1000)).format("DD MMM YYYY")}` 
                totalPrice.value = Number(invoiceEstimate.total / 100).toFixed(2);
                perUserPrice.value = Number((invoiceEstimate.total / props.totalUser) / 100).toFixed(2);
            } else {
                $toast.error(t("Toast.Something_went_wrong_Please_try_again"),{position: 'top-right'});
                console.error('error',resp.data);
                emits("spinnerValue",false);
            }
        }).catch((error) => {
            $toast.error(t("Toast.Something_went_wrong_Please_try_again"),{position: 'top-right'});
            console.error(error);
            emits("spinnerValue",false);
        })
    }
    function addNewUser() {
        isSpinner.value = true;
        delete updateObject.subscription
        let obj = {
            subscriptionId: subscriptionData.value.subscriptionId,
            updateObj: updateObject
        }
        apiRequest("post", env.ADDANDREMOVEUSERFROMSUBSCRIPTION, obj).then((resp) => {
            if(resp.data.status == true) {
                isSpinner.value = false;
                emits("spinnerValue",true);
                isRemoveUserYearly.value = false;
                emits("hideModel",true);
                emits("paymentSubmit", true);
            } else {
                isSpinner.value = false;
                console.error('error',resp.data.statusText);
                if (resp.data.error && resp.data.error.error_msg) {
                    $toast.error(resp.data.error.error_msg,{position: 'top-right'});
                }
                cancelModel();    
            }
        }).catch((error) => {
            isSpinner.value = false;
            $toast.error(t("Toast.Something_went_wrong_Please_try_again"),{position: 'top-right'});
            console.error(error);
            cancelModel();
        })
    }

    function cancelModel() {
        emits("spinnerValue",false);
        emits("closeModel",true);
    }
</script>

<style src="../css/style.css"></style>