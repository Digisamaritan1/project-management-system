<template>
<div>
    <div class="createprojectContent whitebodyContent_v2">
        <div class="col-md-2 company_img">
            <div v-if="templateModel.previewImage.value ==''" class="image-input create-workspace-sidebar-image" @click="$refs.fileInputUser.click()">
                <span class="placeholder" >{{$t('Templates.upload_image')}}</span>
                <img :src="upload" class="upload_image"  :height="12" :width="13">
            </div>
            <img v-else :src="templateModel.previewImage.name"  class="create-workspace-sidebar-image" @click="$refs.fileInputUser.click()">
            <input type="file" ref="fileInputUser" @change="previewImage" hidden>
        </div>
        <div class="form-group d-flex align-items-center">
            <label :class="{'taskstatustitle-desktop': clientWidth > 767 , 'taskstatustitle-mobile': clientWidth <= 767}" >{{$t('Templates.template_name')}}<span class="text-red asterisk">*</span></label>
            <div class="input-field-group">
                <InputText
                    class="form-control login-input"
                    :placeholder="$t('PlaceHolder.Enter_Template_Name')"
                    autocomplete="off"
                    v-model.trim="templateModel.templateName.value"
                    @keyup="isUniqueProjectKey(templateModel.templateName.value),checkErrors({'field':templateModel.templateName,
                    'name':templateModel.templateName.name,
                    'validations':templateModel.templateName.rules,
                    'type':templateModel.templateName.type,
                    'event':$event.event})"
                    maxlength="50"
                    type="text"
                />
                <div class="text-red font-size-11 template__error-text">{{templateModel.templateName.error}}</div>
                <div class="text-red font-size-11 template__error-text" v-if="errorMsg.isUniqueProjectCode">{{$t(`errorMsg.${isUniqueProjectCode.replaceAll(' ','_')}`)}}</div>
            </div>
        </div>
        <div class="form-group textareaWrapper desc-wrapper">
            <label>{{$t('Description.description')}}<span class="text-red asterisk">*</span></label>
            <div class="input-field-group" :style="[{height : clientWidth > 767 ? '83px' : 'auto'}]">
                <textarea :placeholder="$t('PlaceHolder.Enter_Description')" class="form-control textarea-desc"  :class="[{'border-radius-8-px' : clientWidth <=767}]"  :style="[{height : clientWidth > 767 ? '83px !important' : '55px !important' , paddingTop : clientWidth <=767 ? '15.5px' : '5px'}]"  v-model="templateModel.description.value"></textarea>
            </div>
        </div>
    </div>
</div>
</template>
<script setup>
import { ref, inject } from "vue";
import { useStore } from "vuex";
import InputText from "@/components/atom/InputText/InputText.vue";
import { ValidationFunction } from "@/composable/DefaultValidationFunction";
import { useValidation } from "@/composable/Validation.js";
import {useToast} from 'vue-toast-notification';
import { useCustomComposable } from "@/composable";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const { getters } = useStore();
const  { checkErrors } = useValidation();

const $toast = useToast();
const { checkBucketStorage } = useCustomComposable();

    const props = defineProps({
        modelValue : {
            type : Object,
            default : (()=>{})
        },
        templateDetail : {
            type : Object,
            default : (()=>{})
        }
    })
    const fileInputUser = ref();
    const defaultMainTemplate = ref([]);
    const clientWidth = inject("$clientWidth");
    const upload = require("@/assets/images/svg/upload_icon.svg")
    const templateModel = ref(props.templateDetail);
    const errorMsg = ref({isUniqueProjectCode : ''});

    function isUniqueProjectKey(value) {
        const val = value;
        ValidationFunction.isValueExistInArray(defaultMainTemplate.value, val, (result) => {
            if (result == true) {
                errorMsg.value.isUniqueProjectCode = t('errorPage.template_name_already_exists');
            } else {
                errorMsg.value.isUniqueProjectCode = "";
            }
        })
        return;
    }

    function previewImage(){
        const input = fileInputUser.value;
        let fileList = Array.from(input.files);
        if(checkBucketStorage(fileList.map(file => file?.size),{gettersVal: getters,defineFileSize: 4}) !== true){
            return;
        }
        templateModel.value.uploadedImage.value = input.files;
        if (templateModel.value.uploadedImage.value && templateModel.value.uploadedImage.value[0]) {
            const ext = templateModel.value.uploadedImage.value[0].name.substring(templateModel.value.uploadedImage.value[0].name.lastIndexOf(".") + 1);
            const extArray = ['jpg', 'png', 'jpeg', 'JPEG'];
            if (!extArray.includes(ext.toLowerCase())) {
                $toast.error(t('Toast.Select_image_only_and_image_file_format_should_be_FILE_FORMATS').replace('FILE_FORMATS', extArray), { position: 'top-right' })
                return;
            }
            var reader = new FileReader();
            reader.onload = (e) => {
                templateModel.value.previewImage.name = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
            templateModel.value.previewImage.value = input.files[0];
        }
    }
</script>
<style scoped>
.upload_image {
    position: absolute;
    bottom: 10px;
    left: 50px;
}
.template__error-text{
    line-height:18px;
}
.desc-wrapper{
    margin-bottom: -2px;
}
.desc-wrapper textarea{
    resize: none;
}
</style>