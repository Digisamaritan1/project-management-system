<template>
    <Template>
        <div class="ah-rightside">
            <div class="sinup-login-title-wrapper">
                <h3 class="title-login font-weight-bold dark-gray text-capitalize mb-1">{{$t('Auth.Forgot_Password')}}</h3>
                <p class="GunPowder">{{$t('Auth.forgatepasswordmsg')}}</p>
            </div>
            <form action="#" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label class="font-roboto-sans gray" for="email">{{$t('Auth.email_id')}}<span class="red">*</span></label>
                    <InputText
                        class="login-input"
                        v-model.trim="formData.email.value"
                        placeHolder="Enter your email"
                        height="56px"
                        width="100%"
                        @keyup="checkErrors({'field':formData.email,
                        'name':formData.email.name,
                        'validations':formData.email.rules,
                        'type':formData.email.type,
                        'event':$event.event})"
                        :max-length="254"
                    />
                    <div class="invalid-feedback red">{{formData.email.error}}</div>
                </div>
                <div class="form-group">
                    <button v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500" type="submit">{{$t('Auth.Forgot_Password')}}</button>
                    <button v-else type="button" class="btn btn-blue btn-login font-roboto-sans btn-disabled opacity-7 white bg-blue font-weight-500" disabled><span id="btn-spinner"></span>{{$t('Auth.loading')}}...</button>
                </div>
            </form>
            <div class="create-accountlink text-center">
                <span class="font-roboto-sans font-weight-normal font-weight-400 gray">{{$t('Auth.Remember_password')}}? <router-link @click="handleEmail" :to="{name:'Log-in'}" class="light-purple font-weight-500">{{$t('Auth.loging')}}</router-link></span>
            </div>
        </div>
    </Template>
</template>


<script setup>
import Template from "@/components/templates/Authentication/index.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import { useValidation } from "@/composable/Validation.js";
import { ref } from 'vue';
import {useToast} from 'vue-toast-notification';
import { apiRequestWithoutSecure } from '@/services';
import { useRouter } from 'vue-router'
const  { checkErrors , checkAllFields } = useValidation();
import * as env from '@/config/env';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const $toast = useToast();
const router = useRouter();
const email = localStorage.getItem('ForgotEmail');

const formData = ref({
    email: {
        value: email ? email : '',
        rules:
        "required | regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$",
        name: "Email",
        error: "",
    },
})
const isSpinner = ref(false);

const handleSubmit = () =>{
    checkAllFields(formData.value).then(async (valid)=>{
        if(valid){
            isSpinner.value = true;
            const reqObj = {
                email: formData.value.email.value
            }
            apiRequestWithoutSecure("post", env.FORGOTPASSWORD, reqObj).then(() => {
                isSpinner.value = false;
                $toast.success(t("Toast.Password_reset_email_has_been_sent_successfully"),{position: 'top-right'});
                router.push({name:'Log-in'});
                localStorage.removeItem('ForgotEmail');
            }).catch((error) => {
                isSpinner.value = false;
                if (error?.response?.data?.message.includes('user not found')) {
                    $toast.error(t('Auth.no_account_found_for_email'),{position: 'top-right'})
                } else {
                    $toast.error(t(error?.response?.data?.message || 'Toast.something_went_wrong'),{position: 'top-right'})
                }
            })
        }
    })
}

const handleEmail = () => {
    localStorage.setItem("ForgotEmail", formData.value.email.value);
};

</script>

<style src="../Login/style.css">
</style>