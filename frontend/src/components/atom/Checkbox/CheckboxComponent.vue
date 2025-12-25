<template>
    <div :class="customClass" class="main-checkbox-component">
        <input
            type="checkbox"
            class="checkbox-input"
            :id="id"
            v-model="model"
            @input="handleChange"
            :value="value"
            :class="customClasses"
            :disabled="disabled"
        />
        <label :class="labelClass" :for="id" :title="text">{{ text }}</label>
    </div>
</template>

<script setup>
// Packages
import { defineProps, defineEmits } from "vue";

//Props
defineProps({
    id: { type: [String] },
    text: { type: [String] },
    modelValue: { type: [Boolean, Object, Array, String, Number] },
    value: { type: [Boolean, Object, Array, String, Number] },
    customClasses: { type: [String] },
    labelClass: { type: [String] },
    customClass: { type: [String] },
    disabled: { type: [Boolean], default: false },
});

// Emits
const emits = defineEmits(["update:modelValue", "input"]);

// Computed properties
const model = defineModel()

function handleChange(event) {
    emits('input', event)
}

</script>
<style src="./style.css" scoped/>