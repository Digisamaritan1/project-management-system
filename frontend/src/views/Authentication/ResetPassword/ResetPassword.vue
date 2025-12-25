<template>
    <div v-if="isVerify === true" class="h-100dvh">
        <SpinnerComp :is-spinner="isVerify" v-if="isVerify"/>
    </div>
    <Template v-if="isVerify === false">
        <div class="ah-rightside">
            <div>
                <h3 v-if="!messageText" class="title-login font-weight-bold text-capitalize dark-gray">{{$t('Auth.reset_password')}}</h3>
                <p class="GunPowder" v-if="!showResend && !messageText">{{$t('Auth.enter_new_password')}}</p>
                <p class="GunPowder" v-if="messageText">{{$t(messageText)}}</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit" v-if="!showResend">
                <div class="form-group">
                    <label class="font-roboto-sans gray" for="password">{{$t('Auth.password')}}<span class="red">*</span></label>
                    <InputText 
                        class="login-input"
                        v-model="formData.password.value"
                        height="56px"
                        width="100%"
                        :max-length="150"
                        placeHolder="*****"
                        :type="viewPassword"
                        @keyup="checkErrors({'field':formData.password,
                        'name':formData.password.name,
                        'validations':formData.password.rules,
                        'type':formData.password.type,
                        'event':$event.event}),updateConfirmation()"
                        id="password"
                     />
                    <span @click="togglePasswordInput('password')" class="cursor-pointer position-ab d-flex align-items-center eye">
                        <img v-if="viewPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                        <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                    </span>
                    <div class="invalid-feedback red error-capitalize">{{formData.password.error}}</div>
                </div>
                <div class="form-group">
                    <label class="font-roboto-sans gray" for="password">{{$t('Auth.confirm_password')}}<span class="red">*</span></label>
                    <InputText 
                        class="login-input"
                        v-model="formData.confirmPassword.value"
                        height="56px"
                        width="100%"
                        :max-length="150"
                        placeHolder="*****"
                        :type="viewConfirmPassword"
                        @keyup="confirmationPassValidation()"
                        id="cpassword"
                     />
                    <span @click="togglePasswordInput('cpassword')" class="cursor-pointer position-ab d-flex align-items-center eye">
                        <img v-if="viewConfirmPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                        <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                    </span>
                     <div v-if="confirmationErr" class="invalid-feedback red error-capitalize">{{ confirmationErr }}</div>
                </div>
                <div class="form-group">
                    <button v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500" type="submit">{{$t('Auth.reset_password')}}</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans bg-blue white cursor-pointerfont-weight-500" disabled><span id="btn-spinner"></span>{{$t('Auth.loading')}}...</button>
                </div>
            </form>
        </div>
    </Template>
</template>

<script setup>
import Template from "@/components/templates/Authentication/index.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { ref, onMounted } from "vue";
import { useRoute , useRouter } from 'vue-router'
import { useValidation } from "@/composable/Validation.js";
import { apiRequestWithoutSecure } from '@/services';
import * as env from '@/config/env';
import {useToast} from 'vue-toast-notification';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
const  { checkErrors , checkAllFields } = useValidation();
const route = useRoute();
const router = useRouter();
const $toast = useToast();
const showResend = ref(true);
const userId = ref("");
const formData = ref({
    password: {
        value: "",
        rules:
        "required | regex: ^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$ | min:8",
        name: "password",
        error: "",
    },
    confirmPassword: {
        value: "",
        name: "confirm password",
        error: "",
    }
})
const isSpinner = ref(false);
const isVerify = ref(false);
const viewPassword = ref("password");
const viewConfirmPassword = ref("password");
const confirmationErr = ref("");
const messageText = ref("");

onMounted(()=>{
    isVerify.value = true;
    const reqObj = {
        token: route.params.token
    };
    apiRequestWithoutSecure("post", env.TOKEN_VERIFY_FORGOTPASSWORD, reqObj).then((result) => {
        userId.value = result.data.data._id;
        showResend.value = false;
        isVerify.value = false;
    }).catch((error) => {
        console.error(error);
        showResend.value = true;
        isVerify.value = false;
        messageText.value = "Auth.link_expired_resend_email";
        $toast.error(t('Auth.link_expired_resend_email'),{position: 'top-right'});
        setTimeout(() => {
            router.replace({ name: 'Log-in' });
        }, 10000)
    });
})

const handleSubmit = () => {
    if(formData.value.confirmPassword.value === ''){
        confirmationErr.value = t('errorPage.The_confirm_password_field_is_required')
    }else if(formData.value.password.value !== formData.value.confirmPassword.value){
        confirmationErr.value = t('errorPage.The_confirm_password_confirmation_does_not_match')
    }
    checkAllFields(formData.value).then(async (valid)=>{
        if(valid && confirmationErr.value === ''){
            isSpinner.value = true;
            try {
                const reqObj = {
                    id: userId.value,
                    password: formData.value.password.value,
                    token: route.params.token
                };
                apiRequestWithoutSecure("post", env.RESETPASSWORD, reqObj).then(() => {
                    isSpinner.value = false;
                    $toast.success(t("Toast.Password_reset_has_been_successfully"),{position: 'top-right'});
                    router.replace({ name: 'Log-in' });
                }).catch((error) => {
                    isSpinner.value = false;
                    showResend.value = true;
                    isVerify.value = false;
                    formData.value.password.value = "";
                    formData.value.confirmPassword.value = "";
                    if (error?.response?.data?.key) {
                        messageText.value = "Auth.link_expired_resend_email";
                        $toast.error(t('Auth.link_expired_resend_email'),{position: 'top-right'});
                        setTimeout(() => {
                            router.replace({ name: 'Log-in' });
                        }, 10000)
                    } else {
                        messageText.value = error?.response?.data?.message || 'Toast.something_went_wrong';
                        $toast.error(t(error?.response?.data?.message || 'Toast.something_went_wrong'),{position: 'top-right'})
                    }
                });
            } catch (error) {
                isSpinner.value = false;
                $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'})
            }
        }
    })
}

const togglePasswordInput = (key) => {
    if(key === "password"){
        viewPassword.value = (viewPassword.value === "password") ? "text" : "password";
    }else{
        viewConfirmPassword.value = (viewConfirmPassword.value === "password") ? "text" : "password";
    }
}

const updateConfirmation = () => {
    if(formData.value.confirmPassword.value === ''){
        return;
    }else{
        if(formData.value.confirmPassword.value === ''){
            confirmationErr.value = t('errorPage.The_confirm_password_field_is_required');
        }else if(formData.value.password.value !== formData.value.confirmPassword.value){
            confirmationErr.value = t('errorPage.The_confirm_password_confirmation_does_not_match');
        }else{
            confirmationErr.value = ''
        }
    }
}

const confirmationPassValidation = () => {
    if(formData.value.confirmPassword.value === ''){
        confirmationErr.value = t('errorPage.The_confirm_password_field_is_required');
    }else if(formData.value.password.value !== formData.value.confirmPassword.value){
        confirmationErr.value = t('errorPage.The_confirm_password_confirmation_does_not_match');
    }else{
        confirmationErr.value = ''
    }
}
</script>

<style>
@import url('../Login/style.css');
</style>