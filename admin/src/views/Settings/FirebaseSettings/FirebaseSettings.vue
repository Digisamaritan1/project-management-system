<template>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    <div class="plantab_wrapper" v-else>
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="setting-content-wrapper">
            <h4>Firebase</h4>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSE" class="control-label">API Key<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSE" placeholder="API Key" :modelValue="apiKey" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSEP" class="control-label">Auto Domain<span>*</span></label>
                            <InputText type="text" class="form-control bg-light-gray" id="inputEmailSEP" placeholder="Auto Domain" :modelValue="autoDomain" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSH" class="control-label">Project ID<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSH" placeholder="Project ID" :modelValue="projectId" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSP" class="control-label">Storage Bucket<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSP" placeholder="Storage Bucket" :modelValue="storageBucket" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailTE" class="control-label">Messageing Senderld<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailTE" placeholder="Messageing Senderld" :modelValue="messagingSenderId" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailTE" class="control-label">App ID<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailTE" placeholder="App ID" :modelValue="appId" :isReadonly="true"/>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailTE" class="control-label">Measurementld<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailTE" placeholder="Measurementld" :modelValue="measurementId" :isReadonly="true"/>
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
    {name: 'Firebase Settings', routeObj: {name: 'Firebase Settings'}, isClickable: false},
]

// eslint-disable-next-line
const isSpinner = ref(true);
const apiKey = ref("");
const autoDomain = ref("");
const projectId = ref("");
const storageBucket = ref("");
const messagingSenderId = ref("");
const appId = ref("");
const measurementId = ref("");
const $toast = useToast();
function getEnvData() {
    const formData = {};
    apiRequestWithoutCompnay("get", env.GET_ENV, formData).then((response)=> {
        if(response.data.status === true) {
            apiKey.value = response?.data?.data?.APIKEY || ""; 
            autoDomain.value = response?.data?.data?.AUTODOMAIN || "";
            projectId.value = response?.data?.data?.PROJECTID || "";
            storageBucket.value = response?.data?.data?.STORAGEBUCKET || "";
            messagingSenderId.value = response?.data?.data?.MESSAGINGSENDERID || "";
            appId.value = response?.data?.data?.APPID || "";
            measurementId.value = response?.data?.data?.MEASUREMENTID || "";
            isSpinner.value = false;
        } else {
            isSpinner.value = false;
            $toast.error("Firebase Setting Error. Please reload a page.", {position: 'top-right'});
        }
    }).catch((err)=>{
        console.error(err,"error in get data");
        $toast.error("Firebase Setting Error. Please reload a page.", {position: 'top-right'});
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