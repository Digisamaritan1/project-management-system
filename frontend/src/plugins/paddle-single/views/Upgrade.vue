<template>
    <div v-if="companyOwner.isCurrentUser" id="paymentModel" :class="{'p20px-0px' : clientWidth <=767 , 'p50px-0px' : clientWidth > 767 }">
        <div v-if="checkoutLoad" class="d-flex justify-content-end">
            <img src="@/assets/images/svg/CloseSidebar.svg" alt="close" @click="closeCheckout" class="cursor-pointer" v-if="clientWidth > 767">
        </div>
        <div class="checkout-container"></div>
        <SpinnerComp :is-spinner="isSpinner" />
        <div v-if="!checkoutLoad">
            <div class="title__textnext-step font-weight-500 text-center black d-flex justify-content-center" :class="{'font-size-26' : clientWidth <=767 , 'font-size-36' : clientWidth > 767 }"> 
                {{$t('Upgrades.take_next_step')}}
            </div>
            <div class="current__plan-text font-size-22 font-weight-400 black d-flex justify-content-center mt-15px w-100">
                {{$t('Upgrades.you_are_on')}}
                <span class="blue font-weight-700 pl-5px"> {{currentPlan}}</span>.
            </div>
            <div class="monthly__yearly-subcription d-flex align-items-center justify-content-center mt-30px">
                <label class="switch monthly__yearly-subcription  position-re d-inline-block"> 
                <Toggle v-model="subsPeriodType" width="100%" height="auto" @change="(e) => {subscriptionPeriod = subsPeriodType ?'month' : 'year'}">
                    <template #body>
                        <div class="p-4px">
                            <button class="toggle-option font-size-18" :class="{ upgradeToggleActive: subscriptionPeriod === 'month' }"> {{$t('Upgrades.per_month')}}</button>
                            <button  class="toggle-option font-size-18" :class="{ upgradeToggleActive: subscriptionPeriod === 'year' }"> {{$t('Upgrades.per_year')}}
                                <span class="save__percentage-design d-inline-block font-weight-500 font-size-13 bg-dark-green white border-radius-4-px ml-5px">{{$t('Projects.save')}} {{savePercentage}}%</span>
                            </button>
                        </div>
                </template>
                </Toggle>
                </label>
                <div></div>
            </div>
        
            <div class="enterpise__main-wrapper pl-15px pr-15px" :class="{'pt-20px' : clientWidth <=767 , 'pt-40px' : clientWidth > 767 }">
                <!-- <div v-for="(data,index) in chargeBeePriceData" :key="index" class="charge__bee-pricedata"> -->
                <div :class="[{'desktop-enterprise__limitness-wrapper' : clientWidth > 767,'mobile-enterprise_second-wrapper' : clientWidth <= 767}]">
                    <div v-for="(data,index) in chargeBeePriceData?.filter((x) => x?.status === 1)" :key="index" class="charge__bee-pricedata">
                        <div class="pl-20px pr-20px pt-30px pb-20px enterprise__limitness-wrapper bg-white payment__box-shadow"  v-if="!data.defaultSubscribe">
                            <div class="current__active-plan position-ab font-size-13 font-weight-500 white bg-lightpink p2x-10px" v-if="data.planDetails.name == currentPlan && subscriptionPeriod == currentPeriod">{{$t('Upgrades.current_plane')}}</div>
                            <div class="plan__details-name font-size-22 black font-weight-500">{{data.planDetails.name}}</div>
                            <div class="plan__description font-size-16 gray81 font-weight-500">{{getDisplay('planDescription',data.planName)}}</div>
                            <div v-if="!data.isContactSupport" class="price__display" :class="{'pt-10px' : clientWidth <=767 , 'pt-20px' : clientWidth > 767 }"><span class="font-size-24">$</span>{{getPriceDisplay(data,subscriptionPeriod)}}<span class="d-block font-size-16 gray81 font-weight-500">{{$t('Upgrades.per_member')}}/{{$t('Upgrades.per_member')}}</span></div>
                            <div class="contact-support-btn" v-else><button class="border-0 cursor-pointer blue_btn align-items-center d-flex mr-0"><a class="white" :href="data.supportLink" target="_blank"> Contact Sales </a></button> </div>
                            <div class="m20px-0 divider__subscription bg-lowlight-gray"></div>
                            <div class="plan__feature-title mb-9px black font-size-16 font-weight-700">{{getDisplay('planFeatureTtitle',data.planName)}}</div>
                            <div v-if="clientWidth > 767" v-html="getDisplay('planFeature',data.planName)" :class="{'overflow-y-hidden': isMuchMore}" :style="{'max-height': isMuchMore ? '363px' : ''}" class="plan__future"></div>
                            <div v-else v-html="getDisplay('planFeature',data.planName)" :class="{'overflow-y-hidden': isMuchMore}" :style="{'max-height': isMuchMore ? '120px' : ''}" class="plan__future"></div>
                            <div class="blue cursor-pointer" v-if="isMuchMore" @click="() => isMuchMore = false">...{{$t('Upgrades.and much more')}}</div>
                            <div class="position-re" v-if="!data.isContactSupport">
                                <SpinnerComp :is-spinner="isButtonDisabled" />
                                <button v-if="!isButtonDisabled" class="upgrade__button font-size-16 font-weight-400 white w-100 bg-dark-purple border-radius-4-px border-0 mt-30px"  @click="upgrade(data)" :class="{'upgrade__disable-button': isDisabled(data),'cursor-pointer': !isDisabled(data)}" :disabled="isDisabled(data)">{{$t('Upgrades.upgrade_to')}} {{data.planDetails.name}}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div  v-if="!companyOwner.isCurrentUser" class="d-flex bg-light-gray align-items-center justify-content-center w-100 h-100">
        <img src="@/assets/images/access_denied_img.png" alt="accessDenied">
    </div>
    <div>
        <div v-if="isCard" class="project__upgradwrapper-popup addon-popup cards-popup position-ab m0-auto bg-light-gray" :style="{'border-radius': (showSomethingWentWrong || showSuccessPlanPurchase) ? '20px' : '15px', 'width': (showSomethingWentWrong || showSuccessPlanPurchase) ? '495px' : '607px'}">
            <SpinnerComp :is-spinner="billingSpinner" />
            <div :style="{'opacity': billingSpinner ? 0.5 : 1, 'pointer-events': billingSpinner ? 'none' : ''}">
                <div class="position-ab close__modal-wrapper" v-if="!showSomethingWentWrong && !showSuccessPlanPurchase">
                    <img :src="cancelIcon" alt="" class="cursor-pointer"  @click="isCard = false"/>
                </div>
                <div class="upgrade__mainsection-wrapper addonWrapper"  v-if="!showSomethingWentWrong && !showSuccessPlanPurchase"  :class="{'p-15px' : clientWidth <=767 , 'p-30px' : clientWidth > 767 }">
                    <div class="payment__text font-size-22 font-weight-700 black pb-20px">
                        {{$t('Billing.upgrade_plan')}}
                    </div>
                    <div class="plan__detail-wrapper bg-light-blue border-radius-12-px p-20px mb-20px">
                        <div class="d-flex align-items-center justify-content-between plan__statusprice-wrapper">
                            <div class="plan__dynamic-text font-size-22 font-weight-700 black">
                                {{selectedPlan}} {{$t('Upgrades.plan')}}<span class="plan__count-multipliaction font-size-16 font-weight-400 black d-block pt-5px"> {{text}}</span>
                            </div>
                            <div class="plan__use-total font-size-22 font-weight-700 black">
                                <span>$</span>{{finalPrice}}
                            </div>
                        </div>
                    </div>
                    <div class="buy__now-btn pb-20px pay__paddle">
                        <button class="font-size-16 font-weight-400 bg-blue border-radius-4-px white border-0 cursor-pointer bg-dark-green" @click="openPaddleCheckout()">Pay ${{finalPrice}}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <UpdateSubscription 
        v-if="isUpdateSubscriptionShow" 
        @closeUpdateModel="() => isUpdateSubscriptionShow = false" 
        :subscriptionData="subscriptionData" 
        :updatedData="updateSubscriptionData" 
        :selectedPeriod="subscriptionPeriod"
        :currentPlan="currentPlan"
        :currentPeriod="currentPeriod"
    />
    <BillingDetails v-if="isBilling" :isDirectPayment="true" :doneBillingDetail="doneBillingDetail" :isPopUp="true" :closeModel="()=> isBilling = false"/>
