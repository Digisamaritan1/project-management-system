<template>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    <div class="plantab_wrapper" v-else>
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="setting-content-wrapper">
            <h4>Wasabi</h4>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSE" class="control-label">Wasabi Secret Access Key<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSE" placeholder="Wasabi Secret Access Key" :modelValue="wasabiSecretAccessKey" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSEP" class="control-label">Wasab Access Key<span>*</span></label>
                            <InputText type="text" class="form-control bg-light-gray" id="inputEmailSEP" placeholder="Wasab Access Key" :modelValue="wasabiAccessKey" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSH" class="control-label">Wasabi User ID<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSH" placeholder="Wasabi User ID" :modelValue="wasabiUserId" :isReadonly="true"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from "vue-toast-notification";
import * as env from '@/config/env';
import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue"
import { apiRequestWithoutCompnay } from "../../../services";

// COMPONENTS
import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
import InputText from '@/components/atom/InputText/InputText.vue';

const breadCrumbArray = [
    {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
    {name: 'Settings', routeObj: {name: ''}, isClickable: false},
    {name: 'Wasabi Settings', routeObj: {name: 'Wasabi Settings'}, isClickable: false},
]

// eslint-disable-next-line
const isSpinner = ref(true);
const wasabiSecretAccessKey = ref("");
const wasabiAccessKey = ref("");
const wasabiUserId = ref("");
const $toast = useToast();
function getEnvData() {
    const formData = {};
    apiRequestWithoutCompnay("get", env.GET_ENV, formData).then((response)=> {
        if(response.data.status === true) {
            wasabiSecretAccessKey.value = response?.data?.data?.WASABI_SECRET_ACCESS_KEY || ""; 
            wasabiAccessKey.value = response?.data?.data?.WASABI_ACCESS_KEY || "";
            wasabiUserId.value = response?.data?.data?.WASABI_USERID || "";
            isSpinner.value = false;
        } else {
            isSpinner.value = false;
            $toast.error("Wasabi Setting Error. Please reload a page.", {position: 'top-right'});
        }
    }).catch((err)=>{
        console.error(err,"error in get data");
        $toast.error("Wasabi Setting Error. Please reload a page.", {position: 'top-right'});
        isSpinner.value = false;
    });
}

onMounted(() => {
    isSpinner.value = true;
    getEnvData();
})
</script>
<style scoped src="./style.css">
</style>