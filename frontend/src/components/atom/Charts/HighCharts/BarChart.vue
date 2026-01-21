<!-- Example uses

    This is the use case of this component in the parent component with its props. 

    <HighChartBarChart
        :chartData="[
            { name: 'To Do', value: 30, color: '#FEB019' },
            { name: 'In Progress', value: 8, color: '#008FFB' },
            { name: 'Code Review', value: 20, color: '#c408f6' },
            { name: 'In Review', value: 35, color: '#775DD0' },
            { name: 'Bug', value: 12, color: '#FF4560' },
            { name: 'Done', value: 25, color: '#00E396' },
            { name: 'Completed', value: 90, color: '#4CAF50' }
        ]"
        :showLegend="false"
        :showDataLabels="true"
    />
-->

<template>
    <div class="main-bar-chart-component">
        <div :id="chartId" class="bar-chart-container"></div>
    </div>
</template>

<script setup>
import { ref, defineProps, watch, nextTick } from 'vue';
import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import OfflineExporting from 'highcharts/modules/offline-exporting';
import Accessibility from 'highcharts/modules/accessibility';

// Utils
import HTMLColors from '@/utils/html-colors-codes.json'

// Apply Highcharts modules
if (typeof Exporting === 'function') Exporting(Highcharts);
if (typeof ExportData === 'function') ExportData(Highcharts);
if (typeof OfflineExporting === 'function') OfflineExporting(Highcharts);
if (typeof Accessibility === 'function') Accessibility(Highcharts);

// Define Props
const props = defineProps({
    chartId: { type: String, default: 'bar-chart-container' },
    chartData: { type: Array, required: true },
    chartTitle: { type: String, default: null },
    showLegend: { type: Boolean, default: false },
    showDataLabels: { type: Boolean, default: true },
    exportTitle: { type: String, default: 'Bar Data' }
});

// Create a local reactive copy of chartData
const chartDataCopy = ref([]);
const chartInstance = ref(null);
const isLagends = ref(props.showLegend);
const isDataLabels = ref(props.showDataLabels)

// Keep watch on the showLegend prop
watch(() => props.showLegend, (newValue) => {
    isLagends.value = newValue;

    if (chartInstance.value) {
        chartInstance.value.update({
            legend: { enabled: newValue },
            series: chartDataCopy.value.map((item, index) => ({
                name: item.name,
                color: item.color,
                data: new Array(chartDataCopy.value.length).fill(null).map((_, i) => i === index ? {
                        y: item.value,
                        color: item.color
                    } : null),
                showInLegend: newValue,
                type: 'column'
            })),
        }, true);
    }
});

// Keep watch on the showDataLabels prop
watch(() => props.showDataLabels, (newValue) => {
    isDataLabels.value = newValue;

    if (chartInstance.value) {
        chartInstance.value.update({
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: newValue
                    }
                }
            }
        }, true);
    }

});

// Keep watch on chartData prop
watch(() => props.chartData, (val) => {
    if (!val || val.length === 0) return;

    // Update local chartDataCopy
    chartDataCopy.value = val.map((item, index) => ({
        ...item,
        visible: true,
        color: item.color && item.color.trim() !== '' ? item.color : HTMLColors[index]
    }));

    // Just update the series data instead of re-initializing the chart
    if (chartInstance.value) {
        chartInstance.value.series[0].setData(
            chartDataCopy.value.map(item => ({
                y: item.visible ? item.value : null,
                color: item.color
            })),
            true
        );
    } else {
        // Initialize only once
        nextTick(() => {
            initializeChart();
        });
    }
}, { deep: true, immediate: true });

// Initialize Chart
const initializeChart = () => {
    if (!document.getElementById(props.chartId)) {
        setTimeout(initializeChart, 100); // Retry if container is not ready
        return;
    }

    chartInstance.value = Highcharts.chart(props.chartId, {
        chart: {
            type: 'column',
        },
        title: { text: props.chartTitle },
        xAxis: {
            title: {
                text: null
            },
            categories: chartDataCopy.value.map(item => item.name),
            labels: { style: { fontSize: '14px' } },
            gridLineWidth: 0.5,
            lineWidth: 0
        },
        yAxis: {
            title: {
                text: null
            },
            labels: { style: { fontSize: '14px' } },
            gridLineWidth: 0.5,
            lineWidth: 0,
            allowDecimals: false,
        },
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        },
        tooltip: {
            useHTML: true,
            backgroundColor: '#333',
            borderColor: '#333',
            borderRadius: 8,
            shadow: false,
            formatter: function () {
                const categoryName = this.series.xAxis.categories[this.point.index];
                return `
                    <div>
                        <span style="color:${this.point.color}; font-size: 16px;">●</span> 
                        <b style="font-size: 14px; color: #FFF;">${categoryName}: ${this.y}</b>
                    </div>
                `;
            }
        },
        legend: {
            enabled: isLagends.value,
        },
        plotOptions: {
            column: {
                borderRadius: 0,
                dataLabels: {
                    enabled: isDataLabels.value,
                    style: { fontSize: '14px', color: '#333' }
                }
            },
            series: {
                grouping: false
            }
        },
        series: chartDataCopy.value.map((item, index) => ({
            name: item.name,
            color: item.color,
            data: new Array(chartDataCopy.value.length).fill(null).map((_, i) => i === index ? {
                y: item.value,
                color: item.color
            } : null),
            showInLegend: isLagends.value,
            type: 'column'
        })),
        exporting: {
            enabled: false,
            fallbackToExportServer: false,
            buttons: {
                contextButton: {
                    menuItems: [
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG'
                    ]
                }
            },
            chartOptions: {
                title: {
                    text: props.exportTitle
                }
            }
        },
        credits: { enabled: false }
    });
};

</script>

<style scoped>
.main-bar-chart-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.bar-chart-container {
    flex: 1;
    width: 100%;
}
</style>