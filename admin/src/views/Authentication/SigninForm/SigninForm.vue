<template>
    <AuthTemplate>
        <!-- <SpinnerComp :is-spinner="isSpinner" /> -->
        <div>
            <div class="Authentication_right--form">
                <div class="Authentication_right--logo">
                <img class="logoImage" :src="logoImage"/>
                </div>
                <h3>Sign In</h3>
                <form action="#" @submit.prevent="handleSubmit">
                    <div class="form-group mb-20">
                        <label class="font-14 d-block text-left text-gray">
                        Email ID<span class="text_red">*</span>
                        </label>
                        <InputComponent
                            v-model.trim="formData.email.value"
                            type="text"
                            :placeHolder="'Enter your email'"
                            :max-length="254"
                            @keyup="checkErrors({'field':formData.email,
                            'name':formData.email.name,
                            'validations':formData.email.rules,
                            'type':formData.email.type,
                            'event':$event.event})"
                            @enter="handleSubmit"
                        ></InputComponent>
                        <div class="invalid-feedback">{{formData.email.error}}</div>
                    </div>
                    <div class="form-group mb-20">
                        <label class="font-14 d-block text-left text-gray">
                        Password<span class="text_red">*</span>
                        </label>
                        <InputComponent
                            v-model="formData.password.value"
                            type="password"
                            :placeHolder="'*****************'"
                            @keyup="checkErrors({'field':formData.password,
                            'name':formData.password.name,
                            'validations':formData.password.rules,
                            'type':formData.password.type,
                            'event':$event.event})"
                            @enter="handleSubmit"
                        ></InputComponent>
                        <div class="invalid-feedback">{{formData.password.error}}</div>
                    </div>
                    <div class="Authentication_right--form-link d-flex justify-content-between">
                        <div class="form-group checkbox">
                        <input type="checkbox" id="remember_me"  v-model="rememberMe"/>
                        <label for="remember_me" class="text-gray font-14">
                            Remember Me
                        </label>
                        </div>
                        <div>
                        <router-link class="font-14" to="/forgot-password">Forgot Password?</router-link>
                        </div>
                    </div>
                    <p v-if="errorMessage" class="login-info-message mt-1">{{ errorMessage }}</p>
                    <button v-if="!isSpinner && !errorMessage" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer mt-30 font-weight-500 w-100">
                        Sign In
                    </button>
                    <button v-if="isSpinner && !errorMessage" type="button" class="btn btn-blue btn-login btn-disabled font-roboto-sans bg-blue white mt-30 cursor-pointer font-weight-500 w-100" disabled><span id="btn-spinner"></span>Loading...</button>
                </form>
            </div>
            <!-- <span class="font-18 text-gray mb-20 dash position-re d-inline-block">
                Or connect with
            </span>
            <button class="btn btn-green d-block w-full mt-15 border-radius-6">
                Sign In with <img src="@/assets/images/Envato.png" />
            </button> -->
        </div>
    </AuthTemplate>
