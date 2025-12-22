<template>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    <div class="plantab_wrapper" v-else>
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="setting-content-wrapper">
            <h4>MongoDb</h4>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSE" class="control-label">MongoDb URL<span>*</span></label>
                        <InputText type="text" class="form-control bg-light-gray" id="inputEmailSE" placeholder="MongoDb URL" :modelValue="mongoDbUrl" :isReadonly="true"/>
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
    {name: 'MongoDb Settings', routeObj: {name: 'MongoDb Settings'}, isClickable: false},
]

// eslint-disable-next-line
const isSpinner = ref(true);
const mongoDbUrl = ref("");
const $toast = useToast();
function getEnvData() {
    const formData = {};
    apiRequestWithoutCompnay("get", env.GET_ENV, formData).then((response)=> {
        if(response.data.status === true) {
            mongoDbUrl.value = response?.data?.data?.MONGODB_URL || ""; 
            isSpinner.value = false;
        } else {
            isSpinner.value = false;
            $toast.error("MongoDb Setting Error. Please reload a page.", {position: 'top-right'});
        }
    }).catch((err)=>{
        console.error(err,"error in get data");
        $toast.error("MongoDb Setting Error. Please reload a page.", {position: 'top-right'});
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