<template>
    <div>
        <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        <div v-else class="payment_wrapper bg-white">
            <div class="table-container_payment overflow-auto style-scroll-2-px">
                <span class="shade-black font-weight-500 font-size-22">Payment Records</span>
                <div class="paymentTable_wrapper" v-if="payments && payments.length">
                    <table border>
                        <thead>
                            <tr>
                                <th v-for="(header, index) in headers" :key="index">{{ header.name }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in payments" :key="index">
                                <td>{{item.id}}</td>
                                <td>{{moment(item.date * 1000).format('DD MMM, YYYY')}}</td>
                                <td>{{item.planName}}</td>
                                <td>
                                    <span class="currency__sign">$</span>{{Number(item.amount / 100).toFixed(2)}}
                                </td>
                                <td>
                                    <div class="billing__status d-inline-flex font-size-13 text-center align-items-center border-radius-4-px font-weight-400 p5px-p10px cursor-pointer text-capitalize" :style="{'background': getColor(item.status,'background'), 'color': getColor(item.status,'color')}">{{item.status}}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="d-flex justify-content-center align-items-center flex-column no-data-found">
                    <img :src="nodataFoundIcon" />
                    <h3>No Data Found</h3>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { defineComponent, onMounted, ref } from "vue";
    import moment from 'moment';
    import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue"
    import { paymentHelper } from '@/utils/paymentHelper/helper';
    const {getCompanyDEtailInvoiceTabInvoiceGet,getCompanyDetailPaymentTableHeaders} = paymentHelper();
    defineComponent({
        name: 'Invoice-Comp'
    })

    const props = defineProps({
        selectedCompany: {
            type: Object,
            required: true
        }
    })
    const headers = ref(getCompanyDetailPaymentTableHeaders())

    const payments = ref([]);
    const isSpinner = ref(false);
    const nodataFoundIcon = require("@/assets/images/svg/No-Search-Result.svg");
    
    onMounted(() => {
        isSpinner.value = true;
        getCompanyDEtailInvoiceTabInvoiceGet(props.selectedCompany._id).then((inv)=>{
            payments.value = inv.payments;
            isSpinner.value = false;
        }).catch((error)=>{
            console.error(error);
            isSpinner.value = false;
        })
    })

    function getColor(status,type) {
        if (status.toLowerCase() == 'paid') {
            if (type == 'background') {
                return '#D4F4E2'
            } else {
                return '#28C76F'
            }
        }
        else if (status.toLowerCase() == 'payment_due') {
            if (type == 'background') {
                return '#FFECDA'
            } else {
                return '#FF9128'
            }
        }
        else if (status.toLowerCase() == 'refunded') {
            if (type == 'background') {
                return '#D4F4E2'
            } else {
                return '#28C76F'
            }
        }
        else if (status.toLowerCase() == 'partialy refunded') {
            if (type == 'background') {
                return '#purple'
            } else {
                return '#80008023'
            }
        }
        else if (status.toLowerCase() == 'not paid') {
            if (type == 'background') {
                return '#F00'
            } else {
                return '#FFE4E4'
            }
        }
        else if (status.toLowerCase() == 'refund_due') {
            if (type == 'background') {
                return '#FFECDA'
            } else {
                return '#FF9128'
            }
        }
        else {
            if (type == 'background') {
                return 'rgb(81 83 90)'
            } else {
                return 'rgb(245 245 245)'
            }
        }
    }
</script>
<style src="./style.css">
</style>