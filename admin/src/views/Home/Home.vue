<template>
    <!-- <h1 class="text-center">Wel Come to Alianhub</h1> -->
    <div class="dashboard_content-wrapper">
        <div class="dashboard-content">
            <div class="row">
                <div class="col-md-2">
                    <div class="today-color-box" style="background-color: rgba(255, 239, 221, 1);">
                        <p>Today’s Subscription</p>
                        <h5 style="color:rgba(199, 109, 7, 1);">{{todaySubscriptions > 0 ? todaySubscriptions: "0"+todaySubscriptions}}</h5>
                        <img src="@/assets/images/png/colorbox1.png"/>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="today-color-box" style="background-color: rgba(215, 255, 233, 1);">
                        <p>Today’s Income</p>
                        <h5 style="color:rgba(55, 164, 104, 1);">${{todayIncome > 0 ? todayIncome: "0"+todayIncome}}</h5>
                        <img src="@/assets/images/png/colorbox2.png"/>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="today-color-box" style="background-color: rgba(221, 243, 255, 1);">
                        <p>Total Users</p>
                        <h5 style="color:rgba(25, 116, 165, 1);">{{companyCount > 9 ? companyCount: "0"+ companyCount}}</h5>
                        <img src="@/assets/images/png/colorbox3.png"/>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="today-color-box" style="background-color: rgba(240, 228, 255, 1);">
                        <p>Total Active Users</p>
                        <h5 style="color:rgba(142, 81, 218, 1);">{{activeUsers > 9 ? activeUsers: "0"+ activeUsers}}</h5>
                        <img src="@/assets/images/png/colorbox4.png"/>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="today-color-box" style="background-color: rgba(255, 246, 215, 1);">
                        <p>Total Inactive Users</p>
                        <h5 style="color:rgba(158, 126, 12, 1);">{{inactiveUsers > 9 ? inactiveUsers: "0"+ inactiveUsers}}</h5>
                        <img src="@/assets/images/png/colorbox5.png"/>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="today-color-box" style="background-color: rgba(255, 236, 236, 1);">
                        <p>Active Plans</p>
                        <h5 style="color:rgba(167, 70, 70, 1);">{{ activePlanCount > 9 ? activePlanCount: "0"+ activePlanCount}}</h5>
                        <img src="@/assets/images/png/colorbox6.png"/>
                    </div>
                </div>
            </div>
        </div>
        <div class="newResgistration">
          
            <div class="row">
                <div class="col-md-5">
                    <div class="newResgistration-content white-box-main">
                        <div class="newResgistration-header">
                            <h4>New Registered Companies</h4>
                            <a class="cursor-pointer" @click="$router.push({name: 'Company'})">View All</a>
                        </div>
                        <div class="newResgistration-body common_scroll position-relative" v-if="isCompanyListSpinner">
                            <SpinnerComp :is-spinner="isCompanyListSpinner"/>
                        </div>
                        <div class="newResgistration-body common_scroll" v-if="!isCompanyListSpinner && !newRegisteredCompanies.length">
                            <h1 class="contain-center">No Data Found</h1>
                        </div>
                        <div class="newResgistration-body common_scroll" v-if="!isCompanyListSpinner && newRegisteredCompanies.length">
                            <!-- {{newRegisteredCompanies}} -->
                            <div class="company_list" v-for="(companiesRow, companiesIndex) in newRegisteredCompanies" v-bind:key="companiesIndex">
                                <div class="img_with-company" >
                                    <WasabiIamgeCompp v-if="companiesRow?.Cst_profileImage" :companyId="companiesRow?._id" :data="{url:companiesRow?.Cst_profileImage}" class="profile-image-detail"/>
                                    <span v-else-if="!companiesRow?.Cst_profileImage" class="companyProfileImage">{{companiesRow?.Cst_CompanyName?.charAt(0)}}</span>
                                    <span>{{companiesRow.Cst_CompanyName}}</span>
                                </div>
                                <div class="newResgistrationDate">{{moment(companiesRow.createdAt).format('DD MMM YYYY')}}</div>
                                <div class="newResgistrationDateproject_name">{{companiesRow.user_data && companiesRow.user_data.length ? companiesRow.user_data[0].Employee_Name : ""}}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-7">
                    <div class="newResgistration-content white-box-main">
                        <div class="graphHeader">
                            <span>Earnings</span>
                            <SelectComp
                                :isDisplayImage="false"
                                name="graphHeader"
                                displayKey="label"
                                v-model="selectedEarningYear"
                                :options="yearsData"
                                :enableSearch="yearsData.length > 10"
                                :disabled="false"
                                class="custom-select-component"
                                @change="earningChange()"
                            />
                        </div>
                        <div class="contain-center position-relative height-292" v-if="isEarningSpinner">
                            <SpinnerComp :is-spinner="isEarningSpinner"/>
                        </div>
                        <div class="contain-center position-relative height-292" v-if="!isEarningSpinner && !earningData.length">
                            <h1 class="contain-center">No Data Found</h1>
                        </div>
                        <div class="graphBorader" v-if="!isEarningSpinner && earningData.length">
                            <!-- <img src="@/assets/images/png/graph1.png"/> -->
                            <div id="chart">
                                <apexchart type="bar" height="275" :options="earningsChartData.chartOptions" :series="earningsChartData.series"></apexchart>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="newResgistration newResgistration-second-row">
          
            <div class="row">
                <div class="col-md-4">
                    <div class="graphRound white-box-main">
                        <div class="white-box-main-header">
                            <h4>All Plans</h4>
                        </div>
                        <div class="white-box-main-body">
                            <!-- <img src="@/assets/images/png/graphRound.png"/> -->
                            <div class="contain-center position-relative" v-if="isAllPlansSpinner">
                                <SpinnerComp :is-spinner="isAllPlansSpinner"/>
                            </div>
                            <div v-if="!isAllPlansSpinner && !allPlansData.length">
                                <h1 class="contain-center">No Data Found</h1>
                            </div>
                            <div v-if="!isAllPlansSpinner && allPlansData.length">
                                <div class="chart-wrap">
                                    <div id="chart">
                                        <apexchart type="donut" width="340" :options="planChartData.chartOptions" :series="planChartData.series"></apexchart>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="newResgistration-content white-box-main">
                        <div class="graphHeader">
                            <span>Subscriptions</span>
                            <SelectComp
                                :isDisplayImage="false"
                                name="graphHeader1"
                                displayKey="label"
                                v-model="selectedSubscriptionsYear"
                                :options="yearsData"
                                :enableSearch="yearsData.length > 10"
                                :disabled="false"
                                class="custom-select-component"
                                @change="subscriptionsChange()"
                            />
                        </div>
                        <div class="contain-center position-relative height-292" v-if="isSubscriptionsSpinner">
                            <SpinnerComp :is-spinner="isSubscriptionsSpinner"/>
                        </div>
                        <div class="contain-center position-relative height-292" v-if="!isSubscriptionsSpinner && !subscriptionsData.length">
                            <h1 class="contain-center">No Data Found</h1>
                        </div>
                        <div class="graphBorader" v-if="!isSubscriptionsSpinner && subscriptionsData.length">
                            <div class="chart-wrap">
                                <div id="chart">
                                    <apexchart type="line" height="275" :options="subscriptionChartData.chartOptions" :series="subscriptionChartData.series"></apexchart>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { defineComponent, onMounted, ref } from "vue";
