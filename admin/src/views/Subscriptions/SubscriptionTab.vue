<template>
    <div class="subscriptions_tab_wrapper">
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="subscriptions_wrapper bg-white mt-30px">
            <div>
                <div class="d-flex align-items-center justify-content-between table_search">
                    <div class="form-group">
                        <input type="text" class="customfield__form-control" placeholder="Search" v-model="search" @input="onInput">
                    </div>
                </div>
                <template v-if="subscriptions && subscriptions.length">
                    <div class="subscriptionTable-wrapper"> 
                        <table>
                            <thead class="position-sti">
                                <tr>
                                    <th v-for="(header, index) in headers" :key="index">{{ header.name }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in subscriptions" :key="index">
                                    <td class="cursor-pointer" @click="$router.push({name: 'SubscriptionDetail', params: {id: item.subscriptionId}})">{{item.subscriptionId}}</td>
                                    <td>{{item.createdAt}}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <span class="no-img-span d-flex align-items-center">{{item.compnayName?.charAt(0)}}</span>
                                            <span>{{item.compnayName}}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <span class="no-img-span d-flex align-items-center">{{item.userName?.charAt(0)}}</span>
                                            <span>{{item.userName}}</span>
                                        </div>
                                    </td>
                                    <td class="text-capitalize">{{item.planName}}</td>
                                    <td>{{item.price}}</td>
                                    <td>
                                        <div class="billing__status d-inline-flex font-size-13 text-center align-items-center border-radius-4-px font-weight-400 p5px-p10px cursor-pointer text-capitalize" :style="{'background': getColor(item.status,'background'), 'color': getColor(item.status,'color')}">{{item.status}}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="pagination-div">
                        <div class="pagination-left-arrow">
                            <img v-if="currentPage !== 1" @click="previousPage()" :src="right_arrow" :disabled="currentPage === 1" />
                            <img v-else :src="right_arrow_disable" />
                        </div>
                        <span v-for="page in visiblePages" :key="page" class="d-flex align-items-center">
                            <button @click="goToPage(page)" class="cursor-pointer" :class="{ 'pagination-active-page': page === currentPage ,'pagination-page' : page !== currentPage}">{{ page }}</button>
                        </span>
                        <div class="pagination-right-arrow">
                            <img v-if="currentPage !== totalPages" @click="nextPage()" :disabled="currentPage === totalPages" :src="left_arrow"/>
                            <img v-else :disabled="currentPage === totalPages" :src="left_arrow_disable"/>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="d-flex justify-content-center align-items-center flex-column no-data-found" v-if="!getSpinner">
                        <img :src="nodataFoundIcon" />
                        <h3>No Data Found</h3>
                    </div>
                    <div v-else>
                        <SpinnerComp :is-spinner="getSpinner" v-if="getSpinner"/>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
<script setup>
    import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
    import { computed, ref, onMounted } from 'vue';
    // import { dbCollections } from "@/utils/collections";
    // import * as mongoQuery from "@/utils/MongoQueries/crudOperations/crudOperations";
    // import moment from 'moment'
    import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue"
    import { paymentHelper } from '../../utils/paymentHelper/helper';
    const {subscriptionTabFetchSubscriptionData} = paymentHelper();

    // import { download } from "@/utils/StorageOprations/download";
    // import * as env from '@/config/env';
    // import { apiRequestWithoutCompnay } from '../../services';
    const timer = ref(null);
    const breadCrumbArray = [
        {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
        {name: 'Subscription', routeObj: {name: 'Subscription'}, isClickable: false},
    ]
    const headers = ref([
        {name:'Subscription ID'},
        {name:'Date & Time'},
        {name:'Company Name'},
        {name:'Owner Name'},
        {name:'Plan'},
        {name:'Price'},
        {name:'Status'}
    ])
    const left_arrow = require('@/assets/images/svg/left_arrow.svg');
    const right_arrow_disable = require('@/assets/images/svg/right_arrow_disable.svg');
    const right_arrow = require('@/assets/images/svg/right_arrow.svg');
    const left_arrow_disable = require('@/assets/images/svg/left_arrow_disable.svg');
    const nodataFoundIcon = require("@/assets/images/svg/No-Search-Result.svg");
    const subscriptions = ref([]);
    const search = ref('');
    const batchSize = ref(10);
    const currentPage = ref(1);
    const totalPages = ref(0);
    const maxVisiblePages = ref(5)
    const getSpinner = ref(false)

    onMounted(() => {
        getSpinner.value = true;
        fetchSubscriptionData();
    })

    const visiblePages = computed(() => {
        const startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages.value / 2));
        const endPage = Math.min(startPage + maxVisiblePages.value - 1, totalPages.value);
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    })

    function fetchSubscriptionData () {
        subscriptionTabFetchSubscriptionData(currentPage,batchSize,search).then((response)=>{
            subscriptions.value = response.subscriptions;
            totalPages.value = response.totalPages;
            getSpinner.value = false;
        }).catch((error)=>{
            console.error(error);
            getSpinner.value = false;
        })
    }

    function getColor(status,type) {
        if (status.toLowerCase() == 'active') {
            if (type == 'background') {
                return '#D4F4E2'
            } else {
                return '#28C76F'
            }
        } else if (status.toLowerCase() == 'inactive') {
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

    function previousPage(){
        if (currentPage.value > 1) {
            currentPage.value--;
            fetchSubscriptionData();
        }
    }

    function nextPage() {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
            fetchSubscriptionData();
        }
    }

    function debouncer(timeout = 1000) {
        return new Promise((resolve) => {
            if(timer.value) {
                clearTimeout(timer.value);
            }
            timer.value = setTimeout(() => {
                resolve();
            }, timeout);
        })
    }

    function goToPage(page) {
        currentPage.value = page;
        fetchSubscriptionData();
    }

    const onInput = () => {
        debouncer().then(()=>{
            fetchSubscriptionData();
        })
    }
</script>
<style src="./style.css">
</style>