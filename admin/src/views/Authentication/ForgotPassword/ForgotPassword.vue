<template>
    <AuthTemplate>
        <div>
            <div class="Authentication_right--form">
                <div class="Authentication_right--logo">
                <img :src="logoImage"/>
                </div>
                <h3>Forgot Password</h3>
                <form action="#" @submit.prevent="handleSubmit">
                    <div class="form-group mb-20">
                        <label class="font-14 d-block text-left text-gray">
                        Email ID<span class="text_red">*</span>
                        </label>
                        <InputComponent
                            v-model.trim="formData.email.value"
                            type="text"
                            :placeHolder="'Enter your email'"
                            @keyup="checkErrors({'field':formData.email,
                            'name':formData.email.name,
                            'validations':formData.email.rules,
                            'type':formData.email.type,
                            'event':$event.event})"
                            :max-length="254"
                        ></InputComponent>
                        <div class="invalid-feedback">{{formData.email.error}}</div>
                    </div>
                    <button v-if="!isSpinner" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500 w-100">
                        Forgot Password
                    </button>
                    <button v-else type="button" class="btn btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer font-weight-500 btn-disabled w-100" disabled><span id="btn-spinner"></span>Loading...</button>
                </form>
            </div>
            <div class="createAccount_link mt-30 mb-20">
                <p class="font-18 text-gray">
                Remember password? <router-link to="/signin" class="light-purple font-weight-500">Sign In</router-link>
                </p>
            </div>
        </div>
    </AuthTemplate>
</template>
<script setup>
    import AuthTemplate from "@/components/templates/Authentication/AuthIndex.vue";
    import InputComponent from '@/components/atom/InputText/InputText.vue';
    
    import { ref } from "vue";
    import { useValidation } from "../../../composable/Validation";
    import * as env from '@/config/env';
    import { useRouter } from "vue-router";
    import { useToast } from "vue-toast-notification"
    import { apiRequestWithoutSecure } from '@/services';

    const  { checkErrors, checkAllFields } = useValidation();
    const router = useRouter();
    const $toast = useToast();

    const formData = ref({
        email: {
            value: "",
            rules:
            "required | regex: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,}$",
            name: "Email",
            error: "",
        },
    })
    const logoImage = env.GET_LOGO + '?key=logo&type=admin';
    const isSpinner = ref(false);

    const handleSubmit = () =>{
        checkAllFields(formData.value).then(async (valid)=>{
            if(valid){
                isSpinner.value = true;
                const reqObj = {
                    email: formData.value.email.value,
                    key: 'admin'
                }
                apiRequestWithoutSecure("post", env.FORGOTPASSWORD, reqObj).then(() => {
                    isSpinner.value = false;
                    $toast.success("Password reset email has been sent successfully",{position: 'top-right'})
                    router.push({name:'Signin'})
                }).catch((error) => {
                    isSpinner.value = false;
                    if (error?.response?.data?.message.includes('user not found')) {
                        $toast.error('No account found for given email.',{position: 'top-right'})
                    } else if (error?.response?.data?.message.includes('Auth.too_many_request')) {
                        $toast.error("You have sent too many requests in a given amount of time. Please wait and try again later.",{position: 'top-right'})
                    } else {
                        $toast.error('something went wrong.',{position: 'top-right'})
                    }
                })
            }
        })
}
</script>
<style scoped>
    .invalid-feedback{
        color: red;
        font-size: 12px;
        text-align: left;
    }
</style>