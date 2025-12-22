<template>
    <div class="createplan_wrapper">
        <div class="font-size-22">
            Create A Plan
        </div>
        <div class="container"> 
            <div class="item">
                <label for="Plan Name" class="createPlan_label">
                    Plan Name<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.planName.value"
                    :disabled="isEdit"
                    placeHolder="Plan Name" type="text" id="Plan Name" tabindex="1" @keyup="checkErrors({
                            'field': formData.planName,
                            'name': formData.planName.name,
                            'validations': formData.planName.rules,
                            'type': formData.planName.type,
                            'event': $event.event
                        })" 
                        inputId="refplanName" 
                    />
                <div class="invalid-feedback red">{{ formData.planName.error }}</div>
            </div>
            <div class="item">
                <label for="User Roles" class="createPlan_label">
                    Contact Support
                    <span class="custom-popover position-re pl-5px">
                        <img src="@/assets/images/help_icon.png" alt="">
                        <span class="popover-content">Selecting YES will create a Sales Plan, while selecting NO will create a Regular Plan with pricing. Please choose accordingly.</span>
                    </span>
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" :disabled="isEdit" class="mr-10px radio" name="radio-group-contact-support" v-model="formData.isContactSupport"
                            id="isContactSupportYes" :value="true">
                        <label for="isContactSupportYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" :disabled="isEdit" class="mr-10px radio" name="radio-group-contact-support" v-model="formData.isContactSupport"
                            id="isContactSupportNo" :value="false">
                        <label for="isContactSupportNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item" v-if="formData.isContactSupport">
                <label for="Support Link" class="createPlan_label">
                    Support Link<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.supportLink.value"
                    placeHolder="Support Link" type="text" id="Support Link" tabindex="2" @keyup="checkErrors({
                            'field': formData.supportLink,
                            'name': formData.supportLink.name,
                            'validations': formData.supportLink.rules,
                            'type': formData.supportLink.type,
                            'event': $event.event
                        })" 
                        inputId="refsupportLink" 
                    />
                <div class="invalid-feedback red">{{ formData.supportLink.error }}</div>
            </div>
        </div>
        <div class="container mt-5px" v-if="!formData.isContactSupport">
            <div class="item">
                <label for="Plan Name" class="createPlan_label">
                    Per User Month Price<span class="red">*</span>
                </label>
                <div class="currency-input">
                    <InputText class="form-control" v-model.trim="formData.monthlyPrice.value"
                        placeHolder="Per User Month Price" type="text" id="Plan Name" tabindex="1" 
                        :maxlength="'10'"
                        :disabled="isEdit"
                        @keyup="checkErrors({
                                'field': formData.monthlyPrice,
                                'name': formData.monthlyPrice.name,
                                'validations': formData.monthlyPrice.rules,
                                'type': formData.monthlyPrice.type,
                                'event': $event.event
                            })" 
                        inputId="refmonthlyPrice" 
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                </div>
                <div class="invalid-feedback red">{{ formData.monthlyPrice.error }}</div>
            </div>
            <div class="item">
                <label for="Year Price" class="createPlan_label">
                    Per User Year Price<span class="red">*</span>
                </label>
                <div class="currency-input">
                    <InputText class="form-control" v-model.trim="formData.yearlyPrice.value"
                        placeHolder="Per User Year Price" type="text" id="Year Price" tabindex="1" 
                        :maxlength="'10'"
                        :disabled="isEdit"
                        @keyup="checkErrors({
                                'field': formData.yearlyPrice,
                                'name': formData.yearlyPrice.name,
                                'validations': formData.yearlyPrice.rules,
                                'type': formData.yearlyPrice.type,
                                'event': $event.event
                            })" 
                        inputId="refyearlyPrice" 
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                </div>
                <div class="invalid-feedback red">{{ formData.yearlyPrice.error }}</div>
            </div>
        </div>
        <div class="mt-5px">
            <label for="Description" class="createPlan_label">
                Description<span class="red">*</span>
            </label>
            <InputTextarea class="form-control" v-model="formData.planDescription.value"
                :height="'100px'"
                placeHolder="Description" type="text" id="Description" tabindex="1"
                @keyup="checkErrors({
                    'field': formData.planDescription,
                    'name': formData.planDescription.name,
                    'validations': formData.planDescription.rules,
                    'type': formData.planDescription.type,
                    'event': $event.event
                })"
                :preventEnter="false"
                inputId="refplanDescription"
            />
            <div class="invalid-feedback red">{{ formData.planDescription.error }}</div>
        </div>
    </div>
    
</template>
<script setup>
    import InputText from '@/components/atom/InputText/InputText';
    import InputTextarea from '@/components/atom/InputTextarea/InputTextarea';
    import { useValidation } from "@/composable/Validation.js";

    const formData = defineModel()

    defineProps({
        isEdit: {
            type: Boolean,
            default: false,
        }
    })

    const { checkErrors } = useValidation();

    function onlyNumber(event) {
        const char = String.fromCharCode(event.keyCode)
        if (!/^\d*\.?\d*$/.test(char)) {
          event.preventDefault();
        }
    }
    function onlyNumberPaste(event) {
        if (!/^\d*\.?\d*$/.test(event.clipboardData.getData('text'))) {
            event.preventDefault();
        }
    }
</script>
<style scoped src="./style.css"></style>