</template>
<script setup>
    import { onMounted, ref } from 'vue';
    import AuthTemplate from "@/components/templates/Authentication/AuthIndex.vue";
    import InputComponent from '@/components/atom/InputText/InputText.vue';
    import { useValidation } from "../../../composable/Validation";
    import { useToast } from "vue-toast-notification"
    import axios from 'axios';
    import * as env from '@/config/env';
    import { apiRequestWithoutSecure, getAuth, logOut } from '@/services';
    const  { checkErrors,checkAllFields } = useValidation();
    const $toast = useToast();

    const rememberMe = ref(false);
    const logoImage = env.GET_LOGO + '?key=logo&type=admin';   
    const formData = ref({
        email: {
            value: "",
            rules:
            "required | regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$",
            name: "Email",
            error: "",
        },
        password: {
            value: "",
            rules:
            "required",
            name: "Password",
            error: "",
        },
    });
    const errorMessage = ref("");
    const isSpinner = ref(false);
    
    onMounted(() => {
        // Check remember me functionality
        var rem_data = localStorage.getItem("remember");
        var rem_array = JSON.parse(rem_data);
        if (rem_array) {
            var rem_email = rem_array.email;
            var rem_password = decode(rem_array.password);
            formData.value.email.value = rem_email;
            formData.value.password.value = rem_password;
            rememberMe.value = true;
        }
    })

    const encode = (source) => {
        var str = source;
        var length = str.length;
        var encodedStr = str.charCodeAt(0);
        var position = 1;
        while(position<length) {
            var n = str.charCodeAt(position++);
            encodedStr = encodedStr + ", " + n;
        }
        return encodedStr;
    }

    // //Decode user password
    const decode = (source) => {
        var source_array = source.split(','); // Convert string (CSV) to array.
        var decodedStr = String.fromCharCode.apply(null, source_array);
        return decodedStr;
    }

    const handleSubmit = () => {
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                isSpinner.value = true;
                if (rememberMe.value) {
                    const data = {
                        email: formData.value.email.value,
                        password: encode(formData.value.password.value),
                    };
                    localStorage.setItem("remember", JSON.stringify(data));
                } else {
                    localStorage.removeItem("remember");
                }
                const object = {
                    email:formData.value.email.value, 
                    password:formData.value.password.value,
                    isLoginType: "admin"
                }
                apiRequestWithoutSecure("post",env.LOGIN,object).then(async user => {
                    if(user && user?.status !== 200){
                        isSpinner.value = false;
                        $toast.error('Something went wrong', { position: 'top-right' });
                        return;
                    }
                    if(user?.data?.isResetPassword === true){
                        isSpinner.value = false;
                        // $toast.warning("Password expiry email sent successfully! Please check your inbox to proceed with resetting your password.",{position: 'top-right'});
                        errorMessage.value = "Password expiry email sent successfully! Please check your inbox to proceed with resetting your password.";
                        return;
                    }
                    let data = {
                        type: 'users',
                        data:[ {
                            objId:{
                                _id:user.data.uid
                            }
                        }]
                    }
                    const axiosData = {
                        dataObj: data.data,
                        collection: data.type,
                        methodName: 'findOne',
                        dbName: 'global',
                    };
                    axios.post(env.API_URI + env.MONGO_OPRATION, axiosData).then(async (result)=>{
                        if (result.data?.statusText !== null) {
                            if (result.data?.statusText.isEmailVerified && result.data?.statusText?.isProductOwner) {
                                getAuth(user.data.uid);
                                localStorage.setItem("userId", user.data.uid);
                                window.location.reload();
                            }else{
                                if(!result.data?.statusText.isEmailVerified){
                                    $toast.error("Verify your email and try again",{position: 'top-right'});
                                }else{
                                    $toast.error("You don't have permission to login.",{position: 'top-right'});
                                }
                                localStorage.removeItem("remember");
                                logOut();
                            }
                            isSpinner.value = false;
                        }else{
                            localStorage.removeItem("remember");
                            logOut();
                        }
                    }).catch(() => {
                        localStorage.removeItem("remember");
                        logOut();
                        isSpinner.value = false;
                    })
                }).catch((error)=>{
                    isSpinner.value = false;
                    console.error(error);
                    if (error.error == 'invalid username/password') {
                        $toast.error("Invalid username or password.",{position: 'top-right'})
                    }else if(error?.response?.data?.message === "Auth.too_many_request"){
                        $toast.error('Too many requests. Please try again later', { position: 'top-right' });
                    } else if(error?.response?.data?.message){
                        $toast.error(error?.response?.data?.message, { position: 'top-right' });
                    } else {
                        $toast.error(`Something went wrong`,{position: 'top-right'});
                    }
                })
            }
        })
    }
</script>
<style scoped>
.login-info-message {
    background: #ffa500;
    font-weight: 500 !important;
    padding: 5px;
    color: #2c2c2c !important;
}
.invalid-feedback{
    color: red;
    font-size: 12px;
    text-align: left;
}
.Authentication_right--logo img.logoImage {
    width: 266px;
}
</style>