</template>

<script setup>
    /* eslint-disable */
    import { computed, defineComponent, inject, onMounted, ref, watch } from "vue";
    import { useStore } from "vuex";
    import { useGetterFunctions } from "@/composable";
    import { apiRequest } from "@/services";
    import * as env from '@/config/env';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import Toggle from "@/components/atom/Toggle/Toggle.vue"
    defineComponent({
        name: "UpgradeComponent"
    })


    const {getters} = useStore();
    const isUpdate = ref(false);
    const clientWidth = inject("$clientWidth");
    const subscriptionPeriod = ref("month");
    const isBilling = ref(false);
    const addCardClick = ref(false);
    const finalPrice = ref(0);
    const text = ref("");
    const selectedPlan = ref("");
    const isCard = ref(false);
    const isSpinner = ref(false);
    const isButtonDisabled = ref(false);
    const {getUser} = useGetterFunctions()
    const userId = inject('$userId');
    const isMuchMore = ref(true);
    const isUpdateSubscriptionShow = ref(false);
    const selectedPrice = ref(null);
    const currentCurrency = ref("");
    const billingSpinner = ref(false);
    const showSuccessPlanPurchase = ref(false);
    const showSomethingWentWrong = ref(false);
    const subscriptionData = ref({});
    const companyId = inject("$companyId");
    const chargeBeePrice = ref({});
    const cancelIcon = require("@/assets/images/closemodal.png");
    const currentPeriod = ref(null);
    const updateSubscriptionData = ref(null);
    const subsPeriodType=ref(true);
    const checkoutLoad = ref(false);
    
    const companyOwner = computed(() => {
        return getters["settings/companyOwnerDetail"];
    })
    const chargeBeePriceData = computed(() => {
        if (getters["settings/chargeBeePrice"]) {
            return getters["settings/chargeBeePrice"];
        } else {
            return [];
        }
    })
    const planFeatureDisplay = computed(()=> {
        return getters["settings/planFeatureDisplay"];
    })
    const currentCompany = computed(() => {
        return getters['settings/companies'].find((x) => x._id == companyId.value)
    })
    const companyUsers = computed(() => {
        return getters['settings/companyUsers'].filter(user => user.isDelete === false);
    });

    const savePercentage = computed(()=>{
        if (chargeBeePriceData.value.length) {
            let price = chargeBeePriceData.value.find((x)=> !x.defaultSubscribe)?.itemPriceArray
            if (price) {
                let monthly = ((price.find((x)=> x.period_unit == 'month').price) / 100) || 0;
                let yearly = ((price.find((x)=> x.period_unit == 'year').price) / 100) || 0;
                return  Math.round((1 - ((yearly / 12)/monthly))*100) || 0;
            } else {
                return null
            }
        } else {
            return null
        }
    })

    const currentPlan = computed(()=>{
        if (Object.keys(subscriptionData.value).length) {
            let curr = subscriptionData.value.items[0]?.price.id || ''
            let itemPrice = chargeBeePriceData.value.find((x)=> x.itemPriceArray.find((x)=> x.id == curr) || '') || ''
            return itemPrice.planDetails?.name
        } else {
            let palnName = chargeBeePriceData.value.find((x)=> x.defaultSubscribe) 
            return palnName ? palnName.planDetails.name : ''
        }
    })

    watch(chargeBeePriceData,(newV)=> {
        if (newV) {
            setDefault();
        }
    })

    watch(planFeatureDisplay,(newV)=> {
        if (newV) {
            planFeatureDisplay.value = newV;
        }
    })

    onMounted(() => {
        if (companyOwner.value.isCurrentUser) {
            if (process.env.VUE_APP_ENVIRONMENT !== "production") {
                Paddle.Environment.set("sandbox"); // Remvoe when Move to Production
            }
            Paddle.Initialize({
                token: process.env.VUE_APP_PADDLE_CLIENT_TOKEN,
            });
            isButtonDisabled.value = true;
            if(currentCompany.value && currentCompany.value.SubcriptionId && currentCompany.value.SubcriptionId !== '') {
                apiRequest('get',`${env.SUBSCRIPTIONS}/${currentCompany.value.SubcriptionId}`).then((response)=>{
                    if(response && response?.status === 200 && response?.data){
                        subscriptionData.value = response?.data;
                        setDefault();
                    }
                    isButtonDisabled.value = false;
                }).catch((error)=>{
                    isButtonDisabled.value = false;
                    console.error(error);
                })
            } else {
                isButtonDisabled.value = false;
                currentPlan.value = ""
                getDATA();
            }
        }
    })
    function setDefault() {
        if (chargeBeePriceData.value && chargeBeePriceData.value.length && Object.keys(subscriptionData.value).length) {  
            let currPriceid = subscriptionData.value?.items[0]?.price.id || '';
            let itemPrice = chargeBeePriceData?.value.find((x)=> x.itemPriceArray.find((x)=> x.id == currPriceid) || '') || '';
            if (!itemPrice.defaultSubscribe) {
                isUpdate.value = true;
            }
            let currentUnit = itemPrice?.itemPriceArray?.find((x)=> x.id == currPriceid)?.period_unit || '';
            if (currentUnit) {
                subscriptionPeriod.value = currentUnit;
                subsPeriodType.value = currentUnit == 'month' ? true : false;
            }
            currentPeriod.value = itemPrice?.itemPriceArray?.find((x)=> x.id == currPriceid)?.period_unit || '';
            currentCurrency.value = subscriptionData.value.currency_code
        }
    }
    function upgrade(data) {
        if (isUpdate.value) {
            updateSubscription(data);
        } else {
            if (currentCompany.value && currentCompany.value?.billingDetails && Object.keys(currentCompany.value?.billingDetails).length) {
                if (!Object.keys(chargeBeePrice.value).length) {
                    let selectPlan = chargeBeePriceData.value.find((x) => x._id == data._id)
                    chargeBeePrice.value = selectPlan
                }
                isCard.value = true;
                displayTotatal();
            } else {
                isBilling.value = true;
                let selectPlan = chargeBeePriceData.value.find((x) => x._id == data._id)
                chargeBeePrice.value = selectPlan
                displayTotatal();
            }
        }
    }
    function openPaddleCheckout() {
        isCard.value = false;
        selectedPrice.value = chargeBeePrice.value.itemPriceArray.find((x)=> x.period_unit == subscriptionPeriod.value)
        var itemsList = [
            {
                priceId: selectedPrice.value.id,
                quantity: companyUsers.value.length
            },
        ];
        checkoutLoad.value = true;
        Paddle.Checkout.open({
            settings: {
                displayMode: "inline",
                theme: "light",
                locale: "en",
                successUrl: env.DOMAIN_URI,
                frameTarget: "checkout-container",
                frameInitialHeight: "450",
                frameStyle: "width: 100%; min-width: 312px; background-color: transparent; border: none;",
                allowLogout: false,
                // allowedPaymentMethods: ['alipay','apple_pay','bancontact','card','google_pay','ideal','paypal']
                allowedPaymentMethods: ['paypal','card']
            },
            items: itemsList,
            customer: {
                id: getUser(userId.value).customerId,
                address: {
                    id: currentCompany.value?.billingDetails.addressId,
                }
            },
            customData: {
                companyId: companyId.value,
                domainLink: env.DOMAIN_URI,
                selectedPlan: chargeBeePrice.value.planName
            }

        });
    }
    function displayTotatal() {
        let oneUserPrice = chargeBeePrice.value.itemPriceArray.find((x)=> x.period_unit === subscriptionPeriod.value).price /100
        text.value = `($${subscriptionPeriod.value == 'year' ? Number((oneUserPrice/12)).toFixed(2) : Number(oneUserPrice).toFixed(2)} X ${companyUsers.value.length} ${companyUsers.value.length == 1 ? 'User' : 'Users'} X ${subscriptionPeriod.value == 'year' ?  '12 Months' : '1 Month'} )`;
        if (companyUsers.value.length > 1) {
            let addOnPriceFinal = companyUsers.value.length * oneUserPrice
            finalPrice.value = Number(addOnPriceFinal).toFixed(2);
        } else {
            finalPrice.value = Number(oneUserPrice).toFixed(2);
        }
    }
    function doneBillingDetail (isValid)  {
        if(isValid == true) {
            isBilling.value = false;
            isCard.value = true;
            openPaddleCheckout();
        }
    }
    function getDATA () {
        currentCurrency.value = 'USD';
    }
    function getDisplay(value,planName) {
        let feature = planFeatureDisplay.value.find((x)=> x.planName == planName)
        if (feature) {
            return feature[value]
        } else {
            return '';
        }
    }

    function getPriceDisplay(data,period) {
        let priceData = data.itemPriceArray.find((x)=> x.period_unit == period)
        if (priceData) {
            if (period == 'month') {
                return Number((priceData.price / 100)).toFixed(2);
            } else {
                return Number(((priceData.price / 100))/12).toFixed(2);
            }
        }
    }

    function cardTokenize(value, sourceId) {
        addCardClick.value = false;
        if (value) {
            createCheckout(sourceId)
        } else {
            billingSpinner.value = false;
        }
    }
    function isDisabled(data) {
        if (currentPlan.value !== '' && Object.keys(subscriptionData.value).length) {
            if (data?.planDetails?.name.toLowerCase() == currentPlan.value.toLowerCase() && currentPeriod.value == subscriptionPeriod.value) {
                return true       
            } else {
                return false
            }
        } else {
            return false;
        }
    }
    function updateSubscription(data) {
        updateSubscriptionData.value = data;
        isUpdateSubscriptionShow.value = true;
    }

    function closeCheckout() {
        Paddle.Checkout.close();
        checkoutLoad.value = false;
    }
