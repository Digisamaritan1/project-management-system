<template>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    <div class="plantab_wrapper" v-else>
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="setting-content-wrapper">
            <h4>Chargebee</h4>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSE" class="control-label">Chargebee Site<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSE" placeholder="Chargebee Site" :modelValue="chargebeeSite" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSEP" class="control-label">Chargebee API key<span>*</span></label>
                            <InputText type="text" class="form-control bg-light-gray" id="inputEmailSEP" placeholder="Chargebee API key" :modelValue="chargebeeAPIkey" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSH" class="control-label">Chargebee Publish Key<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSH" placeholder="Chargebee Publish Key" :modelValue="chargebeePublishKey" :isReadonly="true"/>
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
    {name: 'Chargebee Settings', routeObj: {name: 'Chargebee Settings'}, isClickable: false},
]

// eslint-disable-next-line
const isSpinner = ref(true);
const chargebeeSite = ref("");
const chargebeeAPIkey = ref("");
const chargebeePublishKey = ref("");
const $toast = useToast();
function getEnvData() {
    const formData = {};
    apiRequestWithoutCompnay("get", env.GET_ENV, formData).then((response)=> {
        if(response.data.status === true) {
            chargebeeSite.value = response?.data?.data?.CHARGEBEE_SITE || ""; 
            chargebeeAPIkey.value = response?.data?.data?.CHARGEBEE_API_KEY || "";
            chargebeePublishKey.value = response?.data?.data?.CHARGEBEE_PUBLISH_KEY || "";
            isSpinner.value = false;
        } else {
            isSpinner.value = false;
            $toast.error("Chargebee Setting Error. Please reload a page.", {position: 'top-right'});
        }
    }).catch((err)=>{
        console.error(err,"error in get data");
        $toast.error("Chargebee Setting Error. Please reload a page.", {position: 'top-right'});
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