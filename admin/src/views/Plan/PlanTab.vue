<template>
    <SpinnerComp :is-spinner="isSpinner" />
    <div class="plantab_wrapper bg-light-gray" :style="{'opacity': isSpinner ? '0.5' : '1'}">
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
            <button class="btn font-roboto-sans bg-blue white cursor-pointer plantab_addMore" @click="()=> isAddNew = true">+ Add New Plan</button>
        </div>
        <div class="plantab_tab_wrapper">
            <span @click="()=> activeTab = 1" class="mr-20px cursor-pointer" :class="{'tab_blue': activeTab === 1}">Active Plans</span>
            <span @click="()=> activeTab = 2" class="cursor-pointer" :class="{'tab_blue': activeTab === 2}">Inactive Plans</span>
        </div>
        <div v-if="currentPlanShow.length">
            <draggable
                :list="currentPlanShow"
                class="plantab_plan_wrapper style-scroll-2-px"
                group="plans"
                @change="changeSortIndex($event)"
                item-key="id"
                handle=".handle"
                :sort="true"
                :disabled="activeTab == 2"
            >
                <template #item="{ element }">
                    <div class="plan_item_wrapper">
                        <div class="mt-30px plantab_tab_wrapper cursor-pointer handle" v-if="activeTab == 1"><img src="@/assets/images/DragAndDropIcon.png"/></div>
                        <div class="pl-20px pr-20px pt-30px pb-20px bg-white plan_item">
                            <div :style="{'opacity': element.status!==1 ? '0.2' : '1'}" class="plan_item--name">{{element.planDetails.name}}</div>
                            <div :style="{'opacity': element.status!==1 ? '0.2' : '1'}" class="plan_item--discription">{{getDisplay('planDescription',element.planName)}}</div>
                            <div :style="{'opacity': element.status!==1 ? '0.2' : '1'}" class="plan_item--hr_line"></div>
                            <div v-if="!element.isContactSupport">
                                <div :style="{'opacity': element.status!==1 ? '0.2' : '1'}"><span class="font-size-24">$</span><span class="plan_item--monthly_price">{{getPriceDisplay(element,'month')}}</span><span class="font-size-14">/Month Price</span></div>
                                <div :style="{'opacity': element.status!==1 ? '0.2' : '1'}"><span class="font-size-24">$</span><span class="font-size-22">{{getPriceDisplay(element,'year')}}</span><span class="font-size-14">/Year Price</span></div>
                            </div>
                            <div class="ptb-23" v-else>
                                <button class="btn font-roboto-sans bg-blue white cursor-pointer plantab_addMore"> <a class="white" :href="element.supportLink" target="_blank"> Contact Sales </a></button>
                            </div>
                            <div class="plan_item--hr_line" :style="{'opacity': element.status!==1 ? '0.2' : '1'}"></div>
                            <div :style="{'opacity': element.status!==1 ? '0.2' : '1'}" v-html="getDisplay('planFeature',element.planName)" class="plan__feature font-size-16 style-scroll-2-px"></div>
                            <div :style="{'opacity': element.status!==1 ? '0.2' : '1'}" class="plan_item--hr_line"></div>
                            <div v-if="element.status===1">
                                <button v-if="element.planName !== 'foreverFree'" class="btn-secondary plan_item--button mr-20px font-size-16px" @click="deactivate(element)" :disabled="isSpinner || element.defaultSubscribe">Inactive</button>
                                <button class="btn-primary plan_item--button" @click="editCall(element)" :disabled="isSpinner">Edit</button>
                            </div>
                            <div v-else>
                                <button class="btn-success plan_item--button mr-20px font-size-16px" @click="activate(element)" :disabled="isSpinner">Active</button>
                            </div>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>
        <div class="plantab_tab_wrapper mt-30px" v-else>
            <div v-if="!getSpinner">
                No {{activeTab == 1 ? 'Active Plans' : 'Inactive Plans'}} 
            </div>
            <SpinnerComp :is-spinner="getSpinner" v-else />
        </div>
        <Sidebar 
            v-if="isAddNew"
            width="1545px"
            :top="'0px'"
            :headClass="'add_plan--header'"
        >
            <template #head-left>
                <div class="blue">
                    <span>{{isEdit ? 'Edit Plan' : 'Create New Plan'}}</span>
                </div>
            </template>
            <template #head-right>
                <div class="d-flex">
                    <button class="outline-primary plan_item--button mr-10px font-size-16px" @click="()=> closeFunction()" :disabled="isSpinnerSidebar">Close</button>
                    <button class="btn-primary plan_item--button font-size-16px" @click="saveClickFun()" :disabled="isSpinnerSidebar">Save</button>
                </div>
            </template>
            <template #body>
                <div class="bg-light-gray">
                    <CreateNewPlan :saveClickTrigger="saveClick" @closeSidebar="() => closeFunction()" :isEdit="isEdit" :editData="editData" @isSpinner="(val) => isSpinnerSidebar = val"/>
                </div>
            </template>
        </Sidebar>
    </div>
