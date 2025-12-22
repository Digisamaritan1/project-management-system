<template>
    <div class="billing__history-table promotional__credits overflow-auto style-scroll-2-px">
        <table>
            <thead class="position-sti">
                <tr>
                    <th>{{$t('Billing.created_on')}}</th>
                    <th>{{$t('Billing.description')}}</th>
                    <th>{{$t('Billing.amount')}}</th>
                    <th>{{$t('Billing.balance')}}</th>
                </tr>
            </thead>
            <tbody v-if="promotionalCredit.length">
                <tr v-for="(data,index) in promotionalCredit" :key="index">
                    <td>{{moment(data.created_at * 1000).format('DD MMM, YYYY')}}</td>
                    <td :title="data.description">
                        <div class="text-ellipsis d-block">{{data.description}}</div>
                    </td>
                    <td>
                        <div class="billing__amount">
                        <span class="currency__sign">$</span>{{Number(data.amount / 100).toFixed(2)}}</div>
                    </td>
                    <td>
                        <div class="billing__amount">
                        <span class="currency__sign">$</span>{{Number(data.closing_balance / 100).toFixed(2)}}</div>
                    </td>
                </tr>
            </tbody>
            <tbody v-else>
                {{$t('Billing.no_promotional_found')}}
            </tbody>
        </table>
    </div>
</template>

<script setup>
    import moment from "moment";
    defineProps({
        promotionalCredit: {
            type: Array,
            default: () => []
        },
    })
</script>