import moment from 'moment';
import { useToast } from "vue-toast-notification";
import { paymentHelper } from '../../utils/paymentHelper/helper';
const {getTodaysPaymentIncome,getEarningPaymentData,getSubscriptionCountHome,manageAllPlansHome} = paymentHelper();
// import {ApexCharts} from 'apexcharts';
import WasabiIamgeCompp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue"
import { dbCollections } from "@/utils/collections";
import SelectComp from "@/components/molecules/Select/Select.vue";
import { apiRequest } from "@/services";
import * as env from '@/config/env';


defineComponent({
    name: "HomeView",
    components:[
    ]
})

const $toast = useToast();
// const $toast = useToast();
const currentYear = new Date().getFullYear();
const selectedEarningYear = ref({ label: currentYear, value: currentYear });
const selectedSubscriptionsYear = ref({ label: currentYear, value: currentYear });
const isCompanyListSpinner = ref(true);
const newRegisteredCompanies = ref([]);
const companyCount = ref(0);
const todaySubscriptions = ref(0);
const todayIncome = ref(0);
const activeUsers = ref(0);
const inactiveUsers = ref(0);
const activePlanCount = ref(0);
const earningsChartData = ref({
    series: [{
        name: 'Total',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }],
    chartOptions: {
        chart: {
            type: 'bar',
            height: 275,
            toolbar: {
                show: false
            }
        },
        colors:['#F241CD'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                borderRadiusApplication: "end",
                horizontal: false,
            }
        },
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            labels: {
                style: {
                    fontWeight: 700,
                },
            }
        },
        yaxis: {
            labels: {
                formatter: function (value) {
                    return "$" + value;
                }
            }
        },
        dataLabels: {
            enabled: false
        }
    }
})
const planChartData = ref({
    series: [],
    chartOptions: {
        labels: [],
        chart: {
            width: 340,
            type: 'donut',
        },
        dataLabels: {
            enabled: false
        },
        responsive: [{
            breakpoint: 480,
            options: {
            chart: {
                width: 200
            },
            legend: {
                show: true
            }
            }
        }],
        legend: {
            position: 'bottom',
            offsetY: 0,
            height: 20,
            width: 340
        },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            showAlways: true,
                            show: true
                        }
                    }
                }
            }
        }
    },
});
const subscriptionChartData = ref({
    series: [{
        name: "Selected Year Subscriptions",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: "#314CFF"
    }, {
        name: "Previous Year Subscriptions",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: "#F241CD"
    }],
    chartOptions: {
        chart: {
              height: 350,
              type: 'line',
              toolbar: {
                show: false
              }
            },
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'straight'
            },
            grid: {
            },
            xaxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            },
            yaxis: {
                labels: {
                    formatter: function (value) {
                        return Math.round(value); // Round the value to the nearest integer
                    }
                }
            }
    }
})
const allPlansData = ref([]);
const isAllPlansSpinner = ref(true);
const isEarningSpinner = ref(true);
const earningData = ref([]);
const isSubscriptionsSpinner = ref(true);
const subscriptionsData = ref([]);
const yearsData = ref([]);

