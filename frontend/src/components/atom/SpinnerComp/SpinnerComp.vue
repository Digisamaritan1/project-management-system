<template>
    <div v-if="isSpinner">
        <div class="spinner"></div>
    </div>
</template>

<script setup>
import { defineProps } from "vue";
defineProps({
    isSpinner: {
        type: Boolean,
        default: false
    },
})

</script>

<style scoped>

.spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    animation: spin 2s linear infinite;
    z-index: 1;
}

@keyframes spin {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}
</style>