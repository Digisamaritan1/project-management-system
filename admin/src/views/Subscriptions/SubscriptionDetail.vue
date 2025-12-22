<template>
    <div class="d-flex justify-content-between">
        <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
    </div>
    <div class="subscriptionDetailWrapper mt-30px">
        <div class="subscriptionDetail_section1_wrapper">
            <div class="subscriprionDetail_subDetail">
                <div class="subscriprionDetail_title">
                    Subscription Detail
                </div>
                <div class="subscriprionDetail_title--hr_line"></div>
                <div class="line-height-33">
                    <div class="subscriprionDetail_data">
                        <div class="gray">Subscription ID</div>
                        <div class="subscription-tab-value">{{subscriptionDisplayData.subscriptionId}}</div>
                    </div>
                    <div class="subscriprionDetail_data">
                        <div class="gray">Created Date</div>
                        <div class="subscription-tab-value">{{subscriptionDisplayData.createdAt}}</div>
                    </div>
                    <div class="subscriprionDetail_data">
                        <div class="gray">Plan</div>
                        <div class="subscription-tab-value">{{subscriptionDisplayData.plan}}</div>
                    </div>
                    <div class="subscriprionDetail_data">
                        <div class="gray">Next Renewal Date</div>
                        <div class="subscription-tab-value">{{subscriptionDisplayData.nextRenewalDate}}</div>
                    </div>
                    <div class="subscriprionDetail_data">
                        <div class="gray">Status</div>
                        <div class="subscription-tab-value text-capitalize"><span style="background:#D4F4E2;color:#28C76F;padding:5px;border-radius:5px;">{{subscriptionDisplayData.status}}</span></div>
                    </div>
                </div>
            </div>
            <div class="subscriprionDetail_subDetail mt-30px" v-if="Object.keys(cardDetails).length">
                <div class="subscriprionDetail_title">
                    Payment Methods
                </div>
                <div class="subscriprionDetail_title--hr_line"></div>
                <div class="d-flex mt-30px">
                    <div class="d-flex align-items-center justify-content-center" style="width:78px;height:54px;"><img :src="cardImage" alt="image"/></div>
                    <div class="ml-10px">
                        <div class="font-size-16 GunPowder font-weight-500"><span class="text-capitalize">{{cardDetails.brand}}</span> ending in {{cardDetails.masked_number}}</div>
                        <div class="gray font-size-16">Card expires at {{cardDetails.expiry_month}}/{{cardDetails.expiry_year}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="subscriptionDetail_section1_wrapper">
            <div class="subscriprionDetail_subDetail">
                <div class="subscriprionDetail_title">
                    Owner Details
                </div>
                <div class="subscriprionDetail_title--hr_line"></div>
                <div class="line-height-33">
                    <div class="subscriprionDetail_data">
                        <div class="gray">Owner Name</div>
                        <div class="subscription-tab-value">{{`${owner?.Employee_FName ? owner?.Employee_FName : ""} ${owner?.Employee_LName ? owner?.Employee_LName : ""}`}}</div>
                    </div>
                    <div class="subscriprionDetail_data">
                        <div class="gray">Company Name</div>
                        <div class="subscription-tab-value">{{company?.Cst_CompanyName ? company.Cst_CompanyName : ""}}</div>
                    </div>
                    <div class="subscriprionDetail_data">
                        <div class="gray">Email</div>
                        <div class="subscription-tab-value">{{owner?.Employee_Email ? owner?.Employee_Email : ""}}</div>
                    </div>
                    <div class="subscriprionDetail_data">
                        <div class="gray">Phone No.</div>
                        <div class="subscription-tab-value">{{`${(company?.Cst_DialCode && company?.Cst_DialCode.dialCode) ? `(${company?.Cst_DialCode.dialCode})` : ""} ${company?.Cst_Phone ? company?.Cst_Phone : ""}`}}</div>
                    </div>
                </div>
            </div>
            <div class="subscriprionDetail_subDetail mt-30px" v-if="company?.billingDetails">
                <div class="subscriprionDetail_title">
                    Billing Address
                </div>
                <div class="subscriprionDetail_title--hr_line"></div>
                <div class="subscription-tab-value">
                    <div>{{company?.billingDetails ? `${company?.billingDetails.address1},` : ""}}</div>
                    <div>{{company?.billingDetails ? `${company?.billingDetails.address2},` : ""}}</div>
                    <div>{{`${company?.billingDetails ? `${company?.billingDetails.city},` : ""} ${company?.billingDetails ? `${company?.billingDetails.state},` : ""}`}}</div>
                    <div>{{company?.billingDetails ?  company?.billingDetails.country : ""}}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="subscriprionDetail_subDetail mt-30px">
        <div class="subscriprionDetail_title">
            Summary
        </div>
        <div class="subscriprionDetail_title--hr_line"></div>
        <div class="overflow-auto">
            <table class="summarry_table">
                <thead>
                    <th>Items</th>
                    <th>Units</th>
                    <th>Unit Price</th>
                    <th>Total Amount</th>
                </thead>
                <tbody>
                    <tr class="subscriptionSummarry_table">
                        <td>
                            <div class="summarry_planName">
                                <span>{{summarryObj.planName}}</span>
                                <span class="mt-15px"><span class="summarry_dot"></span>Billed {{summarryObj.period}}</span>
                            </div>
                        </td>
                        <td>{{summarryObj.units}}</td>
                        <td>${{summarryObj.unitPrice}}</td>
                        <td>${{summarryObj.totalPrice}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="mt-15px">
        <span class="grey">Amount Does not include taxes and discounts. The next billing amount is </span><span class="subscriprionDetail_title">${{summarryObj.totalPrice}}.</span>
    </div>
    <div class="subscriprionDetail_subDetail mt-30px history_wrapper">
        <div class="subscriprionDetail_title">
            History
        </div>
        <div class="subscriprionDetail_title--hr_line"></div>
        <div class="d-flex history_tab_title cursor-pointer">
            <div @click="activeTab = 0" :class="{'history_activetab': activeTab === 0}">Invoices</div>
            <div @click="activeTab = 1,getSubscriptionTransection()" :class="{'history_activetab': activeTab === 1}">Transactions</div>
        </div>
        <div class="invoiceTableWrapper common_scroll">
            <InvoiceTab v-if="activeTab == 0" :invoiceArray="invoiceArray"/>
            <SubscriptionTransectionTab v-if="activeTab == 1" :transectionArray="transectionArray"/>
        </div>
    </div>
</template>
<script setup>
    /* eslint-disable */
    import InvoiceTab from '@/components/molecules/Subscription/SubscriptionInvoiceTab.vue';
    import SubscriptionTransectionTab from '@/components/molecules/Subscription/SubscriptionTransectionTab';
    import { onMounted, ref } from 'vue';
    import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
    import {  useRoute } from 'vue-router';
    import { paymentHelper } from '../../utils/paymentHelper/helper';

    const {getSubscriptionDataSubscriptionDetailScreen,getOwnerDetails,getCompanyDetails,getPaymentSource,getInvoices,getSubscriptionTransectionHelper} = paymentHelper();
    const route = useRoute();
    const invoiceArray = ref([]);
    const subscriptionId = ref(route.params.id);
    const activeTab = ref(0);
    const cardDetails = ref({});
    const cardImage = ref("@/assets/images/CardLogo/MasterCard.png");
    const subscriptionData = ref({});
    const owner = ref({});
    const company = ref({});
    const summarryObj = ref({});
    const transectionArray = ref([]);
    const subscriptionDisplayData = ref({});
    const breadCrumbArray = ref([
        {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
        {name: 'Subscription', routeObj: {name: 'Subscription'}, isClickable: true},
        {name: '', routeObj: {name: 'SubscriptionDetail', isClickable: false}}
    ])
    onMounted(() => {
        getSubscriptionDataSubscriptionDetailScreen(subscriptionId.value).then((element)=>{
            subscriptionData.value = element.subscriptionData;
            summarryObj.value = element.summarryObj
            subscriptionDisplayData.value = element.subscriptionDisplayData
            getOwnerDetails(subscriptionData).then((owD)=>{
                owner.value = owD.owner;
                breadCrumbArray.value[2].name = `${owner.value.Employee_FName} ${owner.value.Employee_LName}`
            }).catch((error)=>{
                console.error(error);
            })
            getCompanyDetails(subscriptionData).then((cmpD)=>{
                company.value = cmpD.company;
            }).catch((error)=>{
                console.error(error);
            })
            getPaymentSource(subscriptionData).then((paym)=>{
                cardDetails.value = paym.cardDetails
                cardLogo();
            })
            getInvoices(subscriptionId.value).then((invoices)=>{
                invoiceArray.value = invoices.invoices;
            })
        }).catch((error)=>{
            console.error(error);
        })
    })

    function cardLogo() {
        if (cardDetails.value.brand == 'visa') {
            cardImage.value = require('@/assets/images/CardLogo/VisaCard.png')
        } else if (cardDetails.value.brand == 'mastercard') {
            cardImage.value = require('@/assets/images/CardLogo/MasterCard.png')
        } else if (cardDetails.value.brand == 'american_express') {
            cardImage.value = require('@/assets/images/CardLogo/AMEX.png')
        } else if (cardDetails.value.brand == 'discover') {
            cardImage.value = require('@/assets/images/CardLogo/Discover.png')
        } else if (cardDetails.value.brand == 'jcb') {
            cardImage.value = require('@/assets/images/CardLogo/JCB.png')
        } else if (cardDetails.value.brand == 'diners') {
            cardImage.value = require('@/assets/images/CardLogo/Diners.jpg')
        } else {
            cardImage.value = require('@/assets/images/CardLogo/DefaultCard.png')
        }
    }
    function getSubscriptionTransection() {
        if (transectionArray.value && transectionArray.value.length === 0) {
            getSubscriptionTransectionHelper(subscriptionId.value).then((trn)=>{
                transectionArray.value = trn.transaction;
            }).catch((error)=>{
                console.error(error);
            })
        }
    }
</script>
<style scoped src="./style.css">

</style>