function getTodaySubscriptionsCount() {
    let query = [{
        $match: {
            createdAt: {
                dbDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lte: new Date(new Date().setHours(23, 59, 59))
                }
            }
        }
    }, {
        $count: "count"
    }];

    apiRequest('post',env.SUBSCRIPTIONS,{findQuery:query}).then((response) => {
        if(response.status === 200 && response.data.length > 0) {
            todaySubscriptions.value = response.data?.[0]?.count || 0;
        } else {
            todaySubscriptions.value = 0;
        }
    }).catch((error) => {
        todaySubscriptions.value = 0
        console.error(error,"error in Get Today Subscriptions Count");
        $toast.error("Get Today Subscriptions Count. Please reload a page.", {position: 'top-right'});
    });
}
function getTodayIncome() {
    getTodaysPaymentIncome().then((response)=>{
        todayIncome.value = response.todayIncome;
    }).catch((error)=>{
        console.error(error);
    })
}
function getActiveAndInactiveUserCount() {
    let query = [{
        $group: {
            _id: "$isDisable",
            count: {
                $sum: 1
            }
        }
    }];

    apiRequest("post",`${env.COMPANYACTION}/find`,{findQuery: query})
    .then((resp) => {
        if(resp.status === 200) {
            const response = resp.data;
            if(response.length > 0) {
                for (let index = 0; index < response.length; index++) {
                    const element = response[index];
                    if (element._id === true) {
                        inactiveUsers.value += element.count;
                    } else {
                        activeUsers.value += element.count;
                    }
                }
            } else {
                activeUsers.value = 0;
                inactiveUsers.value = 0;
            }
        }
    }).catch((error) => {
        activeUsers.value = 0;
        inactiveUsers.value = 0;
        console.error(error,"error in Get Active and Inactive Users Count");
        $toast.error("Get Active and Inactive Users Count. Please reload a page.", {position: 'top-right'});
    });
}

