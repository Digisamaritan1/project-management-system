<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="paddleAPIKey">Paddle API Key</label>
                        <InputText
                            id="paddleAPIKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.paddleAPIKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.paddleAPIKey,
                            'name':formData.paddleAPIKey.name,
                            'validations':formData.paddleAPIKey.rules,
                            'type':formData.paddleAPIKey.type,
                            'event':$event.event})"
                            @input="formData.paddleAPIKey.value = formData.paddleAPIKey.value"
                            maxlength="254"
                            ref="paddleAPIKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.paddleAPIKey.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="paddleClientToken">Paddle Client Token</label>
                        <InputText
                            id="paddleClientToken"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.paddleClientToken.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.paddleClientToken,
                            'name':formData.paddleClientToken.name,
                            'validations':formData.paddleClientToken.rules,
                            'type':formData.paddleClientToken.type,
                            'event':$event.event})"
                            @input="formData.paddleClientToken.value = formData.paddleClientToken.value"
                            maxlength="254"
                            ref="paddleClientToken"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.paddleClientToken.error}}</div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <div class="mt-20 font-size-20">
                    For any further queries, please refer to our <a href="https://help.alianhub.com/app-installation-and-start-guide/4.-installation-guide/4.7-payment-configuration/4.7.2-paddle-configuration" target="_blank" class="blue font-weight-600">documentation.</a>
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

    const formData = ref({
        paddleAPIKey: {
            value: "",
            rules:
            "required",
            name: "Paddle API Key",
            error: "",
        },
        paddleClientToken: {
            value: "",
            rules:
            "required",
            name: "Paddle Client Token",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Verification Your Paddle",
        subStep: 1
    })
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    paddleAPIKey: formData.value.paddleAPIKey.value,
                    paddleClientToken: formData.value.paddleClientToken.value
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