</script>
<style>
.contact-support-btn {
    display: flex;
    justify-content: center;
    padding: 30px 0 15px 0;
}
.current__plan-text, .plan__details-name {
    line-height: 32.56px
}
.current__plan-text{
    display: inline-block !important;
    text-align: center;
}
.save__percentage-design{
    line-height: 19.24px;
    padding: 0.5px 5.8px;
}
.pay__text{
    line-height: 26.6px;
}
.upgrade__button button {
    box-shadow: 0px 4px 6px 0px rgba(84, 77, 201, 0.30);
    line-height: 23.68px;
}
.plan__future ul {
    margin: 0;
    padding: 0;
    list-style: none;
}
.plan__future ul li{
    font-size: 16px;
    font-weight: 400;
    line-height: 30.18px;
    color: #818181;
    word-break: break-all;
}
.plan__description , .price__display span , .plan__feature-title {
    line-height: 23.68px;
}
.price__display span {
    letter-spacing: 0;
}
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(2) .price__display , 
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(3) .price__display{
    font-size: 50px;
    font-weight: 600;
    letter-spacing: -2px;
}
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(2) .price__display {
    color: #40A6E6;
}
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(3) .price__display{
    color: #544DC9;
}
.enterpise__main-wrapper{
    gap: 30px;
    overflow: auto;
}
.desktop-enterprise__limitness-wrapper {
    display: flex;
    gap: 30px;
    min-width: max-content;
}
.divider__subscription{
    height: 1px;
}
.enterprise__limitness-wrapper {
    min-width: 335px;
    width: 335px;
}
.enterprise__limitness-wrapper{
    border-radius: 8px 8px 12px 12px;
}
.enterpise__main-wrapper .charge__bee-pricedata{
    position: relative;
}
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(2)::before ,
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(3)::before {
    border-radius: 12px;
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    height: 6px;
    width: 100%;
    left: 0;
}
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(2)::before {
    border-top: 6px solid #40A6E6;
}
.enterpise__main-wrapper .charge__bee-pricedata:nth-child(3)::before {
    border-top: 6px solid #544DC9;
}
.upgrade__button {
    padding: 10px 14px;
}
.switch__wrapper {
    width: 42px;
    height: 22px;
}
.switch__wrapper [type="radio"] {
    display: none;
}
.switch__wrapper label {
    font-size: 0;
    padding: 0;
    line-height: 32px;
    border-radius: 10px;
    transition: color 0.25s ease-in-out;
    width: 20px;
}
.active__toggle {
    background: #fff;
    width: 20px;
    min-width: 15px;
    border-radius: 50px;
}
.monthly__yearly-subcription input[type="radio"] {
    display: none;
}
.upgrade__disable-button {
    min-height: 39px;
    border-radius: 4px;
    opacity: 0.3;
    background: #40A6E6;
    box-shadow: 0px 4px 6px 0px rgba(64, 166, 230, 0.30);
}
.current__active-plan {
    border-radius: 5px 0px 0px 5px;
    right: 0;
    top: 16px;
    line-height: 19.24px;
    width: 93px;
    height: 24px;
}
.project__upgradwrapper-popup {
    left: 50%;
    top: 50%;
    transform: translate(-50% , -50%);
    height: auto;
    z-index: 99;
    position: fixed !important;
}
.payment__text, .plan__dynamic-text, .plan__use-total{
    line-height: 33px;
}
.plan__count-multipliaction{
    line-height: 24px;
}
.form-check-label{
    line-height: 21px;
}
.form-check_wrapper [type="radio"]:checked + label:after{
    content: '';
    width: 18px;
    height: 18px;
    background: #2f3990;
    position: absolute;
    top: 4px;
    left: 4px;
    border-radius: 100%;
    transition: all 0.2s ease;
}
#app:has(.cards-popup):after {
    content: '';
    position: fixed;
    height: 100vh;
    width: 100%;
    background-color: rgba(0,0,0,0.5);
    left: 0;
    top: 0;
    z-index: 5;
}
.cards-popup .form-check {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ececec;
    padding: 10px 0px;
}
.cards-popup .form-check label.form-check-label {
    margin: 0;
    font-size: 14px;
}
.form-check_wrapper [type="radio"]:checked,
.form-check_wrapper [type="radio"]:not(:checked) {
    position: absolute;
    left: -9999px;
}
.form-check_wrapper [type="radio"]:checked + label,
.form-check_wrapper [type="radio"]:not(:checked) + label
{
    position: relative;
    padding-left: 38px;
    cursor: pointer;
    line-height: 25px;
    display: inline-block;
}
.form-check_wrapper [type="radio"]:checked + label:before,
.form-check_wrapper [type="radio"]:not(:checked) + label:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0px;
    width: 24px;
    height: 24px;
    border: 1px solid #ddd;
    border-radius: 100%;
    background: #fff;
}
.form-check_wrapper [type="radio"]:checked + label:after,
.form-check_wrapper [type="radio"]:not(:checked) + label:after {
    content: '';
    width: 18px;
    height: 18px;
    background: #2f3990;
    position: absolute;
    top: 4px;
    left: 4px;
    border-radius: 100%;
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
}
.form-check_wrapper [type="radio"]:not(:checked) + label:after {
    opacity: 0;
    -webkit-transform: scale(0);
    transform: scale(0);
}
.form-check_wrapper [type="radio"]:checked + label:after {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
}
.scrollable-area-for-card {
    max-height: 184px;
}
.buy__now-btn {
    margin: -21px auto 0;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    padding-bottom: 20px;
    /* background-color: #fff; */
}
.buy__now-btn button {
    line-height: 24px;
    padding: 3px 14px;
    height: 39px;
    margin: 0 20px;
    width: calc(100% - 40px);
}
.close__modal-wrapper{
    right: 30px;
    top: 30px;
}
.close__modal-wrapper img {
    width: 15px;
    height: 15px;
}
.success__bg-green {
    height: 117px;
    border-radius: 20px 20px 0 0;
}
.success__planimg {
    top: -23px;
    left: 0;
    right: 0;
}
.plan__upgrade-desc , .back__to-project button{
    line-height: 24px;
}
.back__to-project button{
    height: 30px;
    width: 140px;
}
.plan__upgradesucessfully-wrapper {
    padding: 73px 50px 0;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.title__textnext-step, .current__plan-text , 
.monthly__yearly-subcription{
    padding-left:15px;padding-right: 15px;
}
label.switch.monthly__yearly-subcription .toggle {
    background-color: transparent;
}
.monthly__yearly-subcription .toggle {
    max-width: 394px;
    height: auto;
    width: 100%;
}  
.toggle-option {
  padding: 8px 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 38px;
}
.monthly__yearly-subcription .upgradeToggleActive {
  background-color: #1e3a8a;
  color: white;
}
.yearly-text {
    max-width: 168px;
    width: 100%;
    text-align: right;
}
.monthly-text {
    width: 156px;
}
.pay__paddle{
    margin-top: 25px;
}
@media(max-width: 767px){
.enterprise__limitness-wrapper {min-width: 100%;width: 100%;}
/* .enterpise__main-wrapper{flex-wrap: wrap;width: 100%;} */
.mobile-enterprise_second-wrapper{
    flex-wrap: wrap;
    gap: 30px;
    display: flex;
}
.charge__bee-pricedata {width: 100%;}
.project__upgradwrapper-popup {width: 100%;max-width: 95%;    max-height: calc(100vh - 50px);
    overflow: auto;}
.plan__dynamic-text {padding-right: 10px;}
.scrollable-area-for-card {max-height: 140px;}
.close__modal-wrapper {right: 15px;top: 25px;}
.form-check_wrapper{overflow: auto;max-height: 430px;z-index: 0;}
.form-check_wrapper::-webkit-scrollbar{display: none;}
.buy__now-btn{position: relative;z-index: 11;}
.plan__upgradesucessfully-wrapper{padding: 73px 15px 0;}
.title__textnext-step {padding: 0 15px;}
.font-size-22 {
    font-size: 18px;
}
}
@media(max-width: 480px){
    .payment__text, .plan__dynamic-text, .plan__use-total {width: 100%;}
    .plan__statusprice-wrapper{flex-direction: column;}
    .toggle-option  {
        padding: 8px 25px;
        font-size: 14px !important;
    }
}
@media(max-width: 375px){
    .toggle-option  {
        padding: 6px 18px;
        font-size: 12px !important;
    }
}
</style>