function getLatestCompany() {
    isCompanyListSpinner.value = true;
    let query = [
        {
            $sort: {
                createdAt: -1,
            }
        }, 
        {
            $limit: 5
        }, 
        {
        $addFields: {
            userIdObj: {
                $toObjectId: "$userId",
            }
        }
    }, {
        $lookup: {
            from: dbCollections.USERS,
            localField: "userIdObj",
            foreignField: "_id",
            as: "user_data"
        }
    }];

    apiRequest("post",`${env.COMPANYACTION}/find`,{findQuery: query})
    .then((resp) => {
        if(resp.status === 200) {
            const response = resp.data;
            if(response.length > 0){
                newRegisteredCompanies.value = response;
                isCompanyListSpinner.value = false;
            } else {
                newRegisteredCompanies.value = [];
                isCompanyListSpinner.value = false;
            }
        }
    }).catch((error) => {
        newRegisteredCompanies.value = [];
        console.error(error,"error in get data");
        $toast.error("Chargebee Setting Error. Please reload a page.", {position: 'top-right'});
        isCompanyListSpinner.value = false;
    });
}
function getCompanyCount() {
    let query = [{
        $count: "count"
    }];
    apiRequest("post",`${env.COMPANYACTION}/find`,{findQuery: query})
    .then((resp) => {
        if(resp.status === 200) {
            const response = resp.data;
            if(response.length > 0) {
                companyCount.value = response[0].count;
            } else {
                companyCount.value = 0;
            }
        }
    }).catch((error) => {
        companyCount.value = 0
        console.error(error,"error in Get Company Count");
        $toast.error("Get Company Count. Please reload a page.", {position: 'top-right'});
    });
}
function getActivePlanCount() {
  let query = [
    {
      $match: {
        status: 1,
      },
    },
    {
      $count: "count",
    },
  ];
  try {
    apiRequest("post", `${env.SUBSCRIPTIONPLAN}/find`, { query: query })
      .then((response) => {
        if (response.data.length > 0) {
          activePlanCount.value = response.data[0].count;
        } else {
          activePlanCount.value = 0;
        }
      })
      .catch((error) => {
        activePlanCount.value = 0;
        console.error(error, "error in Get Active Plan Count");
        $toast.error("Get Active Plan Count. Please reload a page.", {
          position: "top-right",
        });
      });
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}
function manageAllPlans() {
    isAllPlansSpinner.value = true;
        manageAllPlansHome().then((res) => {
            if (res.isResponseLength) {
                let planRes = res.data
                if (planRes.length > 0) {
                    planChartData.value.series = planRes.map((x) => x.myCount);
                    planChartData.value.chartOptions.labels = planRes.map((x) => x.result[0]?.planDetails?.name || "Plan")
                    allPlansData.value = planRes;
                    isAllPlansSpinner.value = false;
                } else {
                    console.error("error in Get All Plan Data");
                    // $toast.error("Get All Plan Data. Please reload a page.", {position: 'top-right'});
                    allPlansData.value = [];
                    isAllPlansSpinner.value = false;
                }
            } else {
                isAllPlansSpinner.value = false;
                allPlansData.value = [];
            }
        }).catch((error) => {
            console.error(error,"error in Get All Plan Data");
            $toast.error("Get All Plan Data. Please reload a page.", {position: 'top-right'});
            allPlansData.value = [];
            isAllPlansSpinner.value = false;
        });
    }

function earningChange () {
    getEarningData(Number(selectedEarningYear.value.value));
}

function subscriptionsChange () {
    getSubscriptionsCount(Number(selectedSubscriptionsYear.value.value));
}

function manageMonth (data, year) {
    const finalData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (!year) {
        data.map((x) => {
            const index = month.indexOf(x.month);
            if (index !== -1) {
                finalData[index] = x.totalAmount / 100;
            }
        });
        return finalData;
    }
    if (year) {
        const yearData = data.filter((x) => x._id.year === year);
        yearData.map((x) => {
            const index = month.indexOf(x._id.month);
            if (index !== -1) {
                finalData[index] = x.count;
            }
        });
        return finalData;
    }
}

function getEarningData(year) {
    isEarningSpinner.value = true;
    if (!year) {
        year = Number(selectedEarningYear.value.value);
    }
    getEarningPaymentData(year).then((response)=>{
        if (response.length > 0) {
            earningsChartData.value.series[0].data = manageMonth(response);
            isEarningSpinner.value = false;
            earningData.value = response;
        } else {
            earningsChartData.value.series[0].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            isEarningSpinner.value = false;
            earningData.value = [];
        }
    }).catch((error)=>{
        isEarningSpinner.value = false;
        earningData.value = [];
        console.error(error,"error in Get Earning Data");
        $toast.error("Get Earning Data. Please reload a page.", {position: 'top-right'});
    })
}

function getSubscriptionsCount(year) {

    isSubscriptionsSpinner.value = true;
    getSubscriptionCountHome(year,selectedSubscriptionsYear.value).then((ele)=>{
        let response = ele.resp;
        let previousYear = ele.previousYear;
        year = ele.year;
        if (response.length > 0) {
            subscriptionChartData.value.series[0].data = manageMonth(response, year);
            subscriptionChartData.value.series[1].data = manageMonth(response, previousYear);
            isSubscriptionsSpinner.value = false;
            subscriptionsData.value = response;
        } else {
            subscriptionChartData.value.series[0].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            subscriptionChartData.value.series[1].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            isSubscriptionsSpinner.value = false;
            subscriptionsData.value = [];
        }
    }).catch((error) => {
        isSubscriptionsSpinner.value = false;
        subscriptionsData.value = [];
        console.error(error,"error in Get Subscriptions Data");
        $toast.error("Get Subscriptions Data. Please reload a page.", {position: 'top-right'});
    }); 
}

onMounted(() => {
    const currYear = new Date().getFullYear();
    for (let i = currYear-4; i <= currYear; i++) {
        yearsData.value.push({
            label: i.toString(), value: i.toString(),
        })
    }
    getTodaySubscriptionsCount();
    getTodayIncome();
    getActiveAndInactiveUserCount();
    getLatestCompany();
    getCompanyCount();
    getActivePlanCount();
    manageAllPlans();
    getEarningData();
    getSubscriptionsCount();
})
</script>
<style scoped src="./style.css">
</style>