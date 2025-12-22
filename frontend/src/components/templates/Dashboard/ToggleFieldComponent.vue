<template>
    <div class="custom-field custom-field-toogle">
        <label :for="`fields-${index}`">{{ $t(`dashboardCard.${field?.label}`) }}</label>
        <div class="toggle-wrapper">
            <label class="toggle-label">
                <input 
                    type="checkbox" 
                    :name="field?.name" 
                    :disabled="field?.disabled"
                    :checked="currentValue"
                    @change="updateValue"
                />
                <span class="toggle-slider"></span>
            </label>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    field: {
        type: Object,
        required: true
    },
    formObj: {
        type: Object,
        required: true
    },
    index: {
        type: [Number,String],
        required: false
    }
});

const emit = defineEmits(['update:formObj']);

const currentValue = computed(() => props.formObj[props.field?.name]?.value);

const updateValue = (event) => {
    const newFormObj = { 
        ...props.formObj, 
        [props.field.name]: {
            ...props.formObj[props.field.name],
            value: event.target.checked
        }
    };

    emit('update:formObj', newFormObj);
};
</script>

<style scoped src="../../../components/molecules/CardFieldComponent/style.css"></style>