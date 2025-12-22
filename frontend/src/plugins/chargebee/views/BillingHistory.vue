<template>
    <div v-if="companyOwner.isCurrentUser" class="billing__main-wrapper">
        <div class="billing__detail-header">
            <div class="billingDetailTitle">{{$t('Billing.billing_details')}}</div>
        </div>
        <PendingInvoiceNotification id="pendingInvoice" :isDefaultSubscribe="isDefaultSubscribe" :invoiceLength="invoiceLength"/>
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
                                    <div class="planDetailBox__text font-size-18 gray" v-if="isPaymentShow && subscriptionData.status !== 'non_renewing'">{{$t('Billing.next_msg')}}  <span class="black">${{newxtPaybleAmount}}</span> {{$t('Billing.due_on')}} <span class="black">{{moment(subscriptionData.next_billing_at * 1000).format('DD MMM, YYYY')}}</span></div>
                                </template>
                                <template v-else>
                                    <Skelaton style="height: 26px; width: 60%;" class="border-radius-5-px mb-3px"/>
                                    <Skelaton style="height: 25px; width: 100%;" class="border-radius-5-px"/>
                                </template>
                            </div>
                            <div class="planDetailBox__hrLine colorlightgray"><hr></div>
                            <div class="planDetailBox__section-three">
                                <button class="btn-primary upgrade__btn font-size-16 mr-20px" @click="$router.push({name: 'Upgrade', params: {cid: companyId}})" v-if="subscriptionData.status == 'active'">{{$t('Billing.upgrade_plan')}}</button>
                                <span class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" v-if="isPaymentShow && subscriptionData.status == 'active' && !isDefaultSubscribe" @click="cancelSubscription">{{$t('Billing.cancel_subscription')}}</span>
                                <span class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" v-if="isPaymentShow && subscriptionData.status == 'non_renewing' && !isDefaultSubscribe" @click="removeScheduleCancelation">{{$t('Billing.reactivate_subscription')}}</span>
                            </div>
                        </div>
                        <div class="billing__box bg-white border-radius-10-px p15x-20px mt-30px">
                            <div class="paymentMethod__section-one d-flex justify-content-between mb-20px">
                                <span class="planDetailBox__title font-size-22 font-weight-500 GunPowder">{{$t('Billing.biling_info')}}</span>
                                <span><img src="@/assets/images/svg/Billing_Info.svg" alt=""></span>
                            </div>
                            <div class="paymentMethod__section-second d-block">
                                <div class="planDetailBox__text font-size-18 gray blankSpace" :title="billingAddress">{{billingAddress ? billingAddress : 'Please update billing Address'}}</div>
                            </div>
                            <div class="planDetailBox__hrLine colorlightgray"><hr></div>
                            <div class="planDetailBox__section-three">
                                <span class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" @click="() => isBilling = true">{{$t('Billing.update_billing_info')}}</span>
                            </div>
                        </div>
                        <div class="billing__box bg-white border-radius-10-px p15x-20px mt-30px">
                            <div class="paymentMethod__section-one d-flex justify-content-between mb-20px">
                                <span class="planDetailBox__title font-size-22 font-weight-500 GunPowder">{{$t('Billing.contact_support')}}</span>
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
                <div class="billngDetialHrLine" v-if="isPaymentShow"><div class="divider w-100 bg-lowlight-gray"></div></div>
                <div class="d-flex justify-content-between gap-20 paymentMethod-section" v-if="isPaymentShow">
                    <div class="paymentMethod flex-1" id="paymentMethod">
                        <div class="d-flex justify-content-between">
                            <span class="planDetailBox__title font-size-22 font-weight-500 GunPowder">{{$t('Billing.payment_methods')}}</span>
                            <span v-if="cardlast4" class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" @click="updatePaymentMethod">{{$t('Billing.update_payment_method')}}</span>
                            <span v-else class="planDetailBox__sectionthree--text cursor-pointer blue font-size-16" @click="addPaymentMethod">{{$t('Billing.add_payment_method')}}</span>
                        </div>
                        <div class="d-flex justify-content-between" v-if="cardlast4">
                            <div class="cardInfo border-radius-12-px mt-20px p-20px d-flex bg-light-gray" :class="{'w-50' : clientWidth > 767}">
                                <div class="cardLogo d-flex align-items-center justify-content-center bg-white"><img :src="cardImage" alt=""></div>
                                <div class="cardDetail ml-10px">
                                    <div class="cardLine font-size-18 GunPowder font-weight-500"><span class="text-capitalize">{{cardName}}</span> {{$t('Billing.ending_in')}} **** {{cardlast4}}</div>
                                    <div class="planDetailBox__text gray font-size-16">{{$t('Billing.card_expires')}} {{cardExpiry}}</div>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between" v-else>
                            <div class="border-radius-12-px mt-20px p-20px text-center bg-light-gray" :class="{'w-50' : clientWidth > 767}">
                                No card.
                            </div>
                        </div>
                    </div>
                    <div class="creditBalance">
                        <div>
                            <img src="@/assets/images/svg/account_balance_wallet.svg"/>
                        </div>
                        <div class="mt-10px credit_balance_text">
                            {{$t('Billing.credit_balance')}}: ${{currentCredit || "0.00"}}
                        </div>
                        <div class="mt-10px credit_balance_text">
                            {{$t('Billing.promotional_credit_balance')}}: ${{ promotionalCredit || "0.00" }}
                        </div>
                        <div class="mt-10px credit_balance_text">
                            {{$t('Billing.this_balance_will_be_used_for_a_future_payment')}}
                        </div>
                    </div>
                </div>
                <div class="billngDetialHrLine">
                    <div class="divider w-100 bg-lowlight-gray"></div>
                </div>
                <InvoiceTable id="payNow" v-if="subscriptionData && subscriptionData.subscriptionId" :currentCard="currentCardId" @invoiceAndCreditNoteData="invoiceAndCreditNoteData" />
            </div>
        </div>
    </div>
        <div v-if="isCard" class="project__upgradwrapper-popup addon-popup cards-popup position-ab m0-auto bg-light-gray" :style="{'border-radius': (!showSomethingWentWrong && !showSuccessPlanPurchase) ? '20px' : '15px'}">
        <SpinnerComp :is-spinner="billingSpinner" />
        <div :style="{'opacity': billingSpinner ? 0.5 : 1, 'pointer-events': billingSpinner ? 'none' : ''}">
            <div class="position-ab close__modal-wrapper" v-if="!showSomethingWentWrong && !showSuccessPlanPurchase">
                <img :src="cancelIcon" alt="" class="cursor-pointer" @click="isCard = false"/>
            </div>
            <div class="upgrade__mainsection-wrapper addonWrapper"   v-if="!showSomethingWentWrong && !showSuccessPlanPurchase" :class="{'p-15px' : clientWidth <=767 , 'p-30px' : clientWidth > 767 }">
                <div class="payment__text font-size-22 font-weight-700 black pb-20px">
                    Select Payment Method
                </div>
                <div class="form-check_wrapper bg-white p-20px border-radius-12-px">
                    <CardList 
                        :selectedCard="selectedCard" 
                        :paymentSorceList="paymentSorceList" 
                        @selectCard="(data)=>selectedCard = data" 
                        :addCardClick="addCardClick" 
                        @cardTokenize="cardTokenize" 
                        :billingSpinner="billingSpinner"
                    />
                </div>
                <div class="buy__now-btn bg-white pb-20px">
                    <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer" @click="updatePaymentMethodCard()">{{$t('Projects.update')}}</button>
                </div>
            </div>
            <div v-if="showSuccessPlanPurchase" class="upgrade__mainsection-wrapper addonWrapper">
                <div class="success__bg-green bg-dark-greenmodal"></div>
                <div class="success__planimg d-flex justify-content-center position-ab m0-auto">
                    <span><img :src="successIcon" alt="success"></span>
                </div>
                <div class="plan__upgradesucessfully-wrapper w-100 m0-auto text-center bg-white">
                    <div>
                        <span class="payment__text font-size-22 font-weight-700 black pb-20px text-capitalize">{{$t('Billing.payment_method_update')}}</span>
                        <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px">{{$t('Billing.waiting_msg')}}</span>
                        <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">
                            <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="isCard = false">{{$t('Projects.close')}}</button>
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
                    <span class="d-block font-size-16 font-weight-400 plan__upgrade-desc GunPowder pt-20px pb-20px">{{$t('Billing.error_updating')}}</span>
                    <div class="back__to-project d-flex align-items-center justify-content-center pb-50px">
                        <button class="font-size-16 font-weight-400 border-primary border-radius-4-px cursor-pointer p2x-5px blue d-flex align-items-center justify-content-center bg-white" @click="isCard = false">{{$t('Projects.close')}}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div  v-if="!companyOwner.isCurrentUser" class="d-flex bg-light-gray align-items-center justify-content-center w-100 h-100">
        <img src="@/assets/images/access_denied_img.png" alt="accessDenied">
    </div>
    <Sidebar :title="$t('Billing.billing_address')" :visible="isBilling" v-model:visible="isBilling" :top="clientWidth <= 767 ? '0px' : '46px'" className="billing__address-sidebar">
        <template #body>
        <BillingDetails v-if="isBilling"  :isDirectPayment="false" :doneBillingDetail="doneBillingDetail" :isPopUp="false" :closeModel="()=> {isBilling = false; preBillingUpdate = false}"/>
        </template>
    </Sidebar>
