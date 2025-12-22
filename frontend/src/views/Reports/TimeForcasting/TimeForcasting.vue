<template>
    <div class="resource-planning-report-main">
        <!-- Breadcrumb section -->
        <div class="breadcrumb-section">
            <ul class="d-flex align-items-center m-0 p-0">
                <li @click="homeRoute()" class="pr-15px">
                    <img class="cursor-pointer" :src="homeIcon" alt="homeIcon" />
                </li>
                <li class="border-left pr-15px pl-15px">
                    <router-link :to="`/${companyId}/project`"
                        class="text-decoration-underline font-size-18 font-weight-700">{{ $t('UserTimesheet.back_projects') }}</router-link>
                </li>
                <li class="border-left pl-15px">
                    <span class="workload_title font-size-18 font-weight-700">{{ $t('Header.Time_Forcasting') }}</span>
                </li>
            </ul>
        </div>
        <!-- Loading state -->
        <Spinner v-if="isSpinner" :is-spinner="isSpinner" />
        <!-- Content area section -->
        <div v-else class="content-area bg-light-gray">
            <div class="top-section d-flex align-items-center">
                <div class="item-box">
                    <strong>{{ $t('timeForecastingReport.project_name') }}</strong>
                    <CustomDropDown :maxWidth="clientWidth > 767 ? '250px' : '100%'" :zindexCustomDrop="99"
                        :bodyClass="{ 'time-forcasting-project-dropdpown': true }" maxHeight="auto">
                        <template #button>
                            <div
                                ref="keyRefs"
                                class="project-dropdown font-size-13"
                                :style="{ color: clientWidth > 767 ? '#818181' : '#B3B3B3', maxWidth: clientWidth > 767 ? '250px' : '100%' }"
                            >
                                <span class="text-ellipsis" :title="selectedProject?.ProjectName">{{Object.keys(selectedProject).length > 0 ? selectedProject?.ProjectName : `${$t('PlaceHolder.Select')}`}}</span>
                            </div>
                        </template>
                        <template #options>
                            <div v-if="projectsList.length > 0">
                                <div class="search-box p-10px">
                                    <input type="text" v-model="searchQuery" :placeholder="$t('PlaceHolder.search')"
                                        class="form-control font-size-14" />
                                </div>
                                <div class="dropdown-list p-10px">
                                    <div v-for="(option, i) in filteredProjects" :key="i"
                                        class="dropdown-item cursor-pointer"
                                        @click.stop.prevent="$refs.keyRefs.click(), projectSelectionEvent(option)">
                                        <span class="font-size-13 font-weight-400 text-ellipsis"
                                            :title="option?.ProjectName">{{ option?.ProjectName }}</span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="font-size-13 gray81">{{ $t('Filters.no_data_found') }}</div>
                        </template>
                    </CustomDropDown>
                </div>
                <div class="item-box">
                    <strong>{{ $t('timeForecastingReport.start_date') }}</strong>
                    <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                    <span v-else>{{ selectedProject?.StartDate ? convertDateFormat(selectedProject?.StartDate, '', { showDayName: false }) : 'N/A' }}</span>
                </div>
                <div class="item-box">
                    <strong>{{ $t('timeForecastingReport.due_date') }} </strong>
                    <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                    <span v-else>{{ selectedProject?.DueDate ? convertDateFormat(selectedProject?.DueDate, '', { showDayName: false }) : 'N/A' }}</span>
                </div>
                <div class="item-box">
                    <strong>{{ $t('timeForecastingReport.last_logged_date') }} </strong>
                    <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                    <span v-else>{{ selectedProject?.lastLoggedDate ? convertDateFormat(selectedProject?.lastLoggedDate, '', { showDayName: false }) : 'N/A' }}</span>
                </div>
            </div>
            <div class="middle-section d-flex">
                <div class="item-box">
                    <label class="heading-title">{{ $t('timeForecastingReport.budget') }}</label>
                    <ul class="m-0 p-0">
                        <li>
                            <strong>{{ $t('timeForecastingReport.estimated_hours') }} </strong>
                            <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                            <span v-else>{{ selectedProject?.totalEstimatedTime ? selectedProject?.totalEstimatedTime + ' Hrs' : 'N/A'}}</span>
                        </li>
                        <li>
                            <strong>{{ $t('timeForecastingReport.project_status') }} </strong>
                            <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                            <span v-else>{{ projectStatus?.name }}</span>
                        </li>
                    </ul>
                </div>
                <div class="item-box">
                    <label class="heading-title">{{ $t('timeForecastingReport.actual') }}</label>
                    <ul class="m-0 p-0">
                        <li>
                            <strong>{{ $t('timeForecastingReport.logged_hours') }} </strong>
                            <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                            <span v-else>{{ selectedProject?.totalLoggedTime ? selectedProject?.totalLoggedTime + ' Hrs' : 'N/A'}}</span>
                        </li>
                        <li>
                            <strong>{{ $t('timeForecastingReport.remaining_hours') }} </strong>
                            <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                            <span v-else>{{ selectedProject?.remainingHours }}</span>
                        </li>
                        <li v-if="parseFloat(selectedProject?.remainingHours) <= 0">
                            <strong>{{ $t('timeForecastingReport.overdue_hours') }} </strong>
                            <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                            <span v-else>{{ selectedProject?.overDueHours + ' Hrs' }}</span>
                        </li>
                    </ul>
                </div>
                <div class="item-box">
                    <label class="heading-title">{{ $t('timeForecastingReport.forecast') }}</label>
                    <ul class="m-0 p-0">
                        <li>
                            <strong>{{ $t('timeForecastingReport.estimated_time_to_complete') }} </strong>
                            <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                            <span v-else>{{ selectedProject?.estimatedWorkingDays + ' Days' || 'N/A' }}</span>
                        </li>
                        <li>
                            <strong>{{ $t('timeForecastingReport.estimated_complition_date') }} </strong>
                            <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 17px; width: 70px;" />
                            <span v-else>{{ selectedProject?.differenceDate ? convertDateFormat(selectedProject?.differenceDate, '', { showDayName: false }) : 'N/A' }}</span>
                        </li>
                    </ul>
                </div>
                <div class="item-box m-auto">
                    <Skelaton v-if="isLoading" class="border-radius-5-px" style="height: 80px; width: 100%" />
                    <div v-else class="score-section border d-block">
                        <strong class="title">{{ $t('timeForecastingReport.estimated_complition_date') }}</strong>
                        <p class="score" :style="[{ 'color': selectedProject?.overDueHours ? 'red' : 'green' }]">
                            <span class="mr-5px" :class="selectedProject?.overDueHours ? 'arrow-down' : 'arrow-up'"></span>
                            {{ selectedProject?.differenceDate ? convertDateFormat(selectedProject?.differenceDate, '', { showDayName: false }) : 'N/A' }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="chart-wrapper">
                <div class="controls">
                    <div class="left-section d-flex align-items-center">
                        <label class="d-flex align-items-center mr-15 cursor-pointer">
                            <CheckboxComponent v-model="showLegend" class="mr-10-px"/>
                            {{ $t('timeForecastingReport.show_legends') }}
                        </label>
                        <label class="d-flex align-items-center cursor-pointer">
                            <CheckboxComponent v-model="showDataLabels" class="mr-10-px"/>
                            {{ $t('timeForecastingReport.show_data_labels') }}
                        </label>
                    </div>
                    <div class="right-section">
                        <strong class="mr-15">{{ $t('timeForecastingReport.report_type') }}</strong>
                        <select class="form-control w-auto mr-15" id="report-type" v-model="selectedType" @change="updateChartType">
                            <option v-for="(item, index) in chartTypes" :key="index" :value="item.value">{{ item.name }}</option>
                        </select>
                        <select class="form-control w-auto" id="data-dropdown" v-model="selectedDataObject" @change="updateChartData">
                            <option v-for="(item, index) in dataArray" :key="index" :value="item.value">{{ item.name }}</option>
                        </select>
                    </div>
                </div>
                <div v-if="!chartDataSeries[0].data.length && !chartDataSeries[1].data.length && !isSkelatonLoading" class="no-result-found">
                    {{ $t('Filters.no_data_found') }}
                </div>
                <div v-else>
                    <Skelaton v-if="isSkelatonLoading" class="border-radius-5-px" style="height: 300px; width: 100%" />
                    <LineChart
                        v-else
                        :chart-id="'timeForecastingChart'"
                        :chart-data="chartDataSeries"
                        :x-axis-categories="xAxisCategories"
                        :chart-title="''"
                        :show-legend="showLegend"
                        :show-data-labels="showDataLabels"
                        :export-title="'Demo'"
                        :is-time-format="true"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// imports
import { ref, onMounted, inject, computed } from "vue";
import { useRouter } from "vue-router"
import { useStore } from "vuex";

// Components
import Skelaton from '@/components/atom/Skelaton/Skelaton.vue';
import Spinner from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import CustomDropDown from '@/components/molecules/DropDown/CustomDropDown.vue';
import LineChart from "@/components/atom/Charts/HighCharts/LineChart.vue";
import CheckboxComponent from '@/components/atom/Checkbox/CheckboxComponent.vue';

// Images
const homeIcon = require("@/assets/images/home_icon.png");

// Utilities
import { apiRequest } from "@/services";
import { useConvertDate } from "@/composable";
import { getConvertedTimeString } from '@/composable/commonFunction';
import { useProjectsHelper } from '@/views/Projects/helper.js';
import { API_TIME_FORCASTING_REPORT } from "@/config/env";
const router = useRouter()
const { getters } = useStore();
const { dispatchProjects } = useProjectsHelper();
const { convertDateFormat } = useConvertDate();

// Constants
const chartTypes = [
    { name: 'Monthly', value: 'monthly'},
    { name: 'Yearly', value: 'yearly'},
    { name: 'Quarterly', value: 'quarterly'}
];
const months = [
    { name: 'January', value: 0 },
    { name: 'February', value: 1 },
    { name: 'March', value: 2 },
    { name: 'April', value: 3 },
    { name: 'May', value: 4 },
    { name: 'June', value: 5 },
    { name: 'July', value: 6 },
    { name: 'August', value: 7 },
    { name: 'September', value: 8 },
    { name: 'October', value: 9 },
    { name: 'November', value: 10 },
    { name: 'December', value: 11 },
];
const quarters = [
    { name: 'Jan/Feb/Mar', value: 1 },
    { name: 'Apr/May/Jun', value: 2 },
    { name: 'Jul/Aug/Sep', value: 3 },
    { name: 'Oct/Nov/Dec', value: 4 }
]
const years = [
    { name: '2015', value: 2015 },
    { name: '2016', value: 2016 },
    { name: '2017', value: 2017 },
    { name: '2018', value: 2018 },
    { name: '2019', value: 2019 },
    { name: '2020', value: 2020 },
    { name: '2021', value: 2021 },
    { name: '2022', value: 2022 },
    { name: '2023', value: 2023 },
    { name: '2024', value: 2024 },
    { name: '2025', value: 2025 },
    { name: '2026', value: 2026 },
];

// Variables
const companyId = inject('$companyId');
const clientWidth = inject("$clientWidth");
const isSpinner = ref(true);
const isLoading = ref(true);
const isSkelatonLoading = ref(true);
const showLegend = ref(true);
const showDataLabels = ref(true);
const projectsList = ref([]);
const selectedProject = ref({});
const searchQuery = ref('');
const xAxisCategories = ref([]);
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const selectedType = ref('monthly');
const selectedDataObject = ref(currentMonth)
const dataArray = ref(months);
const chartDataSeries = ref([
    {
        name: 'Estimated Hours',
        color: '#4BC0C0',
        type: 'line',
        marker: { symbol: 'circle', radius: 4 },
        data: []
    },
    {
        name: 'Logged Hours',
        color: '#FF6384',
        type: 'line',
        marker: { symbol: 'circle', radius: 4 },
        data: []
    }
]);

// Computed properties
const projectsGetter = computed(() => getters["projectData/projects"]);
const projectStatusGetter = computed(() => getters["settings/AllProjectStatus"]);
const filteredProjects = computed(() => {
    if (!searchQuery.value) return projectsList.value;
    const lowerCaseQuery = searchQuery.value.toLowerCase();
    return projectsList.value.filter(project => project?.ProjectName?.toLowerCase().includes(lowerCaseQuery));
});
const projectStatus = computed(() => {
    const projectStatusArray = projectStatusGetter.value;
    const data = JSON.parse(JSON.stringify(projectStatusArray.settings));
    return data.filter(x => x.value === selectedProject.value?.status)[0];
});

onMounted(async () => {
    try {
        if (!projectsGetter.value?.data?.length) {
            const res = await dispatchProjects();
            projectsList.value = res.data;
        } else {
            projectsList.value = projectsGetter.value.data;
        }
        selectedProject.value = projectsList.value[0];
    } catch (error) {
        console.error("Error fetching projects:", error);
    } finally {
        isSpinner.value = false;
        updateChartData()
        init();
    }
});

const homeRoute = () => router.push({ path: `/${companyId.value}` });

const convertedTimeString = (n, type) => {
    return getConvertedTimeString(n, type);
}

const calculateAverageDays = (totalHours, hours) => {
    if (hours === 0) return 0;
    return totalHours / hours;
}

const getCompletionDate = (startDate, workingDays) => {
    const resultDate = new Date(startDate);

    while (workingDays > 0) {
        resultDate.setDate(resultDate.getDate() + 1);
        const day = resultDate.getDay(); // 0 = Sunday, 6 = Saturday

        if (day !== 0 && day !== 6) {
            workingDays--;
        }
    }

    return resultDate;
}

const buildxAxisDataSeries = (data) => data.map(item => item.name);

const init = async () => {
    isLoading.value = true;
    isSkelatonLoading.value = true;

    try {
        const params = {
            pid: selectedProject.value._id
        };

        const response = await apiRequest("post", `${API_TIME_FORCASTING_REPORT}`, params);
        const res = response.data;

        const totalEstimatedTime = res.data.totalEstimatedTime;
        const totalLoggedTime = res.data.totalLoggedTime;
        const remainingMinutes = totalEstimatedTime - totalLoggedTime;

        // check overdue or not
        const isOverdue = remainingMinutes < 0;

        // Check calculation
        const absoluteRemainingMinutes = Math.abs(remainingMinutes);
        const estimatedMinuts = !isOverdue ? remainingMinutes : absoluteRemainingMinutes;

        // Convert minutes to hours
        const estimatedHours = estimatedMinuts / 60;

        // find the total number of days for completion
        const calculateDays = calculateAverageDays(estimatedHours, 9);
        const workingDays = parseInt(Math.abs(calculateDays));

        // Find next final different date for completion
        const today = new Date();
        const completionDate = getCompletionDate(today, workingDays);

        // Update project details
        selectedProject.value = {
            ...selectedProject.value,
            totalEstimatedTime: convertedTimeString(totalEstimatedTime, 'update'),
            totalLoggedTime: convertedTimeString(totalLoggedTime, 'update'),
            lastLoggedDate: res.data.lastLoggedDate,
            remainingHours: !isOverdue ? convertedTimeString(remainingMinutes, 'update') : 0,
            overDueHours: isOverdue ? convertedTimeString(absoluteRemainingMinutes, 'update') : null,
            estimatedWorkingDays: workingDays,
            differenceDate: completionDate.toDateString()
        }
    } catch (error) {
        console.error(`Error in get time forecasting data => ${error}`);
    } finally {
        isLoading.value = false;
    }
};

const fetchChartData = async () => {
    isSkelatonLoading.value = true;

    const getParams = () => {
        const base = { pid: selectedProject.value._id };
        switch (selectedType.value) {
            case 'monthly':
                return { ...base, year: currentYear, monthNumber: selectedDataObject.value + 1 };
            case 'yearly':
                return { ...base, year: selectedDataObject.value };
            case 'quarterly':
                return { ...base, year: currentYear, quarterNumber: selectedDataObject.value };
            default:
                return base;
        }
    };

    const deDuplicateByValue = (items) => {
        const seen = new Set();
        return items.map(item => {
            const isVisible = !seen.has(item.value);
            seen.add(item.value);
            return { ...item, visible: isVisible };
        });
    };

    try {
        const params = getParams();
        const response = await apiRequest("post", `${API_TIME_FORCASTING_REPORT}/chart-data/${selectedType.value}`, params);
        const data = response.data.data;

        chartDataSeries.value[0].data = deDuplicateByValue(data.estimatedData);
        chartDataSeries.value[1].data = deDuplicateByValue(data.loggedData);

        xAxisCategories.value = buildxAxisDataSeries(data.loggedData)
    } catch (error) {
        console.error("Error in fetchChartData hook", error);
    } finally {
        isSkelatonLoading.value = false;
    }
}

const projectSelectionEvent = (item) => {
    selectedProject.value = item;
    searchQuery.value = '';
    init();
    fetchChartData();
}

const updateChartType = () => {
    switch (selectedType.value) {
        case 'monthly':
            selectedDataObject.value = currentMonth;
            dataArray.value = months;
            break;
        case 'yearly':
            selectedDataObject.value = currentYear;
            dataArray.value = years;
            break;
        case 'quarterly':
            selectedDataObject.value = 1;
            dataArray.value = quarters;
            break;
    }

    updateChartData();
};

const updateChartData = () => fetchChartData();

</script>

<style src="./Style.css" />