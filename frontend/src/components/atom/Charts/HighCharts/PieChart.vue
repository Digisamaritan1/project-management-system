<!-- Example uses

    This is the use case of this component in the parent component with its props. 

    <HighChartPieChart
        :chartData="[
            { name: 'To Do', y: 40, color: '#FEB019' },
            { name: 'In Progress', y: 15, color: '#008FFB' },
            { name: 'Code Review', y: 20, color: '#c408f6' },
            { name: 'In Review', y: 10, color: '#775DD0' },
            { name: 'Bug', y: 45, color: '#FF4560' },
            { name: 'Done', y: 30, color: '#00E396' },
            { name: 'Completed', y: 75, color: '#4CAF50' }
        ]"
        :isPercentageShow="false"
        :showLegend="false"
    /> 
-->

<template>
    <div class="main-pie-chart-component">
        <div :id="chartId" class="pie-chart-container"></div>
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

const props = defineProps({
    chartId: { type: String, default: 'pie-chart-container' },
    chartData: { type: Array, required: true },
    chartTitle: { type: String, default: null },
    isPercentageShow: { type: Boolean, default: false },
    showLegend: { type: Boolean, default: false },
    exportTitle: { type: String, default: 'Pie Chart' }
});

// Create a local reactive copy of chartData
const chartDataCopy = ref([]);
const chartInstance = ref(null);
const isLagends = ref(props.showLegend);
const isPercentage = ref(props.isPercentageShow);

// Keep watch on the showLegend prop
watch(() => props.showLegend, (newValue) => {
    isLagends.value = newValue;

    if (chartInstance.value) {
        chartInstance.value.update({
            legend: {
                enabled: newValue
            },
            plotOptions: {
                pie: {
                    showInLegend: newValue,
                }
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 400
                    },
                    chartOptions: {
                        plotOptions: {
                            pie: {
                                dataLabels: {
                                    enabled: false
                                }
                            }
                        },
                        legend: {
                            enabled: newValue,
                            align: 'center',
                            verticalAlign: 'bottom',
                            layout: 'horizontal'
                        }
                    }
                }]
            }
        }, true);
    }

});

// Keep watch on the isPercentageShow prop
watch(() => props.isPercentageShow, (newValue) => {
    isPercentage.value = newValue;

    if (chartInstance.value) {
        chartInstance.value.update({
            plotOptions: {
                pie: {
                    dataLabels: {
                        format: newValue ? '<b>{point.name}</b>: {point.percentage:.1f} %' : '<span>{point.name}</span>: {point.y}',
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

    if (chartInstance.value) {
        // Just update the series data instead of re-initializing the chart
        chartInstance.value.series[0].setData(
            chartDataCopy.value.map(item => ({
                y: item.visible ? item.y : null,
                name: item.name,
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
        setTimeout(initializeChart, 100);
        return;
    }

    Highcharts.setOptions({
        lang: { decimalPoint: '.', thousandsSep: ',' }
    });

    chartInstance.value = Highcharts.chart(props.chartId, {
        chart: { type: 'pie' },
        title: { text: props.chartTitle },
        tooltip: {
            useHTML: false,
            backgroundColor: '#333',
            borderColor: '#333',
            borderRadius: 8,
            shadow: false,
            formatter: function () {
                return `
                    <div>
                        <span style="color:${this.point.color}; font-size: 16px;">●</span> 
                        <b style="font-size: 14px; color: #FFF;">${this.point.name}: ${this.point.y}</b>
                    </div>
                `;
            }
        },
        legend: {
            enabled: isLagends.value
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                showInLegend: isLagends.value,
                dataLabels: {
                    enabled: true,
                    format: props.isPercentageShow ? '<b>{point.name}</b>: {point.percentage:.1f} %' : '<span>{point.name}</span>: {point.y}',
                    style: { fontSize: '14px' }
                },
                point: {
                    events: {
                        click: function () {
                            this.slice(!this.selected);
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Data',
            colorByPoint: true,
            data: chartDataCopy.value.map(item => ({
                y: item.visible ? item.y : null,
                name: item.name,
                color: item.color
            }))
        }],
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
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 400
                },
                chartOptions: {
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: false
                            }
                        }
                    },
                    legend: {
                        enabled: isLagends.value,
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    }
                }
            }]
        },
        credits: { enabled: false }
    });
};
</script>

<style scoped>
.main-pie-chart-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.pie-chart-container {
    flex: 1;
    width: 100%;
}
</style>
