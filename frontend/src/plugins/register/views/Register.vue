<template>
    <AuthTemplate v-if="isShowResend === false">
        <div class="ah-rightside" :class="[{'disableInputField':isSpinner}]">
            <div class="sinup-login-title-wrapper">
                <h3 class="font-weight-bold text-capitalize dark-gray">{{$t('Auth.Welcome_Msg').replace('BRAND_NAME', brandSettings && brandSettings?.productName ? brandSettings.productName : 'Alian Hub')}}</h3>
                <p class="GunPowder">{{$t('Auth.Welcome_Description')}}</p>
            </div>
            <!-- Signup with auth -->
            <form action="#" @submit.prevent="handleSubmit">
                <div class="row align-items-start d-flex">
                    <div class="col-md-6 pl-0">
                        <div class="form-group">
                            <label class="gray font-roboto-sans" for="password">{{$t('Auth.firstName')}}<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input"
                                v-model.trim="formData.firsName.value"
                                height="56px"
                                width="100%"
                                :max-length="25"
                                placeHolder="eg. Maria"
                                type="text"
                                @keyup="checkErrors({'field':formData.firsName,
                                'name':formData.firsName.name,
                                'validations':formData.firsName.rules,
                                'type':formData.firsName.type,
                                'event':$event.event})"
                                id="firstName"
                                tabindex="1"
                            />
                            <div class="invalid-feedback red" >{{ formData.firsName.error }}</div>
                        </div>
                    </div>
                    <div class="col-md-6 pr-0">
                        <div class="form-group">
                            <label for="password" class="gray font-roboto-sans">{{$t('Auth.lastName')}}<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input"
                                v-model.trim="formData.lastName.value"
                                height="56px"
                                width="100%"
                                :max-length="25"
                                placeHolder="eg. Tailor"
                                type="text"
                                @keyup="checkErrors({'field':formData.lastName,
                                'name':formData.lastName.name,
                                'validations':formData.lastName.rules,
                                'type':formData.lastName.type,
                                'event':$event.event})"
                                id="lastName"
                                tabindex="2"
                            />
                            <div class="invalid-feedback red" >{{ formData.lastName.error }}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="gray font-roboto-sans" for="password">{{$t('Auth.email_id')}}<span class="red">*</span></label>
                    <InputText
                        class="form-control login-input"
                        type="text"
                        height="56px"
                        width="100%"
                        placeHolder="Enter your email"
                        v-model.trim="formData.email.value"
                        tabindex="3"
                        :max-length="254"
                        @keyup="checkErrors({'field':formData.email,
                        'name':formData.email.name,
                        'validations':formData.email.rules,
                        'type':formData.email.type,
                        'event':$event.event})"
                    />
                    <div class="invalid-feedback red" >{{ formData && formData.email && formData.email.error }}</div>
                </div>
                <div class="row align-items-start d-flex">
                    <div class="col-md-6 pl-0">
                        <div class="form-group">
                            <label class="gray font-roboto-sans" for="password">{{$t('Auth.Password')}}<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input pwd__input"
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
                                tabindex="4"
                            />
                            <span @click="togglePasswordInput('password')" class="cursor-pointer position-ab d-flex align-items-center eye">
                                <img v-if="viewPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                                <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                            </span>
                            <div class="invalid-feedback red error-capitalize" >{{ formData.password.error }}</div>
                        </div>
                    </div>
                    <div class="col-md-6 pr-0">
                        <div class="form-group">
                            <label class="gray font-roboto-sans" for="password">{{$t('Auth.Conform_pass')}}<span class="red">*</span></label>
                            <InputText 
                                class="form-control login-input pwd__input"
                                v-model="formData.confirmPassword.value"
                                height="56px"
                                width="100%"
                                :max-length="150"
                                placeHolder="*****"
                                :type="viewConfirmPassword"
                                @keyup="confirmationPassValidation()"
                                id="confirmPassword"
                                tabindex="5"
                            />
                            <span @click="togglePasswordInput('cpassword')" class="cursor-pointer position-ab d-flex align-items-center eye">
                                <img v-if="viewConfirmPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                                <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                            </span>
                            <div  v-if='confirmationErr' class="invalid-feedback red error-capitalize">{{ $t('errorPage.' + confirmationErr.replaceAll(" ","_")) }}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group d-flex checkbox-label forgot-checkbox flex-wrap">
                    <input type="checkbox" 
                        id="checkbox-term-policy" 
                        data-vv-as="term and conditions"
                        name="termPolicy"
                        class="styled-checkbox position-ab opacity-none"
                        v-model="formData.termsAndCondition.value"
                        @click="checkErrors({'field':formData.termsAndCondition,
                        'name':formData.termsAndCondition.name,
                        'validations':formData.termsAndCondition.rules,
                        'type':formData.termsAndCondition.type,
                        'event':$event})">
                    <label  for="checkbox-term-policy" class="chk-label gray font-roboto-sans d-flex align-items-center">
                        <span>{{$t('Auth.agree')}} <a :href="brandSettings && brandSettings?.termsOfService ? brandSettings.termsOfService : 'javascript:void(0)'" :target="brandSettings && brandSettings?.termsOfService ? '_blank' : ''" :style="[{'pointer-events' : isSpinner ? 'none' : ''}]">{{$t('Auth.tearm')}}</a> and <a :href="brandSettings && brandSettings?.privacyPolicy ? brandSettings.privacyPolicy : 'javascript:void(0)'" :target="brandSettings && brandSettings?.privacyPolicy ? '_blank' : ''" :style="[{'pointer-events' : isSpinner ? 'none' : ''}]"> {{$t('Auth.Privacy_Policy')}}</a></span>   
                    </label>
                    <div class="invalid-feedback red w-100" >{{ formData.termsAndCondition.error }}</div>
                </div>
                <div class="form-group">
                    <button v-if="!isSpinner"  type="submit" class="btn btn-blue btn-login font-roboto-sans bg-blue white font-weight-500 cursor-pointer" tabindex="6">{{$t('Auth.Register')}}</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans opacity-7 white bg-blue font-weight-500" disabled><span id="btn-spinner"></span>{{$t('Auth.loading')}}...</button>
                </div>
                <div class="create-accountlink text-center">
                    <span class="font-roboto-sans font-weight-normal font-weight-400 gray already__acount">{{$t('Auth.alredyacc')}} <router-link @click="handleEmail" class="light-purple font-weight-500" :style="[{'pointer-events' : isSpinner ? 'none' : ''}]" :to="{name: 'Log-in'}">{{$t('Auth.loging')}}</router-link></span>
                </div>
            </form>
            <div class="custom-divider my-1" v-if="isDevider">
                <div class="custom-divider-text">Or Continue With</div>
            </div>
            <!-- oAuth -->
            <oAuthProviders mode="register"/>
        </div>
    </AuthTemplate>
    <Template v-if="isShowResend === true">
        <div class="ah-rightside">
            <div>
                <h3 class="title-login dark-gray">{{$t('Auth.ResendEmail')}}</h3>
                <p class="GunPowder">{{$t('Auth.pleasecheck')}}</p>
            </div>
            <form action="#" @submit.prevent="handleSubmitResend">
                <div class="form-group">
                    <button  v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white font-weight-500 cursor-pointer" type="submit">{{$t('Auth.ResendEmail')}}</button>
                    <button v-else type="button" class="btn btn-blue btn-login btn-disabled opacity-7 white bg-blue font-weight-500 font-roboto-sans" disabled><span id="btn-spinner"></span>{{ $t('Auth.loading') }}...</button>
                </div>
            </form>
            <div class="create-accountlink text-center">
                <span class="font-roboto-sans font-weight-normal font-weight-400 gray cursor-pointer" @click="backToLogin">{{$t('Auth.backlogin')}}? <span class="light-purple font-weight-500">{{$t('Auth.loging')}}</span></span>
            </div>
        </div>
    </Template>
