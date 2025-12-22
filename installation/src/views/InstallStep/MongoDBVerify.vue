<template>
    <div v-if="stepDesc.subStep === 1">
        <div class="install-form">
            <div class="row">
                <div class="col-md-12 mb-10">
                    <div class="form-group">
                        <label for="mongodbUrl">Mongodb Url</label>
                        <InputText
                            id="mongodbUrl"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.mongodbUrl.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.mongodbUrl,
                            'name':formData.mongodbUrl.name,
                            'validations':formData.mongodbUrl.rules,
                            'type':formData.mongodbUrl.type,
                            'event':$event.event})"
                            @input="formData.mongodbUrl.value = formData.mongodbUrl.value"
                            maxlength="254"
                            ref="mongodbUrl"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.mongodbUrl.error}}</div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <div class="mt-20 font-size-20">
                    For any further queries, please refer to our <a href="https://help.alianhub.com/app-installation-and-start-guide/4.-installation-guide/4.2-mongodb-verification" target="_blank" class="blue font-weight-600">documentation.</a>
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
        mongodbUrl: {
            value: "",
            rules:
            "required",
            name: "MongoDb Url",
            error: "",
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Verification Your MongoDb",
        subStep: 1
    })
    
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    mongodbUrl: formData.value.mongodbUrl.value.replace(/\/+$/, "")
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