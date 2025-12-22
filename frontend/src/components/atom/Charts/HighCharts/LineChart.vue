<template>
    <div class="main-line-chart-component">
        <div :id="chartId" class="line-chart-container"></div>
    </div>
</template>

<script setup>
import { ref, defineProps, watch, nextTick, onBeforeUnmount } from 'vue';
import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import OfflineExporting from 'highcharts/modules/offline-exporting';
import Accessibility from 'highcharts/modules/accessibility';
import HTMLColors from '@/utils/html-colors-codes.json';

if (typeof Exporting === 'function') Exporting(Highcharts);
if (typeof ExportData === 'function') ExportData(Highcharts);
if (typeof OfflineExporting === 'function') OfflineExporting(Highcharts);
if (typeof Accessibility === 'function') Accessibility(Highcharts);

const props = defineProps({
    chartId: { type: String, default: 'line-chart-container' },
    chartData: { type: Array, required: true },
    xAxisCategories: { type: Array, default: null },
    chartTitle: { type: String, default: null },
    showLegend: { type: Boolean, default: false },
    showDataLabels: { type: Boolean, default: true },
    isTimeFormat: { type: Boolean, default: false },
    isFloatValue: { type: Boolean, default: false },
    exportTitle: { type: String, default: 'Line Data' }
});

const chartDataCopy = ref([]);
const chartInstance = ref(null);
const isLagends = ref(props.showLegend);
const isDataLabels = ref(props.showDataLabels);

watch(() => props.showLegend, (newValue) => {
    isLagends.value = newValue;
    if (chartInstance.value) {
        chartInstance.value.update({
            legend: { enabled: newValue }
        }, false);

        // Update showInLegend for all series
        chartInstance.value.series.forEach(s => {
            s.update({ showInLegend: newValue }, false);
        });
        chartInstance.value.redraw();
    }
});

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

watch(() => [props.chartData, props.xAxisCategories], ([newChartData, newCategories]) => {
    // Ensure chartData is always an array
    chartDataCopy.value = Array.isArray(newChartData) ? newChartData : [];

    if (chartInstance.value) {
        // Update X-axis categories if provided
        if (newCategories && newCategories.length > 0) {
            chartInstance.value.xAxis[0].setCategories(newCategories, false);
        } else {
            // This might need more sophisticated logic if series have different x-points
            const firstSeriesWithData = chartDataCopy.value.find(s => s.data && s.data.length > 0);
            if (firstSeriesWithData) {
                const derivedCategories = firstSeriesWithData.data.map(point => point.name || String(point.x));
                chartInstance.value.xAxis[0].setCategories(derivedCategories, false);
            }
        }

        // Prepare new series configuration
        const newSeriesConfig = chartDataCopy.value.map((seriesItem, seriesIndex) => ({
            name: seriesItem.name,
            data: (seriesItem.data || []).map(point => ({
                name: point.name,
                y: point.value,
                color: point.color,
                visible: point.visible,
            })),
            type: seriesItem.type || 'line',
            color: seriesItem.color || HTMLColors[seriesIndex % HTMLColors.length],
            showInLegend: isLagends.value,
            marker: { enabled: true, ...seriesItem.marker }
        }));

        chartInstance.value.update({ series: newSeriesConfig }, true);

    } else if (chartDataCopy.value.length > 0 && chartDataCopy.value.some(s => s.data && s.data.length > 0)) {
        nextTick(() => {
            initializeChart();
        });
    }
}, { deep: true, immediate: true });

const formatHoursToTime = (value) => {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

const initializeChart = () => {
    if (!document.getElementById(props.chartId) || !(chartDataCopy.value.length > 0 && chartDataCopy.value.some(s => s.data && s.data.length > 0))) {
        return;
    }

    let categoriesToUse = props.xAxisCategories;
    if (!categoriesToUse || categoriesToUse.length === 0) {
        const firstSeriesWithData = chartDataCopy.value.find(s => s.data && s.data.length > 0);
        if (firstSeriesWithData) {
            categoriesToUse = firstSeriesWithData.data.map(point => point.name || String(point.x));
        } else {
            categoriesToUse = [];
        }
    }

    chartInstance.value = Highcharts.chart(props.chartId, {
        chart: {
            type: 'line',
        },
        title: { text: props.chartTitle },
        xAxis: {
            categories: categoriesToUse,
            title: { text: null },
            labels: { style: { fontSize: '14px' } },
            gridLineWidth: 0.5,
            lineWidth: 0,
        },
        yAxis: {
            title: { text: null },
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
            shared: true,
            backgroundColor: '#333',
            borderColor: '#333',
            borderRadius: 8,
            shadow: false,
            formatter: function () {
                let tooltipHtml = `<div><b>${this.x}</b><br/>`;
                this.points.forEach(point => {
                    tooltipHtml += `
                        <span style="color:${point.series.color}; font-size: 14px;">●</span>
                        <span style="font-size: 12px; color: #FFF;">${point.series.name}: </span>
                        <b style="font-size: 13px; color: #FFF;">${
                            props.isTimeFormat 
                                ? formatHoursToTime(point.y) 
                                : Highcharts.numberFormat(
                                    point.y,
                                    props.isFloatValue ? 2 : 0,
                                    '.',
                                    ','
                                )
                        }</b><br/>
                    `;
                });
                tooltipHtml += `</div>`;
                return tooltipHtml;
            }
        },
        legend: {
            enabled: isLagends.value,
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: isDataLabels.value,
                    style: { fontSize: '12px', color: '#333', textOutline: 'none' },
                    formatter: function () {
                        // Check the custom visible flag
                        if (this.point.visible === false) return null;

                        // Show the value (with decimals if needed)
                        return props.isTimeFormat
                            ? formatHoursToTime(this.y) 
                            : Highcharts.numberFormat(
                                this.y,
                                props.isFloatValue ? 2 : 0,
                                '.',
                                ','
                            );
                    }
                }
            }
        },
        series: chartDataCopy.value.map((seriesItem, seriesIndex) => ({
            name: seriesItem.name,
            data: (seriesItem.data || []).map(point => ({
                name: point.name,
                y: point.value, // always include
                color: point.color,
                visible: point.visible, // attach it for later use in label formatter
            })),
            type: seriesItem.type || 'line',
            color: seriesItem.color || HTMLColors[seriesIndex % HTMLColors.length],
            showInLegend: isLagends.value,
            marker: { enabled: true, ...seriesItem.marker }
        })),
        exporting: {
            enabled: false,
            fallbackToExportServer: false,
            buttons: {
                contextButton: {
                    menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF', 'downloadSVG', 'separator', 'printChart']
                }
            },
            chartOptions: { title: { text: props.exportTitle } }
        },
        credits: { enabled: false }
    });
};

onBeforeUnmount(() => {
    if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
    }
});

</script>

<style scoped>
.main-line-chart-component {
    width: 100%;
    height: 100%;
}

.line-chart-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
}
</style>