</template>

<script setup>
import { defineComponent ,ref , inject, computed } from "vue";
import { useValidation } from "@/composable/Validation.js";
import { isAuthDeviderShow } from "@/composable/commonFunction.js";
import * as env from '@/config/env';
const  { checkErrors, checkAllFields } = useValidation();
import { useRouter} from 'vue-router'
import {useToast} from 'vue-toast-notification';
import InputText from "@/components/atom/InputText/InputText.vue";
import AuthTemplate from "@/components/templates/Authentication/index.vue";
import { useI18n } from "vue-i18n";
import Template from "@/components/templates/Authentication/index.vue";
// import Spinner from "@/components/atom/SpinnerComp/SpinnerComp.vue"
const axios = inject("$axios");
const $toast = useToast();
import { useStore } from 'vuex';
const { getters } = useStore();
const { t } = useI18n();
defineComponent({
	name: "SignUp-page",

	components: {
		AuthTemplate
	}
});
const isShowResend = ref(false);
const email = localStorage.getItem('ForgotEmail');
const formData = ref({
    firsName: {
        value: "",
        rules:
        "required",
        name: "first name",
        error: "",
    },
    lastName: {
        value: "",
        rules:
        "required",
        name: "last name",
        error: "",
    },
    email: {
        value: email ? email : "",
        rules:
        "required | regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$",
        name: "Email",
        error: "",
    },
    password: {
        value: "",
        rules:
        "required | regex: ^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$ | min:8",
        name: "Password",
        error: "",
    },
    confirmPassword: {
        value: "",
        name: "confirm password",
        error: "",
    },
    termsAndCondition: {
        value: "",
        name: "terms and condition",
        error: "",
        rules: "required",
    },
})
const isSpinner = ref(false)
const router = useRouter()
const viewPassword = ref("password")
const viewConfirmPassword = ref("password")
// const isLoading = ref(false);
const brandSettings = computed(() => getters['brandSettingTab/brandSettings']);
const togglePasswordInput = (key) => {
    if(key === "password") {
        viewPassword.value = (viewPassword.value === "password") ? "text": "password";
    }else{
        viewConfirmPassword.value = (viewConfirmPassword.value === "password") ? "text": "password";
    }
}
const confirmationErr = ref('')
const userData = ref();
const isDevider = ref(isAuthDeviderShow());
const handleSubmitResend = () => {
    if (!(userData.value && Object.keys(userData.value).length)) {
        $toast.error(t('Toast.something_went_wrong'), { position: 'top-right' });
        return;
    }

    const cTime = Date.now();
    const duration = 1 * 60 * 1000;
    const lastResendTime = localStorage.getItem("lastResendTime");

    if (lastResendTime && cTime - lastResendTime < duration) {
        $toast.error(t(`authErrorMessage.please_wait_before_resending_email`), { position: 'top-right' });
        return;
    }
    const axiosData = {
        "uid": userData.value._id,
        "email": userData.value.Employee_Email
    };
    isSpinner.value = true;
    axios.post(env.API_URI + env.SEND_VARIFICATION_EMAIL, axiosData).then((result) => {
        if(result.data.status === true) {
            $toast.success(t("Toast.Verification_mail_has_been_send_successfully"), { position: 'top-right' });
            localStorage.setItem("lastResendTime", cTime.toString());
            isSpinner.value = false;
        } else {
            isSpinner.value = false;
            $toast.error(result.data.statusText, { position: 'top-right' });
        }
    }).catch((error) => {
        isSpinner.value = false;
        console.error(error, "Error");
        $toast.error(t("Toast.something_went_wrong"), { position: 'top-right' });
    })
}
const backToLogin = () => {
    isShowResend.value = false;
    localStorage.removeItem("lastResendTime");
    router.push({ name: "Log-in" });
    localStorage.setItem("ForgotEmail", formData.value.email.value);
}
const handleSubmit = () =>{
    if(formData.value.confirmPassword.value === ''){
        confirmationErr.value = 'The confirm password field is required'
    }else if(formData.value.password.value !== formData.value.confirmPassword.value){
        confirmationErr.value = 'The confirm password confirmation does not match'
    }
    checkAllFields(formData.value).then(async(valid)=>{
        if(valid && confirmationErr.value === ''){
            isSpinner.value = true;
            const axiosData = {
                firstName:  formData.value.firsName.value,
                lastName: formData.value.lastName.value,
                email: formData.value.email.value,
                password: formData.value.password.value,
                isInvitation: false,
            };
            axios.post(env.API_URI + env.CREATE_USER_V2, axiosData).then((response) => {
                if (response.data.status) {
                    isSpinner.value = false;
                    // signOut(auth);
                    localStorage.setItem('isLogging', 'false');
                    isShowResend.value = true;
                    $toast.success(t('Toast.User_has_been_registered_successfully_Please_verify_your_email_to_continue'),{position: 'top-right'});
                    userData.value = response?.data?.statusText;
                    localStorage.setItem("lastResendTime", Date.now().toString());
                    localStorage.removeItem('ForgotEmail');
                } else {
                    isSpinner.value = false;
                    if (response.data.statusText.status == 409 || response.data.statusText.includes("already exists for the field(s) 'email'")) {
                        $toast.error(t('Toast.The_email_address_is_already_in_use'),{position: 'top-right'})
                    } else {
                        $toast.error(t('Toast.something_went_wrong'),{position: 'top-right'})
                    }
                }
            }).catch((error)=>{
                console.error(error);
                isSpinner.value = false;
                // signOut(auth);
                localStorage.setItem('isLogging', 'false');
                router.push({ name: "Log-in" });
                $toast.success(error.message,{position: 'top-right'});
            })
        }
    })
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
const handleEmail = () => {
    localStorage.setItem("ForgotEmail", formData.value.email.value);
};

</script>

<style>
@import url('../../../views/Authentication/Login/style.css');
</style>