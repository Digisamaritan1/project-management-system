<template>
    <div v-if="transactionData && transactionData.length">
        <table class="history_transectiontable">
            <thead>
                <th>Id</th>
                <th>Occurred On</th>
                <th>Status</th>
                <th>Type</th>
                <th>Payment Method</th>
                <th>Amount</th>
            </thead>
            <tbody>
                <tr v-for="(item,index) in transactionData" :key="index">
                    <td>{{item.id}}</td>
                    <td>{{moment(item.occuredOn * 1000).format("DD MMM YYYY")}}</td>
                    <td><span class="history_transectiontable_status" :style="{'background': getColor(item.status,'background'), 'color': getColor(item.status,'color')}">{{item.status}}</span></td>
                    <td>{{item.type}}</td>
                    <td>{{item.paymentMethod}}</td>
                    <td>${{Number(item.amount/ 100).toFixed(2)}}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else class="emptyTable">
        No transaction history.
    </div>
</template>

<script setup>
    import { ref,defineProps, watch } from "vue";
    import moment from "moment";
    const props = defineProps({
        transectionArray : {
            type: Array,
        }
    })
    const transactionData = ref(props.transectionArray);
    watch(() => props.transectionArray, (newVal) => {
       transactionData.value = newVal
    })

    function getColor(status,type) {
        if (status.toLowerCase() == 'success') {
            if (type == 'background') {
                return '#D4F4E2'
            } else {
                return '#28C76F'
            }
        } else if (status.toLowerCase() == 'failure') {
            if (type == 'background') {
                return '#FFE4E4'
            } else {
                return '#FF0000'
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