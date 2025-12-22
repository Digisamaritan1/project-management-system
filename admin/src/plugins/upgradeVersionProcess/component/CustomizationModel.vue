<template>
    <div class="customization-note-section">
        <div class="position-re spinner-box" v-if="loading">
            <SpinnerComp :is-spinner="loading" />
        </div>
        <div class="customization-main-section text-center" v-if="!loading">
            <p class="font-size-36 font-weight-700 line-height-48_8 blue">Attention! Your Code is Unique</p>
            <p class="m-0 mb-15px font-size-22">We noticed your code has custom modifications. Proceeding with the upgrade might reset these changes. Please contact <a href="mailto:support@aliansoftware.net">support</a> for upgradation or create ticket <a href="https://console.alianhub.com/" target="_blank">here</a>.</p>
        </div>
    </div>
</template>
<script setup>
    import {
        defineProps,
    } from "vue";
    import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue";

    defineProps({
        loading: {
            type: Boolean
        }
    });
</script>