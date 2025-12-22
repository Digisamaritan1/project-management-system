<template>
    <SpinnerComp :is-spinner="isGetSpinner" v-if="isGetSpinner"/>
    <div class="h-100 w-100" v-else>
        <div class="d-flex justify-content-between">
            <BreadCrumb :breadCrumbArray="breadCrumbArray"/>
        </div>
        <div class="emailTempalte-wrapper white-box-main">
            <div class="row">
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-group">
                                <label>Template Selection</label>
                                <select class="tempalteSelect form-control cursor-pointer" v-model="selectedTemplate" @change="callFun(selectedTemplate)">
                                    <option v-for="(templates,index) in templatesData" :key="index" :value="templates">
                                        {{templates?.name}}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Subject</label>
                                <input type="text" class="form-control" placeholder="New Workspace Invitation" v-model="formData.subject.value" @keyup="checkErrors({
                                    'field': formData.subject,
                                    'name': formData.subject.name,
                                    'validations': formData.subject.rules,
                                    'type': formData.subject.type,
                                    'event': $event.event
                                })">
                                <div class="invalid-feedback red">{{formData.subject.error}}</div>
                            </div>
                        </div>
                        <div class="col-md-6" v-if="false">
                            <div class="form-group">
                                <label>From</label>
                                <input type="text" class="form-control" placeholder="Alian Hub" v-model="selectedTemplate.from">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="emailTempalte-wrapper emailmsgWrapper white-box-main">
        <div class="d-flex cursor-pointer email_template_tab_title">
            <div @click="activeTab = 0" :class="{'email_tempalte_activetab': activeTab === 0}">Editor</div>
            <div @click="activeTab = 1" :class="{'email_tempalte_activetab': activeTab === 1}">Preview</div>
        </div>
            <div class="row" v-if="activeTab === 0">
                <div class="col-md-12">
                    <label>Email Message</label>
                    <textarea class="form-control" v-model.trim="formData.message.value" rows="10" @keyup="checkErrors({
                            'field': formData.message,
                            'name': formData.message.name,
                            'validations': formData.message.rules,
                            'type': formData.message.type,
                            'event': $event.event
                        })"></textarea>
                        <div class="invalid-feedback red">{{formData.message.error}}</div>
                        <div v-if="selectedTemplate.id === 1"><span class="emailKeysVal">Note :- Available keys: link, brandName, imageUrl.</span></div>
                        <div v-if="selectedTemplate.id === 2"><span class="emailKeysVal">Note :- Available keys: link, email, brandName, imageUrl.</span></div>
                        <div v-if="selectedTemplate.id === 3"><span class="emailKeysVal">Note :- Available keys: link, companyName, brandName, imageUrl.</span></div>
                </div>
                <div class="col-md-12 company_button-wrapper">
                    <button v-if="!isSpinner" class="company_button" @click="saveTemplate()">Save Changes</button>
                    <button v-else class="company_button btn-disabled" disabled>Save Changes</button>
                </div>
            </div>
            <div v-else>
                <div v-html="formData.message.value"></div>
            </div>
        </div>
    </div>
</template>
<script setup>
// COMPONENTS
import BreadCrumb from "@/components/atom/BreadCrumb/BreadCrumb.vue"
import { onMounted, ref } from "vue";
import emailTemplate from '@/utils/emailTemplate.js';
import { apiRequest } from "../../services";
import { useToast } from "vue-toast-notification";
import { useValidation } from "../../composable/Validation";
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
import * as env from '@/config/env';
const breadCrumbArray = [
    {name: 'Home', routeObj: {name: 'Home'}, isClickable: true},
    {name: 'Email Templates', routeObj: {name: 'Email Templates'}, isClickable: false},
]
const templatesData = ref([]);
const activeTab = ref(0);
const isSpinner = ref(false);
const isGetSpinner = ref(false);
const $toast = useToast();

const selectedTemplate = ref({});
const formData = ref({
    message: {
        value: selectedTemplate.value.email_message,
        rules:
        "required",
        name: "Email Message",
        error: "",
    },
    subject: {
        value: selectedTemplate.value.subject,
        rules: "required",
        name: "Email Subject",
        error: ""
    }
})

const  { checkErrors, checkAllFields } = useValidation();

onMounted(() => {
    isGetSpinner.value = true;
    emailTemplate().then(emailTemplate => {
        templatesData.value = emailTemplate;
        selectedTemplate.value = templatesData.value[0]
        formData.value.message.value = selectedTemplate.value.email_message;
        formData.value.subject.value = selectedTemplate.value.subject;
        isGetSpinner.value = false;
    }).catch(error => {
        isGetSpinner.value = false;
        console.error('Error fetching email template:', error);
    });
})

function callFun(data) {
    emailTemplate().then(emailTemplate => {
        templatesData.value = emailTemplate;
        let index = templatesData.value.findIndex((x) => x.id === data.id);
        selectedTemplate.value = templatesData.value[index];
        formData.value.message.value = selectedTemplate.value.email_message;
        formData.value.subject.value = selectedTemplate.value.subject;
    }).catch(error => {
        console.error('Error fetching email template:', error);
    });
}

function saveTemplate () {
    checkAllFields(formData.value).then((valid)=>{
        if(valid){
            isSpinner.value = true;
            apiRequest("post", env.UPDATE_EMAIL_TEMPLATE, {
                emailData: formData.value.message.value,
                subject: formData.value.subject.value,
                id: selectedTemplate.value.id
            }).then(() => {
                isSpinner.value = false;
                $toast.success("Updated Successfully.", {position: 'top-right'});
            }).catch((error) => {
                console.error("ERROR in save template: ", error);
                isSpinner.value = false;
            })
        }
    })
}
</script>
<style scoped src="./style.css"></style>