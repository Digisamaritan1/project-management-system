<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="chargebeeSite">Chargebee Site</label>
                        <InputText
                            id="chargebeeSite"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.chargebeeSite.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.chargebeeSite,
                            'name':formData.chargebeeSite.name,
                            'validations':formData.chargebeeSite.rules,
                            'type':formData.chargebeeSite.type,
                            'event':$event.event})"
                            @input="formData.chargebeeSite.value = formData.chargebeeSite.value"
                            maxlength="254"
                            ref="chargebeeSite"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.chargebeeSite.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="chargebeeAPIKey">Chargebee API Key</label>
                        <InputText
                            id="chargebeeAPIKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.chargebeeAPIKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.chargebeeAPIKey,
                            'name':formData.chargebeeAPIKey.name,
                            'validations':formData.chargebeeAPIKey.rules,
                            'type':formData.chargebeeAPIKey.type,
                            'event':$event.event})"
                            @input="formData.chargebeeAPIKey.value = formData.chargebeeAPIKey.value"
                            maxlength="254"
                            ref="chargebeeAPIKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.chargebeeAPIKey.error}}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="chargebeePublishKey">Chargebee Publish Key</label>
                        <InputText
                            id="chargebeePublishKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.chargebeePublishKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.chargebeePublishKey,
                            'name':formData.chargebeePublishKey.name,
                            'validations':formData.chargebeePublishKey.rules,
                            'type':formData.chargebeePublishKey.type,
                            'event':$event.event})"
                            @input="formData.chargebeePublishKey.value = formData.chargebeePublishKey.value"
                            maxlength="254"
                            ref="chargebeePublishKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.chargebeePublishKey.error}}</div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <div class="mt-20 font-size-20">
                    For any further queries, please refer to our <a href="https://help.alianhub.com/app-installation-and-start-guide/4.-installation-guide/4.7-payment-configuration/4.7.1-chargebee-configuration" target="_blank" class="blue font-weight-600">documentation.</a>
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
        chargebeeSite: {
            value: "",
            rules:
            "required",
            name: "Chargebee Site",
            error: "",
        },
        chargebeeAPIKey: {
            value: "",
            rules:
            "required",
            name: "Chargebee API Key",
            error: "",
        },
        chargebeePublishKey: {
            value: "",
            rules:
            "required",
            name: "Chargebee Publish Key",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Verification Your Chargebee",
        subStep: 1
    })
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    chargebeeSite: formData.value.chargebeeSite.value,
                    chargebeePublishKey: formData.value.chargebeePublishKey.value,
                    chargebeeAPIKey: formData.value.chargebeeAPIKey.value
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