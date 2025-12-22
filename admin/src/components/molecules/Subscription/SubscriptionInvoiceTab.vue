<template>
    <div v-if="invoiceData.length">
        <table class="history_invoicetable">
            <thead>
                <th>Invoice No.</th>
                <th>Invoice Date</th>
                <th>Description</th>
                <th>No. of User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
            </thead>
            <tbody>
                <tr v-for="(item,index) in invoiceData" :key="index">
                    <td>{{item.invoiceId}}</td>
                    <td>{{item.date ? moment(item?.date * 1000).format("DD MMM YYYY") : '-'}}</td>
                    <td>{{item.discription}}</td>
                    <td>{{item.noofUser}}</td>
                    <td>${{Number(item.total/ 100).toFixed(2)}}</td>
                    <td><span class="history_invoicetable_status" :style="{'background': getColor(item.status,'background'), 'color': getColor(item.status,'color')}">{{item.status}}</span></td>
                    <td @click="subscriptionInvoiceTabDownloadFunction(item)" class="cursor-pointer"><img src="@/assets/images/svg/download_icon.svg"/></td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else class="emptyTable">
        No Invoices.
    </div>
</template>

<script setup>
    import { ref,defineProps, watch } from "vue";
    import moment from "moment";
    import { paymentHelper } from '@/utils/paymentHelper/helper';

    const {subscriptionInvoiceTabDownloadFunction} = paymentHelper();
    const props = defineProps({
        invoiceArray : {
            type: Array,
        }
    })
    const invoiceData = ref(props.invoiceArray);
    watch(() => props.invoiceArray, (newVal) => {
       invoiceData.value = newVal
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
<style scoped src="./style.css"></style>