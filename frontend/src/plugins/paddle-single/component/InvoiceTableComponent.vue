<template>
    <div class="billing__history-table overflow-auto style-scroll-2-px">
        <table>
            <thead class="position-sti">
                <tr>
                    <th>{{$t('Billing.id')}}</th>
                    <th>{{$t('Billing.type')}}</th>
                    <th>{{$t('Billing.date')}}</th>
                    <th>{{$t('Billing.description')}}</th>
                    <th>{{$t('Billing.no_of_users')}}</th>
                    <th>{{$t('Billing.amount')}}</th>
                    <th>{{$t('Billing.status')}}</th>
                    <th></th>
                    <th>{{isInvoice ? $t('Billing.Invoices') : $t('Billing.credit_notes')}}</th>
                </tr>
            </thead>
            <tbody v-if="transections.length">
                <tr v-for="(data,index) in transections" :key="index">
                    <td>{{data.id}}</td>
                    <td class="text-capitalize">{{data.type == 'credit_note' ? 'Credit Note' : data.type}}</td>
                    <td>{{moment(new Date(data.date)).format('DD MMM, YYYY')}}</td>
                    <td :title="data.discription">
                        <div class="invoice__paln-status text-ellipsis d-block">{{data.discription}}</div>
                    </td>
                    <td>
                        <div class="noof__user">{{data.noOfUser}}</div>
                    </td>
                    <td>
                        <div class="billing__amount">
                        <span class="currency__sign">$</span>{{Number(data.amount / 100).toFixed(2)}}</div>
                    </td>
                    <td>
                        <div class="billing__status d-inline-flex font-size-13 text-center align-items-center border-radius-4-px font-weight-400 p5px-p10px cursor-pointer text-capitalize" :style="{'background': getColor(data.status,'background'), 'color': getColor(data.status,'color')}">{{data.status}}</div>
                    </td>
                    <td>
                        <div class="pay__now-btn font-size-16 border-radius-4-px bg-blue white d-inline-flex  align-items-center  justify-content-center cursor-pointer" v-if="data.status.toLowerCase() == 'payment_due' && !data.adjusted" @click="payInvocie(data)">{{$t('Billing.pay_now')}}</div>
                    </td>
                    <td>
                        <div class="download__btn cursor-pointer font-size-16 blue font-weight-400 border-radius-4-px  border-primary bg-white text-center w-fitcontent d-flex align-items-center justify-content-center" @click="downloadFunction(data)">{{$t('Billing.download')}}</div>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                No {{isInvoice ? 'Invoice' : 'CreditNote'}} History Found
            </tbody>
        </table>
    </div>
</template>

<script setup>
    import {defineProps,defineEmits} from 'vue';
    import moment from "moment";
    defineProps({
        transections: {
            type: Array,
            default: () => []
        },
        isInvoice: {
            type: Boolean
        }
    })

    const emits = defineEmits(['payPendingInvoice', 'download'])

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

    function payInvocie(data) {
        emits('payPendingInvoice',data)
    }

    function downloadFunction(data) {
        emits('download',data)
    }
</script>