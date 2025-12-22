<template>
    <div>
        <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
        <div v-else class="invoice_wrapper bg-white">
            <div class="table-container_invoice overflow-auto style-scroll-2-px">
                <div class="d-flex align-items-center justify-content-between">
                    <span class="shade-black font-weight-500 font-size-22">Invoices</span>
                </div>
                <div class="invoice_table--wrapper" v-if="invoices && invoices.length">
                    <table class="company-table" border>
                        <thead class="position-sti">
                            <tr>
                                <th v-for="(header, index) in headers" :key="index">{{ header.name }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in invoices" :key="index">
                                <td>{{item.id}}</td>
                                <td>{{moment(item.date * 1000).format('DD MMM, YYYY')}}</td>
                                <td>{{item.discription}}</td>
                                <td>{{item.noOfUser}}</td>
                                <td>
                                    <span class="currency__sign">$</span>{{Number(item.amount / 100).toFixed(2)}}
                                </td>
                                <td>
                                    <div class="billing__status d-inline-flex font-size-13 text-center align-items-center border-radius-4-px font-weight-400 p5px-p10px cursor-pointer text-capitalize" :style="{'background': getColor(item.status,'background'), 'color': getColor(item.status,'color')}">{{item.status}}</div>
                                </td>
                                <td>
                                    <img :src="downloadImg" class="cursor-pointer" @click="subscriptionInvoiceTabDownloadFunction(item)" />
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
    const {subscriptionInvoiceTabDownloadFunction,getCompanyDEtailInvoiceTabInvoiceGet} = paymentHelper();
    defineComponent({
        name: 'Invoice-Comp'
    })

    const props = defineProps({
        selectedCompany: {
            type: Object,
            required: true
        }
    })

    const headers = ref([
        {name:'Invoice No.'},
        {name:'Invoice Date'},
        {name:'Description'},
        {name:'No. of User'},
        {name:'Amount'},
        {name:'Status'},
        {name:'Invoice'}
    ])
    const downloadImg = require('@/assets/images/svg/download_icon.svg');
    const nodataFoundIcon = require("@/assets/images/svg/No-Search-Result.svg");

    const invoices = ref([]);
    const isSpinner = ref(false);
    
    onMounted(() => {
        isSpinner.value = true;
        getCompanyDEtailInvoiceTabInvoiceGet(props.selectedCompany._id).then((inv)=>{
            invoices.value = inv.invoices;
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