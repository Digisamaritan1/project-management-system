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
                    <div class="mt-30px font-weight-700" v-if="paymentText!== ''">{{$t('general.note')}}: {{paymentText}}.</div>
                </div>
                <div class="buy__now-btn d-flex">
                    <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer" @click="addNewUser()">{{isRemove ? `${$t("Members.removeuser")} ` : $t("Members.adduser")}}</button>
                    <button class="font-size-16 font-weight-400 outline-primary cursor-pointer" @click="cancelModel()">{{$t('Projects.cancel')}}</button>
                </div>
            </div>
            <div v-else>
                <div class="form-check_wrapper bg-white p-20px border-radius-12-px mb-20px">
                    <div>{{$t('Subscription.subscription_cancelled')}} {{moment(new Date(subscriptionData.scheduled_change.effective_at)).format('DD MMM, YYYY')}}. {{isRemove ? 'Removing' : 'Adding'}} {{$t('Subscription.discard_changes')}}</div>
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
    const companyUsers = computed(() => {
        return getters['settings/companyUsers'].filter(user => user.isDelete === false);
    });
    const subscriptionData = ref(null);
    const companyId = inject("$companyId");
    const modelShow = ref(false);
    const emits = defineEmits(["spinnerValue","executeFurther","closeModel","hideModel"]);
    const confirmText = ref(null);
    const paymentText = ref(null);
    let updateObject = {};
    const props = defineProps({
        isRemove:{
            type: Boolean
        },
        userData: {
            type: Object,
            default: () => {}
        }
    })
    onMounted(() => {
        if (props.isRemove) {
            emits("spinnerValue",true);
        }
        if(currentCompany.value && currentCompany.value.SubcriptionId && currentCompany.value.SubcriptionId !== '') {
            apiRequest('get',`${env.SUBSCRIPTIONS}/${currentCompany.value.SubcriptionId}`).then((response)=>{
                if(response && response?.status === 200 && response?.data){
                    subscriptionData.value = response?.data;
                    setDefault();
                }
            }).catch((error)=>{
                if (props.isRemove) {
                    emits("spinnerValue",false);
                }
                console.error(error);
            })
        } else {
           if (!props.isRemove) {
                emits("executeFurther",props.userData.userEmail,props.userData.userDesignation,props.userData.userRole);
            } else {
                emits("executeFurther",props.userData);
                emits("spinnerValue",false);
            }
        }
    })

    function setDefault() {
        let curr = subscriptionData.value.items[0].price.id || '';
        let itemPrice = chargeBeePriceData.value.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || '';
        if (itemPrice.defaultSubscribe) {
            modelShow.value = false;
            isRemoveUserYearly.value = false;
            emits("spinnerValue",false);
            emits("hideModel",true);
            if (!props.isRemove) {
                emits("executeFurther",props.userData.userEmail,props.userData.userDesignation,props.userData.userRole);
            } else {
                emits("executeFurther",props.userData);
            }
        } else {
            if (subscriptionData.value.scheduled_change && subscriptionData.value.scheduled_change.action === 'cancel') {
                isScheduleShow.value = true;
                modelShow.value = true;
                emits("spinnerValue",false);
            } else {
                setEstimateData(false)
            }
        }
    }
    function setEstimateData(isScheduled) {
        modelShow.value = false;
        isScheduleShow.value = false;
        emits("spinnerValue",false);
        if (isScheduled) {            
            let obj = {
                subscriptionId: subscriptionData.value.subscriptionId,
                updateObj: {
                    scheduled_change: null
                },
            }
            apiRequest("post", env.UPDATESUBSCRIPTIONPAYMENT, obj).then(() => {
                getEstimate(subscriptionData.value.items[0].price.id);
            }).catch((error) => {
                $toast.error(t("Toast.Something_went_wrong_Please_try_again"),{position: 'top-right'});
                console.error(error);
            })
        } else {
            getEstimate(subscriptionData.value.items[0].price.id);
        }                
    }


    function getEstimate(addOnId) {
        let obj = {
            subscriptionId: subscriptionData.value.subscriptionId,
            addOnId: addOnId,
            addOnQuantity: 1,
            currentUsers: companyUsers.value.length
        }
        if (props.isRemove) {
            obj.isAddOnAdd = false;
        } else {
            obj.isAddOnAdd = true;
        }
        apiRequest("post", env.ADDANDREMOVEUSERFROMSUBSCRIPTIONESTIMATE, obj).then((resp) => {
            modelShow.value = true;
            emits("spinnerValue",false);
            let estimate = resp.data.message
            updateObject = resp.data.updateObj
            if (!props.isRemove) {
                confirmText.value = t('Subscription.confirm_add_user');
                if(estimate.update_summary.result.action == 'charge'){
                    paymentText.value = `Your next invoice will be of $${Number(estimate.immediate_transaction.details.totals.grand_total / 100).toFixed(2)} on ${moment(new Date(estimate.next_billed_at)).format("DD MMM YYYY")}` 
                } else {
                    paymentText.value = `Your next invoice will be on ${moment(new Date(estimate.next_billed_at)).format("DD MMM YYYY")}` 
                }
            } else {
                confirmText.value = t('Subscription.confirm_remove_user');
                paymentText.value = "";
            }
        }).catch((error) => {
            $toast.error(t("Toast.Something_went_wrong_Please_try_again"),{position: 'top-right'});
            console.error(error);
            emits("spinnerValue",false);
        })
    }
    function addNewUser() {
        isSpinner.value = true;
        let obj = {
            subscriptionId: subscriptionData.value.subscriptionId,
            updateObj: updateObject
        }
        apiRequest("post", env.UPDATESUBSCRIPTIONPAYMENT, obj).then(() => {
            isSpinner.value = false;
            emits("hideModel",true);
            if (!props.isRemove) {
                emits("spinnerValue",true);
                isRemoveUserYearly.value = false;
                emits("hideModel",true);
                emits("executeFurther",props.userData.userEmail,props.userData.userDesignation,props.userData.userRole);
            } else {
                isRemoveUserYearly.value = false;
                emits("hideModel",true);
                emits("executeFurther",props.userData);
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