</template>

<script setup>
    import { computed, inject, onMounted, ref } from "vue";
    import Skelaton from '@/components/atom/Skelaton/Skelaton.vue'
    import { useStore } from "vuex";
    import moment from "moment";
    import Sidebar from "@/components/molecules/Sidebar/Sidebar.vue"
    import { apiRequest } from "@/services";
    import { useToast } from "vue-toast-notification";
    import * as env from '@/config/env';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import Swal from 'sweetalert2';
    import { useI18n } from "vue-i18n";
    import { showAlertModal } from '@/components/atom/AlertBox/helper';

    const {t} = useI18n();
    const clientWidth = inject("$clientWidth");
    const $toast = useToast();
    const cancelIcon = require("@/assets/images/cancel sign.png");
    const rejectIcon = require("@/assets/images/rejectpayment.png");
    const successIcon = require("@/assets/images/approve.png");
    const {getters} = useStore();
    const selectedCard = ref('0');
    const currentCardId = ref('');
    const addCardClick = ref(false);
    const showSomethingWentWrong = ref(false);
    const showSuccessPlanPurchase = ref(false);
    const paymentSorceList = ref([]);
    const companyId = inject("$companyId");
    const isPaymentShow = ref(false);
    const preBillingUpdate = ref(false);
    const cardName = ref('');
    const isCard = ref(false);
    const cardlast4 = ref(null);
    const billingSpinner = ref(false);
    const isBilling = ref(false);
    const billingAddress = ref("");
    const cardExpiry = ref('');
    const cardImage = ref('');
    const subscriptionData = ref({});
    const loadingData = ref(true);
    const newxtPaybleAmount = ref('');
    const invoiceLength = ref(0);
    const currentCredit = ref("0.00");
    const promotionalCredit = ref("0.00");
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
            let curr = subscriptionData.value.subscription_items.find((x)=> x.item_type == 'plan')?.item_price_id || ''
            let itemPrice = chargeBeePriceData.value?.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || ''
            let period = itemPrice?.itemPriceArray?.find((x)=> x.id == curr).period_unit || '';
            return `${itemPrice.planDetails?.name} ${period !== '' ? period === 'month' ? 'Month' : 'Year' : ''}`
        } else {
            let palnName = chargeBeePriceData.value.find((x)=> x.defaultSubscribe) 
            return palnName ? palnName.planDetails.name : ''
        }
    })

    const isDefaultSubscribe = computed(()=>{
        if (Object.keys(subscriptionData.value).length) {
            let curr = subscriptionData.value.subscription_items.find((x)=> x.item_type == 'plan')?.item_price_id || ''
            let itemPrice = chargeBeePriceData.value.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || ''
            return itemPrice.defaultSubscribe
        } else {
            return true
        }
    })

    onMounted(() => {
        if (companyOwner.value.isCurrentUser) {
            init();
            getPaymentCustomer();
        }
    })

    function getPaymentCustomer () {
        apiRequest("get", `${env.GET_PAYMENT_CUSTOMER}`).then((customerData) => {
            if (customerData.status === 200) {
                if (customerData?.data?.data?.customer?.promotional_credits) {
                    promotionalCredit.value = (customerData?.data?.data?.customer?.promotional_credits/100).toFixed(2);
                }
                if (customerData?.data?.data?.customer?.refundable_credits) {
                    currentCredit.value = (customerData?.data?.data?.customer?.refundable_credits/100).toFixed(2);
                }
            }
        }).catch((error) => {
            console.error("Get Payment Customer error", error)
        })
    }
    function init () {
        if (currentCompany.value && currentCompany.value.SubcriptionId && currentCompany.value.SubcriptionId !== '') {
            apiRequest("get", `${env.GET_SUBSCRIPTION_DATA}/${currentCompany.value.SubcriptionId}`)
            .then((subs) => subs.data)
            .then((subs) => {
                subscriptionData.value = {...subs, subscriptionId: subs.id}
                newxtPaybleAmount.value = Number((subscriptionData.value.subscription_items.reduce((acc, item) => acc + item.amount, 0))/100).toFixed(2);
                currentCardId.value = subs.payment_source_id
                setTimeout(() =>{
                    loadingData.value = false;
                }, 500)
                getCards(subs.payment_source_id);
            })
            .catch((error) => {
                loadingData.value = false;
                console.error(error);
            })
        }
        let billing = currentCompany.value.billingDetails
        if (billing) {
            billingAddress.value = `${billing.address1}, ${billing.address2}, ${billing.city}, ${billing.state}, ${billing.country} - ${billing.zipCode}`
        } else {
            billingAddress.value = ''
        }
    }

    function invoiceAndCreditNoteData(data) {
        invoiceLength.value = data.invoiceArray.length ? data.invoiceArray.length : 0;
    }

    function getCards(currentCard) {
        const getFunc = () => {
            apiRequest("post", env.GET_CARD_DETAILS, {})
            .then((resp) => {
                isPaymentShow.value = true;
                if(resp.data.status == true && resp.data.isCards == true) {
                    let source = resp.data.paymentSourceList
                    let index = resp.data.paymentSourceList.findIndex((x) => x.id == currentCard)
                    if (index > -1) {
                        cardName.value = source[index].card.brand;
                        cardlast4.value = source[index].card.last4
                        cardLogo();
                        cardExpiry.value = `${source[index].card.expiry_month}/${source[index].card.expiry_year}`
                        selectedCard.value = String(`${index+1}`);
                        paymentSorceList.value = source
                    } else {
                        isPaymentShow.value = false;
                    }
                } else {
                    if(selectedCard.value !== '0') {
                        selectedCard.value = 0;
                    }
                }
            }).catch((error) => {
                console.error(error);
                if(selectedCard.value !== '0') {
                    selectedCard.value = 0;
                }
            })
        }
        getFunc();
    }
    function updateCard  (paymentSourceId,cardObject = {}) {
        billingSpinner.value = true;
        apiRequest("post", env.UPDATECARDFORSUBSCRIPTION, {
            subscriptionId: currentCompany.value.SubcriptionId,
            paymentSourceId: paymentSourceId
        }).then((resp) => {
            if(resp.data.status == true) {
                let index = paymentSorceList.value.findIndex((x) => x.id == paymentSourceId)
                if (index > -1) {
                    cardName.value = paymentSorceList.value[index].card.brand;
                    cardLogo();
                    cardlast4.value = paymentSorceList.value[index].card.last4
                    cardExpiry.value = `${paymentSorceList.value[index].card.expiry_month}/${paymentSorceList.value[index].card.expiry_year}`
                    selectedCard.value = String(`${index+1}`);
                    showSuccessPlanPurchase.value = true;
                    billingSpinner.value = false;
                } else {
                    paymentSorceList.value.push(cardObject);
                    cardName.value = cardObject.card.brand;
                    cardLogo();
                    cardlast4.value = cardObject.card.last4
                    cardExpiry.value = `${cardObject.card.expiry_month}/${cardObject.card.expiry_year}`
                    selectedCard.value = String(`${paymentSorceList.value.length}`);
                    showSuccessPlanPurchase.value = true;
                    billingSpinner.value = false;
                }
            } else {
                billingSpinner.value = false;
                console.error(resp.data.statusText,"Error In Update Card");
                showSomethingWentWrong.value = true;
            }
        }).catch((error) => {
            billingSpinner.value = false;
            console.error(error);
        })
    }
    function doneBillingDetail (text) {
        isBilling.value = false;
        billingAddress.value = text;
        if (preBillingUpdate.value) {
            updatePaymentMethod();
        }
    }
    function addPaymentMethod () {
        preBillingUpdate.value = true;
        if (billingAddress.value) {
            preBillingUpdate.value = false;
            updatePaymentMethod();
            return;
        }
        showAlertModal({
            title: "",
            message: t("alertBox.updateBillingAddress"),
            type: "info",
            cancelButtonText: t("alertBox.cancel"),
            confirmButtonText: t("general.Continue"),
        }).then(() => {
            isBilling.value = true;
        }).catch(() => {
            preBillingUpdate.value = false;
            return;
        })
    }
    function updatePaymentMethod() {
        isCard.value = true;
        preBillingUpdate.value = false;
        showSomethingWentWrong.value = false;
        showSuccessPlanPurchase.value = false;
    }
    function cancelSubscription() {
        Swal.fire({
            title: t(`conformationmsg.are_you_sure`),
            text: `${t('Billing.cancelling_subscription_message')} ${moment(subscriptionData.value.next_billing_at * 1000).format('DD MMM, YYYY')}. ${t('Billing.reactivate_anytime')}`,
            showCancelButton: true,
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
        }).then((result)=>{
            if (result.value) {
                apiRequest("post", env.CANCELSUBSCRIPTIONPAYMENT, {
                    subscriptionId: currentCompany.value.SubcriptionId,
                }).then((resp) => {
                    if (resp.data.status) {
                        subscriptionData.value.status = 'non_renewing';
                        $toast.success(t('Toast.Subscription_cancel_succesfully_Please_allow_2_to_3_minutes_for_the_changes_to_take_effect_everywhere'),{position: 'top-right'});
                    } else {
                        console.error(resp.data)
                        $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'});
                    }
                }).catch((error) => {
                    console.error(error)
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
            cancelButtonText: 'No',
            confirmButtonText: 'Yes',
        }).then((result)=>{
            if (result.value) {
                apiRequest("post", env.REMOVESCHEDULECANCELLATION, {
                    subscriptionId: currentCompany.value.SubcriptionId,
                }).then((resp) => {
                    if (resp.data.status) {
                        subscriptionData.value.status = 'active';
                        $toast.success(t('Toast.Subscription_reactivate_succesfully_Please_allow_2_to_3_minutes_for_the_changes_to_take_effect_everywhere'),{position: 'top-right'});
                    } else {
                        console.error(resp.data)
                        $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'});
                    }
                }).catch((error) => {
                    console.error(error);
                })
            }
        }).catch((error)=>{
            console.error(error);
        })
    }
    function updatePaymentMethodCard() {
        billingSpinner.value = true;
        if (selectedCard.value == '0') {
            addCardClick.value = true;
        } else {
            updateCard(paymentSorceList.value[Number(selectedCard.value -1)].id);
        }
    }
    function cardTokenize(value, sourceId,card) {
        addCardClick.value = false;
        if (value) {
            updateCard(sourceId,card)
        } else {
            billingSpinner.value = false;
        }
    }
    function cardLogo() {
        if (cardName.value == 'visa') {
            cardImage.value = require('@/assets/images/VisaCard.png')
        } else if (cardName.value == 'mastercard') {
            cardImage.value = require('@/assets/images/MasterCard.png')
        } else if (cardName.value == 'american_express') {
            cardImage.value = require('@/assets/images/AMEX.png')
        } else if (cardName.value == 'discover') {
            cardImage.value = require('@/assets/images/Discover.png')
        } else if (cardName.value == 'jcb') {
            cardImage.value = require('@/assets/images/JCB.png')
        } else if (cardName.value == 'diners') {
            cardImage.value = require('@/assets/images/Diners.jpg')
        } else {
            cardImage.value = require('@/assets/images/DefaultCard.png')
        }
    }
</script>
<style src="../css/style.css">
</style>