<template>
    <div class="custom-field" :class="{'d-flex align-items-center justify-content-between': clientWidth > 480}">
        <label :for="`field-text-${index}`" class="custom-field-label" :class="{'w-35': clientWidth > 480,'mb-5px': clientWidth <= 480}">{{ $t(`dashboardCard.${field?.label}`) }}</label>
        <div class="position-re" :class="{'w-65': clientWidth > 480}">
            <input 
                class="custom-field-input w-100"
                :class="{'border-red':formObj[field?.name]?.error}"
                :id="`field-${index}`"
                :type="field?.type"
                :name="field?.name"
                :placeholder="$t(`dashboardCard.${field?.placeHolder}`) || ''" 
                :disabled="field?.disabled"
                v-model.trim="modelValue"
                @input="handleInput($event)"
                @keyup="handleKeyUp($event)"
            />
            <div class="position-ab tooltip_position" v-if="formObj[field?.name]?.error">
                <ToolTip :isImage="true" :text="formObj[field?.name]?.error" />
            </div>
        </div>
    </div>
</template>

<script setup>
import ToolTip from '@/components/molecules/ToolTip/ToolTip.vue';
import { computed, inject } from 'vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    formObj: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:formObj', 'check-errors']);

const modelValue = computed(() => props.formObj[props.field?.name]?.value);
const clientWidth = inject("$clientWidth");

const handleInput = (event) => {
    const updatedFormObj = {
        ...props.formObj,
        [props.field.name]: {
            ...props.formObj[props.field.name],
            value: event?.target?.value?.trim()
        }
    };

    emit('update:formObj', updatedFormObj);
};

const handleKeyUp = (event) => {
    emit('check-errors', {
        'field': props.formObj[props.field?.name],
        'name': props.formObj[props.field?.name]?.name,
        'validations': props.formObj[props.field?.name]?.rules,
        'event': event
    });
};
</script>

<style scoped src="../../../components/molecules/CardFieldComponent/style.css"></style>