<template>
    <div>
        <h3 class="text-center">{{ envVariables.title }}</h3>
        <p class="text-center">{{ envVariables.description }}</p>
        <div class="d-flex flex-wrap step-form-container">
            <div v-for="(field, index) in envFields" :key="index" class="mb-20px step-form-div">
                <label :for="field.envFieldName" class="step-form-label">{{ field.label }}</label>
                <div>
                    <div v-if="field.type === 'text'">
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
                        <div class="red" >{{field.error }}</div>
                    </div>
                    <div v-if="field.type === 'checkbox'">
                        <input
                            type="checkbox"
                            v-model="envFormValues[field.envFieldName].value"
                        />
                    </div>
                    <DropDown v-if="field.type === 'dropdown'">
                        <template #button>
                            <div :ref="uniqueId+field.label" class="dropdown-button">{{`${field.value ? field.value : field.placeholder}`}}</div>
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
                                <span class="ml-10px">{{ option.value }}</span>
                            </DropDownOption>
                        </template>
                    </DropDown>
                    <div v-if="field.type === 'dropdown'" class="red" >{{field.error }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, watch } from 'vue';
import InputComponent from '@/components/atom/InputText/InputText.vue';
import DropDown from '../DropDown/DropDown.vue';
import DropDownOption from '../DropDownOption/DropDownOption.vue';
import { useValidation } from "@/composable/Validation";
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
    padding: 0px 15px;
    width: 50%;
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
    width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    padding: 20px;
}
</style>