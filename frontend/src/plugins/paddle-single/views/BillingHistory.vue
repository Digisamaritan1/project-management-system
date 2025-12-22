<template>
    <div v-if="companyOwner.isCurrentUser" class="billing__main-wrapper">
        <div class="billing__detail-header">
            <div class="billingDetailTitle">{{$t('Billing.billing_details')}}</div>
        </div>
        <PendingInvoiceNotification id="pendingInvoice" :isDefaultSubscribe="isDefaultSubscribe" :invoiceLength="invoiceLength" />
        <div class="billing__detail-body bg-light-gray pb-10px w-100">
            <div class=" billing__container m0-auto p0x-15px w-100">
                <div class="bg-light-gray"  :class="{'pt-20px' : clientWidth > 767, 'pt-0' : clientWidth <= 767}">
                    <div class="billing__details d-flex">
                        <div class="billing__box bg-white border-radius-10-px p15x-20px mt-30px">
                            <div class="paymentMethod__section-one d-flex justify-content-between mb-20px">
                                <span class="planDetailBox__title font-size-22 font-weight-500 GunPowder">{{$t('Billing.plan_details')}}</span>
                                <span><img src="@/assets/images/svg/Plan_Details.svg" alt=""></span>
                            </div>
                            <div class="paymentMethod__section-second d-block">
                                <template v-if="!loadingData">
                                    <div class="font-size-18 current__plan__status font-weight-500 GunPowder mb-3px">{{currentPlan}}</div>
                                    <div class="planDetailBox__text font-size-18 gray" v-if="newxtPaybleAmount!==''">{{$t('Billing.next_msg')}}  <span class="black">${{newxtPaybleAmount}}</span> {{$t('Billing.due_on')}} <span class="black">{{moment(new Date(subscriptionData.next_billed_at)).format('DD MMM, YYYY')}}</span></div>
                                </template>
                                <template v-else>
                                    <Skelaton style="height: 26px; width: 60%;" class="border-radius-5-px mb-3px"/>
                                    <Skelaton style="height: 25px; width: 100%;" class="border-radius-5-px"/>
                                </template>
                            </div>
                            <div class="planDetailBox__hrLine colorlightgray"><hr></div>
                            <div class="planDetailBox__section-three">
                                <button class="btn-primary upgrade__btn font-size-16 mr-20px" @click="$router.push({name: 'Upgrade', params: {cid: companyId}})" v-if="subscriptionData.status == 'active' || notSubscriibed">{{$t('Billing.upgrade_plan')}}</button>
                                <span class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" v-if="subscriptionData.status == 'active' && !isDefaultSubscribe" @click="cancelSubscription">{{$t('Billing.cancel_subscription')}}</span>
                                <span class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" v-if="subscriptionData.status == 'non_renewing' && !isDefaultSubscribe" @click="removeScheduleCancelation">{{$t('Billing.reactivate_subscription')}}</span>
                            </div>
                        </div>
                        <div class="billing__box bg-white border-radius-10-px p15x-20px mt-30px">
                            <div class="paymentMethod__section-one d-flex justify-content-between mb-20px">
                                <span class="planDetailBox__title font-size-22 font-weight-500 GunPowder">{{$t('Billing.biling_info')}}</span>
                                <span><img src="@/assets/images/svg/Billing_Info.svg" alt=""></span>
                            </div>
                            <div class="paymentMethod__section-second d-block">
                                <div class="planDetailBox__text font-size-18 gray blankSpace biilingAddBox" :title="billingAddress">{{billingAddress ? billingAddress : 'Please update billing Address'}}</div>
                            </div>
                            <div class="planDetailBox__hrLine colorlightgray"><hr></div>
                            <div class="planDetailBox__section-three">
                                <span class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" @click="() => isBilling = true">{{$t('Billing.update_billing_info')}}</span>
                            </div>
                        </div>
                        <div class="billing__box bg-white border-radius-10-px p15x-20px mt-30px">
                            <div class="paymentMethod__section-one d-flex justify-content-between mb-20px">
                                <span class="planDetailBox__title font-size-22 font-weight-500 GunPowder">C{{$t('Billing.contact_support')}}</span>
                                <span><img src="@/assets/images/svg/Contact_Support.svg" alt=""></span>
                            </div>
                            <div class="paymentMethod__section-second d-block">
                                <div class="planDetailBox__text font-size-18 gray">{{$t('Billing.for_help_msg')}}</div>
                            </div>
                            <div class="planDetailBox__hrLine colorlightgray"><hr></div>
                            <div class="planDetailBox__section-three">
                                <span class="planDetailBox__sectionthree--text blue font-size-16 cursor-pointer"><a href="https://alianhub.com/contact-us/" target="blank">{{$t('Billing.contact_support')}}</a></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="billngDetialHrLine" v-if="!isDefaultSubscribe"><div class="divider w-100 bg-lowlight-gray"></div></div>
                <div id="paymentMethod" v-if="!isDefaultSubscribe">
                    <div class="d-flex justify-content-between">
                        <div class="paymentMethod">
                            <div class="planDetailBox__title font-size-22 font-weight-500 GunPowder">{{$t('Billing.update_payment_method')}}</div>
                            <div class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16 mt-20px" @click="updatePaymentMethod">{{$t('Billing.click_here_for_update_payment_method')}}</div>
                        </div>
                        <div>
                            <div class="creditBalance">
                                <div>
                                    <img src="@/assets/images/svg/account_balance_wallet.svg"/>
                                </div>
                                <div class="mt-10px credit_balance_text">
                                    ${{currentCredit}}
                                </div>
                                <div class="mt-10px credit_balance_text">
                                    {{$t('Billing.credit_balance')}}
                                </div>
                                <div class="mt-10px credit_balance_text">
                                    {{$t('Billing.this_balance_will_be_used_for_a_future_payment')}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="billngDetialHrLine">
                    <div class="divider w-100 bg-lowlight-gray"></div>
                </div>
                <InvoiceTable id="payNow" v-if="subscriptionData && subscriptionData.id" @invoiceAndCreditNoteData="invoiceAndCreditNoteData" />
            </div>
        </div>
    </div>
    <div  v-if="!companyOwner.isCurrentUser" class="d-flex bg-light-gray align-items-center justify-content-center w-100 h-100">
        <img src="@/assets/images/access_denied_img.png" alt="accessDenied">
    </div>
    <Sidebar :title="$t('Billing.billing_address')" :visible="isBilling" v-model:visible="isBilling" :top="clientWidth <= 767 ? '0px' : '46px'" className="billing__address-sidebar">
        <template #body>
        <BillingDetails v-if="isBilling"  :isDirectPayment="false" :doneBillingDetail="doneBillingDetail" :isPopUp="false" :closeModel="()=> isBilling = false"/>
        </template>
    </Sidebar>
</template>

<script setup>
    import { computed, inject, onMounted, ref } from "vue";
    // import PendingInvoiceNotification from '@/views/Payment/PendingInvoiceNotification'
    import Skelaton from '@/components/atom/Skelaton/Skelaton.vue'
    import { useStore } from "vuex";
    // import InvoiceTable from '@/views/Payment/InvoiceTable.vue';
    import moment from "moment";
    import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
    import { apiRequest } from "@/services";
    import { useToast } from "vue-toast-notification";
    import * as env from '@/config/env';
    import { useGetterFunctions } from "@/composable";
    // import CardList from '@/views/Settings/Upgrade/CardList'
    // import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    // import BillingDetails from '@/views/Settings/Upgrade/BillingDetails';
    import Swal from 'sweetalert2';
    import { useI18n } from "vue-i18n";


    const {getUser} = useGetterFunctions()
    const clientWidth = inject("$clientWidth");
    const {t} = useI18n();
    const $toast = useToast();
    const {getters} = useStore();
    const userId = inject('$userId');
    const companyId = inject("$companyId");
    const currentCredit = ref('');
    const isBilling = ref(false);
    const billingAddress = ref("");
    const subscriptionData = ref({});
    const loadingData = ref(true);
    const notSubscriibed = ref(false);
    const newxtPaybleAmount = ref('');
    const invoiceLength = ref(0);
    const companyOwner = computed(() => {
        return getters["settings/companyOwnerDetail"];
    })
    
    const chargeBeePriceData = computed(() => {
        return getters["settings/chargeBeePrice"];
    })

    const currentCompany = computed(() => {
        return getters['settings/companies'].find((x) => x._id == companyId.value)
    })

    const currentPlan = computed(()=>{
        if (Object.keys(subscriptionData.value).length) {
            let curr = subscriptionData.value.items[0].price.id || '';
            let itemPrice = chargeBeePriceData.value?.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || '';
            let period = itemPrice?.itemPriceArray?.find((x)=> x.id == curr).period_unit || '';
            return `${itemPrice.planDetails?.name} ${period !== '' ? period === 'month' ? 'Month' : 'Year' : ''}`
        } else {
            let palnName = chargeBeePriceData.value.find((x)=> x.defaultSubscribe) 
            return palnName ? palnName.planDetails.name : ''
        }
    })

    const isDefaultSubscribe = computed(()=>{
        if (Object.keys(subscriptionData.value).length) {
            let curr = subscriptionData.value.items[0].price.id || '' || ''
            let itemPrice = chargeBeePriceData.value.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || ''
            return itemPrice.defaultSubscribe
        } else {
            return true
        }
    })

    onMounted(() => {
        if (companyOwner.value.isCurrentUser) {
            init();
        }
    })

    function init () {
        if (currentCompany.value && currentCompany.value.SubcriptionId && currentCompany.value.SubcriptionId !== '') {
            apiRequest("get", `${env.GET_SUBSCRIPTION_DATA}/${currentCompany.value.SubcriptionId}`)
            .then((subs) => subs.data)
            .then((subs) => {
                subscriptionData.value = {...subs.message}
                if(subscriptionData.value.scheduled_change && subscriptionData.value.scheduled_change.action === 'cancel') {
                    subscriptionData.value.status = 'non_renewing';
                }
                newxtPaybleAmount.value = Number(Number(subscriptionData.value.items[0].price.unit_price.amount / 100) * subscriptionData.value.items[0].quantity).toFixed(2)
                getCustomerCurrentCredit();
                setTimeout(() =>{
                    loadingData.value = false;
                }, 500)
            })
            .catch((error) => {
                loadingData.value = false;
                console.error(error);
            })
        } else {
            loadingData.value = false;
            notSubscriibed.value = true;
        }
        let billing = currentCompany.value.billingDetails
        if (billing) {
            billingAddress.value = `${billing.address1},${billing.address2},${billing.city},${billing.state},${billing.country} - ${billing.zipCode}`
        } else {
            billingAddress.value = ''
        }
    }

    function invoiceAndCreditNoteData(data) {
        invoiceLength.value = data.invoiceArray.length ? data.invoiceArray.length : 0;
    }
    
    function getCustomerCurrentCredit() {
        apiRequest("get", `${env.GET_CUSTOMER_CREDIT}/${getUser(userId.value).customerId}`).then((resp) => {
            currentCredit.value = resp.data.message;
        }).catch((error) => {
            console.error(error)
            $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'})
        })
    }
    function doneBillingDetail (text) {
        isBilling.value = false;
        billingAddress.value = text;
    }
    function updatePaymentMethod() {
        window.open(subscriptionData.value.management_urls.update_payment_method, '_blank');
    }
    function cancelSubscription() {
        Swal.fire({
            title: t(`conformationmsg.are_you_sure`),
            text: `${t('Billing.cancelling_subscription_message')} ${moment(subscriptionData.value.next_billed_at).format('DD MMM, YYYY')}. ${t('Billing.reactivate_anytime')}`,
            showCancelButton: true,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: t('Filters.No'),
            confirmButtonText: t('Filters.Yes'),
        }).then((result)=>{
            if (result.value) {
                apiRequest("post", env.CANCELSUBSCRIPTIONPAYMENT, {
                    subscriptionId: currentCompany.value.SubcriptionId,
                }).then(() => {
                    subscriptionData.value.status = 'non_renewing';
                    $toast.success(t('Toast.Subscription_cancel_succesfully_Please_allow_2_to_3_minutes_for_the_changes_to_take_effect_everywhere'),{position: 'top-right'});
                }).catch((error) => {
                    console.error(error)
                    $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'})
                })
            }
        }).catch((error)=>{
            console.error(error);
        })
    }
    function removeScheduleCancelation() {
           Swal.fire({
            title: t(`conformationmsg.are_you_sure`),
            text: t('Billing.reactivate_confirmation'),
            showCancelButton: true,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: t('Filters.No'),
            confirmButtonText: t('Filters.Yes'),
        }).then((result)=>{
            if (result.value) {
                let obj = {
                    subscriptionId: subscriptionData.value.id,
                    updateObj: {
                        scheduled_change: null
                    },
                }
                apiRequest("post", env.UPDATESUBSCRIPTIONPAYMENT, obj).then(() => {
                    subscriptionData.value.status = 'active';
                    $toast.success(t('Toast.Subscription_reactivate_succesfully_Please_allow_2_to_3_minutes_for_the_changes_to_take_effect_everywhere'),{position: 'top-right'});
                }).catch((error) => {
                    console.error(error);
                    $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'});
                })
            }
        }).catch((error)=>{
            console.error(error);
        })
    }
</script>
<style src="../css/style.css">
</style>