<template>
    <div v-if="isVerify === true" class="h-100dvh">
        <SpinnerComp :is-spinner="isVerify" v-if="isVerify"/>
    </div>
    <AuthTemplate v-if="isVerify === false">
        <div>
            <div class="Authentication_right--form">
                <div class="Authentication_right--logo">
                <img :src="logoImage"/>
                </div>
                <h3 v-if="!messageText">Set New Passowrd</h3>
                <p class="GunPowder" v-if="messageText">{{messageText}}</p>
                <form action="#" @submit.prevent="handleSubmit" v-if="!showResend">
                    <div class="form-group mb-20 position-re">
                        <label class="font-14 d-block text-left text-gray">Password<span class="text_red">*</span></label>
                        <InputComponent
                            v-model="formData.password.value"
                            :type="viewPassword"
                            :placeHolder="'*****************'"
                            @keyup="checkErrors({'field':formData.password,
                            'name':formData.password.name,
                            'validations':formData.password.rules,
                            'type':formData.password.type,
                            'event':$event.event}),updateConfirmation()"
                        ></InputComponent>
                        <span @click="togglePasswordInput('password')" class="cursor-pointer position-ab d-flex align-items-center eye">
                            <img v-if="viewPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                            <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                        </span>
                        <div class="invalid-feedback text-left text_red" >{{ formData.password.error }}</div>
                    </div>
                    <div class="form-group mb-10 position-re">
                        <label class="font-14 d-block text-left text-gray">Confirm Password<span class="text_red">*</span></label>
                        <InputComponent
                            v-model="formData.confirmPassword.value"
                            :type="viewConfirmPassword"
                            :placeHolder="'*****************'"
                            @keyup="confirmationPassValidation()"
                        ></InputComponent>
                        <span @click="togglePasswordInput('cpassword')" class="cursor-pointer position-ab d-flex align-items-center eye">
                            <img v-if="viewConfirmPassword === 'password'" src="@/assets/images/password_view_hide.png" class="password-view"/>
                            <img v-else src="@/assets/images/password_view_show.png" class="password-view"/>
                        </span>
                        <div class="invalid-feedback text-left text_red" >{{ confirmationErr }}</div>
                    </div>
                    <button class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500 w-100">
                        Set New Password
                    </button>
                </form>
            </div>
        </div>
    </AuthTemplate>
</template>
<script setup>
    import AuthTemplate from "@/components/templates/Authentication/AuthIndex.vue";
    import InputComponent from '@/components/atom/InputText/InputText.vue';
    import { onMounted, ref } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import * as env from '@/config/env';
    import { useValidation } from "../../../composable/Validation";
    import { useToast } from "vue-toast-notification"
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import { apiRequestWithoutSecure } from '@/services';

    const route = useRoute();
    const router = useRouter();
    const  { checkErrors, checkAllFields } = useValidation();
    const $toast = useToast();

    const formData = ref({
        password: {
            value: "",
            rules:
            "required",
            name: "Password",
            error: "",
        },
        confirmPassword: {
            value: "",
            name: "confirm password",
            error: "",
        },
    })
    const confirmationErr = ref('');
    const isVerify = ref(false);
    const isSpinner = ref(false);
    const showResend = ref(true);
    const messageText = ref("");
    const viewPassword = ref("password");
    const viewConfirmPassword = ref("password");
    const userId = ref("");
    const logoImage = env.GET_LOGO + '?key=logo&type=admin';

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
            messageText.value = "Your link has expired.";
            $toast.error("Your link has expired.",{position: 'top-right'});
            setTimeout(() => {
                router.replace({ name: 'Signin' });
            }, 10000)
        });
    })

    const handleSubmit = () => {
        if(formData.value.confirmPassword.value === ''){
            confirmationErr.value = 'The confirm password field is required'
        }else if(formData.value.password.value !== formData.value.confirmPassword.value){
            confirmationErr.value = 'The confirm password confirmation does not match'
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
                        $toast.success("New password set has been successfully",{position: 'top-right'});
                        router.replace({ name: 'Signin' });
                    }).catch((error) => {
                        isSpinner.value = false;
                        showResend.value = true;
                        isVerify.value = false;
                        formData.value.password.value = "";
                        formData.value.confirmPassword.value = "";
                        if (error?.response?.data?.key) {
                            messageText.value = "Your link has expired.";
                            $toast.error("Your link has expired.",{position: 'top-right'});
                            setTimeout(() => {
                                router.replace({ name: 'Signin' });
                            }, 10000)
                        } else {
                            messageText.value = error?.response?.data?.message === "Auth.too_many_request" ? "You have sent too many requests in a given amount of time. Please wait and try again later." : error?.response?.data?.message || "something went wrong";
                            $toast.error(messageText.value,{position: 'top-right'})
                        }
                    });
                } catch (error) {
                    isSpinner.value = false;
                    $toast.error('something went wrong',{position: 'top-right'});
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
                confirmationErr.value = 'The confirm password field is required'
            }else if(formData.value.password.value !== formData.value.confirmPassword.value){
                confirmationErr.value = 'The confirm password confirmation does not match'
            }else{
                confirmationErr.value = ''
            }
        }
    }

    const confirmationPassValidation = () => {
        if(formData.value.confirmPassword.value === ''){
            confirmationErr.value = 'The confirm password field is required'
        }else if(formData.value.password.value !== formData.value.confirmPassword.value){
            confirmationErr.value = 'The confirm password confirmation does not match'
        }else{
            confirmationErr.value = ''
        }
    }
</script>
<style>
    .eye {
        right: 10px;
        top: 47px;
    }
</style>