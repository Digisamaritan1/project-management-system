<template>
    <div>
        <div class="text-center env-form-header mb-30px">
            <h3 class="text-center font-size-36 font-weight-700 line-height-48_8 blue">{{envVariables.title}}</h3>
            <p class="text-center m-0">{{ envVariables.description }}</p>
        </div>
        <div class="env-form-body">
            <div class="d-flex flex-wrap step-form-container">
                <div v-for="(field, index) in envFields" :key="index" class="mt-20px step-form-div">
                    <!-- <label :for="field.envFieldName" class="step-form-label">{{ field.label }}</label> -->
                    <!-- <div> -->
                        <div v-if="field.type === 'text'">
                            <label :for="field.envFieldName" class="step-form-label position-re">{{ field.label }} 
                                <ToolTip
                                    :image="infoIcon"
                                    class="tooltip-auto-update"
                                    :label="''"
                                    :isLabel="false"
                                    :descriptions="field.info"
                                />
                            </label>
                            <InputComponent
                                v-model="envFormValues[field.envFieldName].value"
                                :type="field.type"
                                :placeholder="field.placeholder"
                                @keyup="checkErrors({'field':field,
                                'name':field.label,
                                'validations':field.rules,
                                'type':field.type,
                                'checkLanguage': false,
                                'event':$event.event}),field.value = envFormValues[field.envFieldName].value"
                            />
                            <div class="red font-size-12" >{{field.error }}</div>
                        </div>
                        <div class="d-flex align-items-center" v-if="field.type === 'checkbox'">
                            <input
                                type="checkbox"
                                :id="field.envFieldName"
                                :name="field.envFieldName"
                                v-model="envFormValues[field.envFieldName].value"
                                @change="field.value = envFormValues[field.envFieldName].value"
                            />
                            <label :for="field.envFieldName" class="step-form-label mt-3px ml-5px">{{ field.label }}
                                <ToolTip
                                    :image="infoIcon"
                                    class="tooltip-auto-update"
                                    :label="''"
                                    :isLabel="false"
                                    :descriptions="field.info"
                                />
                            </label>
                        </div>
                        <div v-if="field.type === 'dropdown'">
                            <label :for="field.envFieldName" class="step-form-label">{{ field.label }}
                                <ToolTip
                                    :image="infoIcon"
                                    class="tooltip-auto-update"
                                    :label="''"
                                    :isLabel="false"
                                    :descriptions="field.info"
                                />
                            </label>
                            <DropDown :zIndex="8" :bodyClassHeader="{'env-from-dropdown': true}">
                                <template #button>
                                    <div :ref="uniqueId+field.label" class="dropdown-button">{{`${field.value ? field.options.find((x) => x.value === field.value)?.label : field.placeholder}`}} <img class="dropdown-image dropdown-arrow" src="@/assets/images/dropdown-arrow.png" alt="dropdown-arrow"></div>
                                </template>
                                <template #options>
                                    <DropDownOption
                                        v-for="(option, index) in field.options"
                                        :key="index"
                                        @click="field.value = option.value,
                                        $refs[uniqueId+field.label][0].click(),
                                        envFormValues[field.envFieldName].value = option.value,
                                        checkErrors({'field':field,
                                        'name':field.label,
                                        'validations':field.rules,
                                        'type':field.type,
                                        'checkLanguage': false,
                                        'event':$event}),field.value = envFormValues[field.envFieldName].value
                                        "
                                    >
                                        <span class="ml-10px">{{ option.label }}</span>
                                    </DropDownOption>
                                </template>
                            </DropDown>
                            <div class="red font-size-12" >{{field.error }}</div>
                        </div>
                    <!-- </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, watch } from 'vue';
import InputComponent from '@/components/atom/InputText/InputText.vue';
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue';
import { useValidation } from "@/composable/Validation";
import ToolTip from "@/components/molecules/ToolTip/ToolTip.vue";
const infoIcon = require("@/assets/images/help_icon.png");
import { useCustomComposable } from "@/composable";

const { checkErrors} = useValidation();
const {makeUniqueId} = useCustomComposable();
const uniqueId = ref(`${makeUniqueId(7)}`)

const props = defineProps({
    formValues: {
        type: Object,
        default: () => {}
    },
    envVariables: {
        type: Object,
        default: () => {}
    },
    fields: {
        type: Object,
        default: () => {}
    }
});
const envFormValues = ref(props.formValues);
const envFields = ref(props.fields)


watch(() => envFormValues, () => {
    envFields.value = props.fields;
},{ deep: true })

watch(() => props.fields, (newVal) => {
    envFields.value = newVal;
})

</script>
<style>
.step-form-div{
    width: 48%;
}
.step-form-label{
    font-family: 'roboto';
    font-size: 14px;
    font-weight: 500;
    line-height: 23.68px;
    text-align: left;
    color: #000;
}
.step-form-container{
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}
.step-form-container .step-form-div:first-child, .step-form-container .step-form-div:nth-child(2) {
    margin-top: 0px;
}
.cursor-pointer.env-from-dropdown {
    font-size: 13px;
    color: #818181;
}
.dropdown-image {
    padding-top: 4px;
    float: right;
}
.tooltip-auto-update {
    position: absolute;
    top: 0;
    right: -20px;
}
</style>