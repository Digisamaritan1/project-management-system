<template>
    <div v-if="isSpinner" class="d-flex align-items-center justify-content-center lds-roller h-100dvh dashboard-spinner">
        <img :src="logo" alt="logo" class="position-ab z-index-1 company__logo">
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
const logo = "/api/v1/getlogo?key=logo&type=desktop";

</script>

<style scoped>

/* From Uiverse.io by Vazafirst */ 
.dashboard-spinner {
    position: fixed;
    height: 100vh;
    width: 100vw;
    z-index: 1;
    top: 0;
    left: 0;
}

</style>