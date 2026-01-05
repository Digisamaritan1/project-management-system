<template>
    <div v-if="step === 1">
        <div class="install-form">
            <div class="form-group storage-item-section">
                <div class="storage-item" v-for="(row, indexP) in storageArray" v-bind:key="indexP">
                    <div :class="{'selected-storage' : row.key === formData.chooseStorage.value}" @click="selectStorageOption(row.key)">
                        <img :src="row.imageSource" />
                        <span>{{ row.name }}</span>
                    </div>
                    <div class="storage-doc-link" v-if="row.key === 'wasabi'"><a :href="row.key === 'wasabi' ? 'https://wasabi.com/': ''" target="__blank">More Information</a></div>
                </div>
            </div>
            <div class="form-group">
                <button class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20" @click="storageSubmit" tabindex="3">Submit</button>
            </div>
        </div>
    </div>
    <div v-if="step === 2">
        <div class="install-form">
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="wasabiSecretAccessKey">Wasabi Secret Access Key</label>
                        <InputText
                            id="wasabiSecretAccessKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.wasabiSecretAccessKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.wasabiSecretAccessKey,
                            'name':formData.wasabiSecretAccessKey.name,
                            'validations':formData.wasabiSecretAccessKey.rules,
                            'type':formData.wasabiSecretAccessKey.type,
                            'event':$event.event})"
                            @input="formData.wasabiSecretAccessKey.value = formData.wasabiSecretAccessKey.value"
                            maxlength="254"
                            ref="wasabiSecretAccessKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.wasabiSecretAccessKey.error}}</div>
                    </div>
                </div>
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="wasabiAccessKey">Wasabi Access Key</label>
                        <InputText
                            id="wasabiAccessKey"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.wasabiAccessKey.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.wasabiAccessKey,
                            'name':formData.wasabiAccessKey.name,
                            'validations':formData.wasabiAccessKey.rules,
                            'type':formData.wasabiAccessKey.type,
                            'event':$event.event})"
                            @input="formData.wasabiAccessKey.value = formData.wasabiAccessKey.value"
                            maxlength="254"
                            ref="wasabiAccessKey"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.wasabiAccessKey.error}}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-10">
                    <div class="form-group">
                        <label for="wasabiUserId">Wasabi Account ID</label>
                        <InputText
                            id="wasabiUserId"
                            class="login-input mt-10"
                            placeHolder="XXXXXXX"
                            v-model="formData.wasabiUserId.value"
                            height="48px"
                            width="calc(100% - 32px)"
                            @keyup="checkErrors({'field':formData.wasabiUserId,
                            'name':formData.wasabiUserId.name,
                            'validations':formData.wasabiUserId.rules,
                            'type':formData.wasabiUserId.type,
                            'event':$event.event})"
                            @input="formData.wasabiUserId.value = formData.wasabiUserId.value"
                            maxlength="254"
                            ref="wasabiUserId"
                            type="text"
                            @enter="handleSubmit"
                        />
                        <div class="invalid-feedback red">{{formData.wasabiUserId.error}}</div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <div class="mt-20 font-size-20">
                    For any further queries, please refer to our <a href="https://help.alianhub.com/app-installation-and-start-guide/4.-installation-guide/4.4-wasabi-configuration" target="_blank" class="blue font-weight-600">documentation.</a>
                </div>
                <div style="display: flex;">
                    <button class="font-roboto-sans cursor-pointer btn-full mt-20 outline-primary mr-10" @click="backSubmit()">Back</button>
                    <button class="btn-blue btn-login font-roboto-sans bg-blue white cursor-pointer btn-full mt-20 ml-10" :disabled="!isSubmitSend" :class="{'disabled': !isSubmitSend}" @click="handleSubmit" tabindex="3">Submit</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { defineEmits, ref } from "vue";
    import InputText from "@/components/atom/InputText/InputText.vue";
    import { useValidation } from "@/composable/Validation.js";
    import defualtStorageImg from "@/assets/images/svg/defualt_storage.png";
    import wasabiLogoImg from "@/assets/images/svg/wasabi_logo.png";
    const  { checkErrors , checkAllFields } = useValidation();
    const emit = defineEmits(["complete"]);

    const storageArray = ref([{
        name: "Default",
        key: "default",
        imageSource: defualtStorageImg
    }, {
        name: "Wasabi",
        key: "wasabi",
        imageSource: wasabiLogoImg
    }]);

    const formData = ref({
        wasabiSecretAccessKey: {
            value: "",
            rules:
            "required",
            name: "Secret Access Key",
            error: "",
        },
        wasabiAccessKey: {
            value: "",
            rules:
            "required",
            name: "Access Key",
            error: "",
        },
        wasabiUserId: {
            value: "",
            rules:
            "required",
            name: "User Id",
            error: "",
        },
        chooseStorage: {
            value: "default"
        }
    });
    const isSubmitSend = ref(true);
    const stepDesc = ref({
        name: "Verification Your Wasabi",
        subStep: 1
    })
    const step = ref(1);
    
    const selectStorageOption = (val) => {
        formData.value.chooseStorage.value = val;
    }
    const storageSubmit = () => {
        if (formData.value.chooseStorage.value === "default") {
            stepDesc.value.subStep = 2;
            isSubmitSend.value = true;

            emit("complete", {
                wasabiSecretAccessKey: "",
                wasabiUserId: "",
                wasabiAccessKey: "",
                chooseStorage: formData.value.chooseStorage.value
            });
            return;
        }

        step.value = 2;
    }
    const backSubmit = () => {
        step.value = 1;
    }
    const handleSubmit = () => {
        isSubmitSend.value = false;
        checkAllFields(formData.value).then((valid)=>{
            if(valid){
                stepDesc.value.subStep = 2;
                isSubmitSend.value = true;
                emit("complete", {
                    wasabiSecretAccessKey: formData.value.wasabiSecretAccessKey.value,
                    wasabiUserId: formData.value.wasabiUserId.value,
                    wasabiAccessKey: formData.value.wasabiAccessKey.value,
                    chooseStorage: formData.value.chooseStorage.value
                });
            } else {
                stepDesc.value.subStep = 1;
                isSubmitSend.value = true;
            }
        })
    }
</script>
<style scoped>
    .storage-item-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }

    .storage-item-section .storage-item {
        border: 2px solid #ececec;
        border-radius: 5px;
        padding: 10px;
        width: 48%;
        justify-content: center;
        text-align: center;
        cursor: pointer;
        box-sizing: border-box;
    }

    .storage-item-section .storage-item span {
        display: block;
        padding-top: 10px;
    }

    .storage-item-section .storage-item img {
        max-width: 70px;
        border-radius: 5px;
    }

    .storage-item-section .storage-item:hover {
        box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
    }
    .storage-item-section .storage-item:has(.selected-storage) {
        border: 2px solid #2f3990;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
    }
    .selected-storage span {
        font-weight: 500;
        color: #2F3990;
    }
    .storage-doc-link {
        top: 40px;
        position: relative;
    }
</style>