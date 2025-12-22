<template>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    <div class="plantab_wrapper" v-else>
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
            <div>
                <button class="link-button mr-20" @click="cancelButton">Cancel</button>
                <button class="primary-button" @click="updateModel">Save</button>
            </div>
        </div>
        <div class="setting-content-wrapper">
            <h4>AI</h4>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSE" class="control-label">AI API Key<span>*</span></label>
                        <InputText type="text"
                            class="form-control"
                            id="inputEmailSE" 
                            placeholder="AI Api Key" 
                            v-model="formDatas.aiApiKey.value"
                            @keyup="checkErrors({'field':formDatas.aiApiKey,
                            'name':formDatas.aiApiKey.name,
                            'validations':formDatas.aiApiKey.rules,
                            'type':formDatas.aiApiKey.type,
                            'event':$event.event}),isApiValid = false"
                        />
                        <div class="red">{{formDatas.aiApiKey.error}}</div>
                        <div v-if="isApiValid" class="red">Api key is not valid</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="inputEmailSE" class="control-label">AI Models<span>*</span></label>
                        <SelectComp
                            :isDisplayImage="false"
                            name="aiModelsSelection"
                            displayKey="label"
                            v-model="formDatas.aiModel.value"
                            :options="aiModelsOptions"
                            :enableSearch="aiModelsOptions.length > 10"
                            :disabled="false"
                            class="select__component"
                        />
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
import { apiRequest, apiRequestWithoutCompnay } from "../../../services";
// COMPONENTS
import BreadCrumb from '@/components/atom/BreadCrumb/BreadCrumb';
import InputText from '@/components/atom/InputText/InputText.vue';
import SelectComp from "@/components/molecules/Select/Select.vue"
import { useValidation } from '../../../composable/Validation';
import axios from 'axios';

const breadCrumbArray = [
    {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
    {name: 'Settings', routeObj: {name: ''}, isClickable: false},
    {name: 'AI Settings', routeObj: {name: 'AI Settings'}, isClickable: false},
]
const aiModelsOptions = ref([]);
const aiModel = ref('');
const  { checkErrors } = useValidation();

const formDatas = ref({
    aiModel: {type: 'text',name: 'Model',value: {},rules: "required"},
    aiApiKey: {type: 'text', name : 'Api key', value : '', rules: "required"}
});
const isApiValid = ref(false)

const isSpinner = ref(true);
const apiKey = ref("");
const $toast = useToast();

function getEnvData() {
    const formData = {};
    apiRequestWithoutCompnay("get", env.GET_ENV, formData).then((response)=> {
        if(response.data.status === true) {
            apiKey.value = response?.data?.data?.AI_API_KEY || "";
            aiModel.value = response?.data?.data?.AI_MODEL || "";
            formDatas.value.aiModel.value.value = response?.data?.data?.AI_MODEL || "";
            formDatas.value.aiApiKey.value = apiKey.value; 
            findLabel();
            isSpinner.value = false;
        } else {
            isSpinner.value = false;
            $toast.error("AI Setting Error. Please reload a page.", {position: 'top-right'});
        }
    }).catch((err)=>{
        console.error(err,"error in get data");
        $toast.error("AI Setting Error. Please reload a page.", {position: 'top-right'});
        isSpinner.value = false;
    });
}

onMounted(() => {
    isSpinner.value = true;
    getEnvData();
    getAiModels();
})

function getAiModels () {
    apiRequest("post",env.GETAIMODELS).then((result)=>{
        if(result.data.status === true){
            aiModelsOptions.value = result.data.statusText;
        }
    }).catch((err) => {
        console.error(err,"err");
        isSpinner.value = false;
    })
}

function findLabel () {
    const axiosData = {
        value : formDatas.value.aiModel.value.value
    }
    apiRequest("post",env.FINDONEAIMODEL,axiosData).then((result)=>{
        if(result.data.status === true){
            formDatas.value.aiModel.value.label = result.data.statusText.label
        }
    }).catch((err) => {
        console.error(err,"err");
        isSpinner.value = false;
    })
}

function updateModel () {
    validateAIApiKey().then(async() => {
        // AI KEY UPDATE
        const axiosData = {
            value : formDatas.value.aiApiKey.value,
            key : 'AI_API_KEY'
        }
        await apiRequest("post",env.UPDATEAIMODEL,axiosData).then(async(result) => {
            if(result.data.status === false){
                $toast.error("Something went wrong.", {position: 'top-right'});
                cancelButton ();
            }
        }).catch((error) => {
            $toast.error("Something went wrong.", {position: 'top-right'});
            cancelButton ()
            console.error("errr",error);
        })

        // AI MODEL UPDATE
        const axiosModelData = {
            value : formDatas.value.aiModel.value.value,
            key : 'AI_MODEL'
        }
        await apiRequest("post",env.UPDATEAIMODEL,axiosModelData).then((result) => {
            if(result.data.status === true){
                $toast.success("Updated successfully", {position: 'top-right'});
            }else{
                $toast.error("Something went wrong.", {position: 'top-right'});
                cancelButton ()
            }
        }).catch((error) => {
            $toast.error("Something went wrong.", {position: 'top-right'});
            cancelButton ()
            console.error("errr",error);
        })
    }).catch((err) => {
        console.error(err,"err");
    });
}

function cancelButton () {
    formDatas.value.aiModel.value.value = aiModel.value;
    formDatas.value.aiApiKey.value = apiKey.value;
    formDatas.value.aiApiKey.error = '';
    isApiValid.value = false;
    findLabel();
}

function validateAIApiKey () {
    return new Promise((resolve,reject) => {
        try {
        isApiValid.value = false;
        axios.get('https://api.openai.com/v1/engines',{
                headers: {
                    'Authorization': `Bearer ${formDatas.value.aiApiKey.value}`,
                    'Content-Type': 'application/json'
                }
            }).then(() => {
                resolve(true);
            })
            .catch((error) => {
                isApiValid.value = true;
                reject(error);
            })
        } catch (error) {
            console.error(error,"error");
        }
    })
}
</script>
<style scoped src="./style.css">
</style>