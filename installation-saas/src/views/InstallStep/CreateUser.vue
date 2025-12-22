<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <InputText
                            id="firstName"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.firstName.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.firstName,
                            'name':formData.firstName.name,
                            'validations':formData.firstName.rules,
                            'type':formData.firstName.type,
                            'event':$event.event})"
                            @input="formData.firstName.value = formData.firstName.value"
                            maxlength="254"
                            ref="firstName"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.firstName.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <InputText
                            id="lastName"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.lastName.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.lastName,
                            'name':formData.lastName.name,
                            'validations':formData.lastName.rules,
                            'type':formData.lastName.type,
                            'event':$event.event})"
                            @input="formData.lastName.value = formData.lastName.value"
                            maxlength="254"
                            ref="lastName"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.lastName.error}}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="email">Email ID</label>
                        <InputText
                            id="email"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model.trim="formData.email.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.email,
                            'name':formData.email.name,
                            'validations':formData.email.rules,
                            'type':formData.email.type,
                            'event':$event.event})"
                            @input="formData.email.value = formData.email.value"
                            maxlength="254"
                            ref="email"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.email.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10"></div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <InputText
                            id="password"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.password.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.password,
                            'name':formData.password.name,
                            'validations':formData.password.rules,
                            'type':formData.password.type,
                            'event':$event.event}), updateConfirmation()"
                            @input="formData.password.value = formData.password.value"
                            maxlength="254"
                            ref="password"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.password.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <InputText
                            id="confirmPassword"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.confirmPassword.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="confirmationPassValidation()"
                            @input="formData.confirmPassword.value = formData.confirmPassword.value"
                            maxlength="254"
                            ref="confirmPassword"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{confirmationErr}}</div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <div class="mt-20 font-size-20">
                    For any further queries, please refer to our <a href="https://help.alianhub.com/app-installation-and-start-guide/4.-installation-guide/4.10-final-step" target="_blank" class="blue font-weight-600">documentation.</a>
                </div>
                <button class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20" :disabled="!isSubmitSend" :class="{'disabled': !isSubmitSend}" @click="handleSubmit" tabindex="3">Submit</button>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { defineEmits, ref } from "vue";
    import InputText from "@/components/atom/InputText/InputText.vue";
    import { useValidation } from "@/composable/Validation.js";
    const  { checkErrors , checkAllFields } = useValidation();
    const emit = defineEmits(["complete"]);
    const confirmationErr = ref("");
    const formData = ref({
        firstName: {
            value: "",
            rules:
            "required | regex:^[a-zA-Z]+$",
            name: "First Name",
            error: "",
        },
        lastName: {
            value: "",
            rules:
            "required | regex:^[a-zA-Z]+$",
            name: "Last Name",
            error: "",
        },
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
            "required | regex: ^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$ | min:8",
            name: "Password",
            error: "",
        },
        confirmPassword: {
            value: "",
            name: "Confirm Password",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Create User",
        subStep: 1
    })
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
    const handleSubmit = () => {
        isSubmitSend.value = false;
        if(formData.value.confirmPassword.value === ''){
            confirmationErr.value = 'The confirm password field is required'
        }else if(formData.value.password.value !== formData.value.confirmPassword.value){
            confirmationErr.value = 'The confirm password confirmation does not match'
        }
        checkAllFields(formData.value).then((valid)=>{
            if(valid && confirmationErr.value === ''){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    firstName: formData.value.firstName.value,
                    lastName: formData.value.lastName.value,
                    email: formData.value.email.value,
                    password: formData.value.password.value
                });
            } else {
                stepDesc.value.subStep = 1;
                isSubmitSend.value = true;
            }
        })
    }
</script>
<style scoped>

</style>