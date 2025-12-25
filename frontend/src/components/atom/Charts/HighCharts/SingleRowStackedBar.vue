<!-- Example uses

    This is the use case of this component in the parent component with its props. 

    <StackedBarChart
        :chartData="[
            { name: 'To Do', data: [30], color: '#FEB019' },
            { name: 'In Progress', data: [18], color: '#008FFB' },
            { name: 'Code Review', data: [20], color: '#c408f6' },
            { name: 'In Review', data: [35], color: '#775DD0' },
            { name: 'Bug', data: [12], color: '#FF4560' },
            { name: 'Done', data: [25], color: '#00E396' },
            { name: 'Completed', data: [90], color: '#4CAF50' }
        ]"
        :showLegend="false"
    />
-->

<template>
    <div class="stacked-bar-chart-component">
        <div :id="chartId" class="stacked-bar-chart-container"></div>
    </div>
</template>

<script setup>
import { defineProps, ref, watch, nextTick } from 'vue';
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
    chartId: { type: String, default: 'stacked-bar-chart-container' },
    chartData: { type: Array, required: true },
    chartTitle: { type: String, default: null },
    showLegend: { type: Boolean, default: false },
    showDataLabels: { type: Boolean, default: false },
    exportTitle: { type: String, default: 'Single Stack Bar Chart' }
});

// Variables
const chartDataCopy = ref([]);
const chartInstance = ref(null);
const isLagends = ref(props.showLegend);
const isDataLabels = ref(props.showDataLabels);

watch(() => props.chartData, (val) => {
    if (!val || val.length === 0) return;

    // Update local chartDataCopy
    chartDataCopy.value = val.map((item, index) => ({
        ...item,
        visible: true,
        color: item.color && item.color.trim() !== '' ? item.color : HTMLColors[index]
    }));

    // Just update the series data instead of re-initializing the chart
    if (!chartInstance.value) {
        nextTick(() => {
            initializeChart();
        });
    }
}, { deep: true, immediate: true });

// Keep watch on the showLegend prop
watch(() => props.showLegend, (newValue) => {
    isLagends.value = newValue;

    if (chartInstance.value) {
        chartInstance.value.update({
            legend: {
                enabled: newValue
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 400
                    },
                    chartOptions: {
                        legend: {
                            enabled: newValue,
                        }
                    }
                }]
            }
        }, true);
    }

});

// Keep watch on the showDataLabels prop
watch(() => props.showDataLabels, (newValue) => {
    isDataLabels.value = newValue;

    if (chartInstance.value) {
        chartInstance.value.update({
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: newValue,
                    }
                }
            }
        }, true);
    }

});

// Initialize chart on mount
const initializeChart = () => {
    if (!document.getElementById(props.chartId)) {
        setTimeout(initializeChart, 100); // Retry if container is not ready
        return;
    }

    chartInstance.value = Highcharts.chart(props.chartId, {
        chart: {
            type: 'bar', // Horizontal stacked bar chart
            // scrollablePlotArea: { minWidth: 800 }
        },
        title: {
            text: props.chartTitle
        },
        xAxis: {
            categories: chartDataCopy.value.map(item => item.name), // Only one row
            title: {
                text: null // Hide axis title
            },
            labels: {
                enabled: false // Hide x-axis labels
            },
            gridLineWidth: 0.5,
            lineWidth: 0,
            // min: 0,
            // scrollbar: { enabled: true }
        },
        yAxis: {
            min: 0,
            title: {
                text: null // Hide y-axis title
            },
            labels: {
                style: {
                    fontSize: '14px'
                }
            },
            stackLabels: {
                enabled: false,
                style: {
                    fontWeight: 'bold',
                    color: '#333'
                }
            },
            gridLineWidth: 0.5,
            lineWidth: 0,
            allowDecimals: false,
        },
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        },
        legend: {
            enabled: isLagends.value
        },
        tooltip: {
            useHTML: true,
            backgroundColor: '#333',  // Custom background color
            borderColor: '#333',      // Border color
            borderRadius: 8,          // Rounded corners
            borderWidth: 0,           // Border width
            shadow: false,
            formatter: function () {
                return `
                    <div>
                        <span style="color:${this.point.color}; font-size: 16px;">●</span> 
                        <b style="font-size: 14px; color: #FFF;">${this.series.name}: ${this.point.y}</b><br>
                    </div>
                `;
            }
        },
        plotOptions: {
            series: {
                stacking: 'normal', // Enable stacking
                dataLabels: {
                    enabled: isDataLabels.value,
                    // format: '<span>{series.name}</span>: {point.percentage:.1f} %', // Display percentage
                    format: '<span>{series.name}</span>: {point.y}', // Display value
                    style: {
                        fontSize: '14px',
                        color: '#FFFFFF',
                        fontWeight: 500
                    }
                }
            }
        },
        series: chartDataCopy.value.map(item => ({
            name: item.name,
            data: item.data,
            color: item.color
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
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 400
                },
                chartOptions: {
                    plotOptions: {
                        series: {
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
        credits: {
            enabled: false
        }
    });
}

</script>

<style scoped>
.stacked-bar-chart-component {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
}

.stacked-bar-chart-container {
    flex: 1;
    width: 100%;
}

@media (max-width: 600px) {
    .stacked-bar-chart-container {
        height: 300px;
    }
}

@media (max-width: 400px) {
    .stacked-bar-chart-container {
        height: 250px;
    }
}
</style>
