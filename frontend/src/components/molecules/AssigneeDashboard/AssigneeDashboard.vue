<template>
    <div>
        <ApexChart 
            type="donut" 
            :options="chartOptions" 
            :series="chartSeries" 
            width="400" 
            height="400">
        </ApexChart>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// Chart options for the Doughnut chart
const chartOptions = {
    chart: {
        type: 'donut',
        // type: 'pie',
    },
    labels: ['Blue', 'Green', 'Yellow'],
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }]
};

// Data for the chart
const chartSeries = ref([300, 50, 100]); // Data for the chart

</script>

<style scoped>
/* Add any styles you want for your AssigneeDashboard component */
</style>