</template>
<script setup>
    import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
    import Sidebar from '@/components/molecules/Sidebar/Sidebar';
    import CreateNewPlan from '@/components/molecules/CreatePlan/CreateNewPlan';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp'
    import Swal from 'sweetalert2';
    import { computed, ref,nextTick, watch, onMounted } from 'vue';
    import { useStore } from 'vuex';
    import { apiRequest, apiRequestWithoutCompnay } from '@/services';
    import draggable from "vuedraggable";
    import * as env from '@/config/env';
    import { useToast } from 'vue-toast-notification';
    const { getters,commit,dispatch } = useStore();
    const currentPlanShow = ref([]);
    const activeTab = ref(1);
    const saveClick = ref(false);
    const isAddNew = ref(false);
    const isSpinner = ref(false);
    const getSpinner = ref(false);
    const isSpinnerSidebar = ref(false);
    const isEdit = ref(false);
    const editData = ref({});
    const $toast = useToast();
    const breadCrumbArray = [
        {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
        {name: 'Plan', routeObj: {name: 'Plan'}, isClickable: false},
    ]
    const chargeBeePriceData = computed(() => getters["planTab/chargeBeePrice"]);
    watch(() => getters["planTab/chargeBeePrice"], (newV)=>{
        if (activeTab.value == 1) {
            currentPlanShow.value = newV.filter((x) => x.status == 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
        } else {
            currentPlanShow.value = newV.filter((x) => x.status != 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
        }
    },{deep: true})
    watch(()=>activeTab.value, (newV)=>{
        if (newV == 1) {
            currentPlanShow.value = chargeBeePriceData.value.filter((x) => x.status == 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
        } else {
            currentPlanShow.value = chargeBeePriceData.value.filter((x) => x.status != 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
        }
    },{deep: true})
    onMounted(()=>{
        getSpinner.value = true;
        if(chargeBeePriceData.value && chargeBeePriceData.value.length > 0){
            getSpinner.value = false;
            if (activeTab.value == 1) {
                currentPlanShow.value = chargeBeePriceData.value.filter((x) => x.status == 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
            } else {
                currentPlanShow.value = chargeBeePriceData.value.filter((x) => x.status != 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
            }
        }else{
            dispatch('planTab/setChargeBeePrice').then((res) => {
                getSpinner.value = false;
                if (activeTab.value == 1) {
                    currentPlanShow.value = res.filter((x) => x.status == 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
                } else {
                    currentPlanShow.value = res.filter((x) => x.status != 1).sort((a,b)=> a.sortIndex > b.sortIndex ? 1 : -1);
                }
            }).catch(() => {
                getSpinner.value = false;
            })
        }
    })
    const planFeatureDisplay = computed(()=> {
        return getters["planTab/planFeatureDisplay"];
    })
    const planFeature= computed(()=> {
        return getters["planTab/planFeature"];
    })
    function getDisplay(value,planName) {
        let feature = planFeatureDisplay.value.find((x)=> x.planName == planName)
        if (feature) {
            return feature[value]
        } else {
            return '';
        }
    }

    function getPriceDisplay(data,period) {
        let priceData = data.itemPriceArray.find((x)=> x.period_unit == period)
        if (priceData) {
            if (period == 'month') {
                return Number((priceData.price / 100)).toFixed(2);
            } else {
                return Number(((priceData.price / 100))).toFixed(2);
            }
        }
    }

    function saveClickFun () {
        if (saveClick.value === true) {
            saveClick.value = false;
        }
        nextTick(() => {
            saveClick.value = true;
        });
    }

    function closeFunction() {
        saveClick.value = false;
        isAddNew.value = false;
        isEdit.value = false;
        editData.value = {};
    }

    function editCall(data) {
        isAddNew.value = true;
        isEdit.value = true;
        data.planFeature = planFeature.value.find((x)=> x.planName == data.planName) || {}
        data.planFeatureDisplay = planFeatureDisplay.value.find((x)=> x.planName == data.planName) || {}
        editData.value = data;
    }

    function deactivate(data) {
    Swal.fire({
        title: 'Are you sure you want to inactive plan?',
        text: `You can deactivate this plan to prevent future usage. This will not affect existing subscriptions or invoices linked to the plan. You can always active this plan later.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, inactive it!'
    }).then((result)=>{
        if (result.isConfirmed) {
            isSpinner.value = true;
            apiRequestWithoutCompnay("post", env.PLANSTATUSCHANGE, {planId: data.planDetails.id,isActive: false}).then((resp)=>{
                $toast.success(`Plan Inactive successfully`,{position: 'top-right'});
                let chargbeePriceObj = {
                    planName: resp.data.planName,
                    status: 2,
                    key: 'status',
                }
                commit('planTab/setChargeBeePriceAction', chargbeePriceObj);
                isSpinner.value = false;
            }).catch((error)=>{
                isSpinner.value = false;
                console.error(error);
            })
        }
    }).catch((error)=>{
        console.error(error);
        isSpinner.value = false;
    });
    }


    function activate(data) {
        Swal.fire({
            title: 'Are you sure you want to active plan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, active it!'
        }).then((result)=>{
            if (result.isConfirmed) {
                isSpinner.value = true;
                apiRequestWithoutCompnay("post", env.PLANSTATUSCHANGE, {planId: data.planDetails.id,isActive: true}).then((resp)=>{
                    $toast.success(`Plan active successfully`,{position: 'top-right'});
                    let chargbeePriceObj = {
                        planName: resp.data.planName,
                        status: 1,
                        sortIndex: resp.data.sortIndex,
                        key: 'both',
                    }
                    commit('planTab/setChargeBeePriceAction', chargbeePriceObj);
                    isSpinner.value = false;
                }).catch((error)=>{
                    isSpinner.value = false;
                    console.error(error);
                })
            }
        }).catch((error)=>{
            console.error(error);
            isSpinner.value = false;
        });
    }

    function changeSortIndex($event) {
        let index = $event.moved.newIndex;
        let element = $event.moved.element;
        let tempIndex;
        if (index === 0 && currentPlanShow.value.length === 1) {
            tempIndex = 0
        }
        else if ((index+1) === currentPlanShow.value.length) {
            tempIndex = currentPlanShow.value[currentPlanShow.value.length - 2]['sortIndex'] + 65536
        } else {
            if (index === 0) {
                tempIndex = currentPlanShow.value[1]['sortIndex'] - 65536
            } else {
                tempIndex = (currentPlanShow.value[index - 1]['sortIndex'] + currentPlanShow.value[index + 1]['sortIndex']) / 2
            }
        }
        let query = [
            {
                objId:{
                    _id: element._id,
                }
            },
            {
            sortIndex: tempIndex,
            },
        ];
        apiRequest("put", `${env.SUBSCRIPTIONPLAN}`, { query: query })
          .then(()=>{
            let chargbeePriceObj = {
                planName: element.planName,
                sortIndex: tempIndex,
                key: 'sortIndex',
            }
            commit('planTab/setChargeBeePriceAction', chargbeePriceObj);
        }).catch((error)=>{
            console.error(error);
        })
    }
</script>
<style scoped src="./style.css">
</style>
<style>
 .plan__feature li {
    padding-left: 30px;
    position: relative;
    line-height: 30px;
    list-style-type: none !important;
  }

  .plan__feature li:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 20px;
    height: 20px; 
    background: url('../../assets/images/svg/Vector.svg') no-repeat; 
    background-size: contain;
  }
  .add_plan--header{
        height: 61px;
   }
</style>