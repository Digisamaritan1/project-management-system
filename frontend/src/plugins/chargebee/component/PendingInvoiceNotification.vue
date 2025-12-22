<template>
    <div class="bg-light-gray" v-if="currentCompany.isPaymentFailed && currentCompany.isPaymentFailed === true">
        <div class="pt-20px pendingNotification"> 
            <div class="pendingNotification_wrapper m0-auto p0x-15px w-100">
                <div class="d-flex">
                    <div class="mr-10px">
                        <img src="@/assets/images/svg/Warning.svg"/>
                    </div>
                    <div>
                        <div class="font-weight-500 mb-5px">{{$t('Billing.attention_needed')}}</div>
                        <div>{{$t('Billing.subscription_renewal_failed')}} <span class="font-weight-500">{{currentCompany.paymentFailed_error_text}}</span>. <span @click="changeRoute('paymentMethod')" class="blue text-decoration-underline cursor-pointer">{{$t('Billing.update_payment_method_please')}}</span> {{$t('Billing.avoid_service_disruption')}}</div>
                    </div>
                </div>
                <div>
                    <button class="blue_btn_payNow" @click="changeRoute('payNow')">{{$t('Billing.pay_now')}}</button>
                </div>
            </div>
        </div>
    </div>
    <div class="bg-light-gray" v-if="!currentCompany.isPaymentFailed && isDefaultSubscribe && invoiceLength > 0">
        <div class="pt-20px pendingNotification"> 
            <div class="pendingNotification_wrapper m0-auto p0x-15px w-100">
                <div class="d-flex">
                    <div class="mr-10px">
                        <img src="@/assets/images/svg/Warning.svg"/>
                    </div>
                    <div>
                        <div class="font-weight-500 mb-5px">{{$t('Billing.attention_needed')}}</div>
                        <div>{{$t('Billing.paymnet_failed_subscription_canceled')}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, inject, defineProps } from "vue";
    import { useStore } from "vuex";
    import { useRoute, useRouter } from 'vue-router';
    const router = useRouter();
    const route = useRoute();
    const {getters} = useStore();
    const companyId = inject("$companyId");
    
    defineProps({
        isDefaultSubscribe: {
            type: Boolean
        },
        invoiceLength: {
            type: Number
        }
    })
    const currentCompany = computed(() => {
        return getters['settings/companies'].find((x) => x._id == companyId.value)
    })

    function changeRoute(to) {
        if (route.name == 'Billing History') {
            if (to === 'payNow') {
                document.getElementById('payNow').scrollIntoView({behavior: 'smooth',block: "start"});
            } else {
                document.getElementById('paymentMethod').scrollIntoView({behavior: 'smooth',block: "start"});
            }
        } else {
            router.push({name: 'Billing History', params: {cid: companyId.value}})
        }
    }
</script>
<style scoped>
    .pendingNotification_wrapper{
        display: flex;
        padding: 15px 20px;
        align-items: center;
        border-radius: 10px;
        background: #FFECDA;
        justify-content: space-between;
    }
    .pendingNotification{
        margin: 0 auto;
        max-width: 1600px;
    }
    .blue_btn_payNow {
        font-size: 16px;
        background: #2f3990 !important;
        padding: 7px 10px;
        border-radius: 4px;
        border: 0;
        color: #fff;
        cursor: pointer;
        height: 30px;
    }

</style>