<template>
    <img :src="frameImage" alt="frameImage" class="mb-1 mw-100">
    <div class="style-scroll overflow-auto archieve__titledesc--wrapper text-center w-100 mw-100">
        <h4 class="text-center archive-delete-title font-weight-700 upgrade-h4 font-roboto-san">{{ title }}</h4>
        <p class="text-center font-weight-400 font-size-16 gray81 upgrade-p font-roboto-san">{{ message }}</p>
    </div>
    <div class="upgrade-now-sidebar cursor-pointer d-flex text-right align-items-center font-roboto-san">
        <div @click="$router.push({name: 'Upgrade', params: {cid: companyId}})">
            {{buttonText}}
        </div>
    </div>
</template>

<script setup>
    import { inject,defineProps } from "vue";

    const frameImage = require("@/assets/images/Frame.png");
    const companyId = inject("$companyId");

    defineProps({
        title: {
            type: String,
            default: "",
        },
        message: {
            type: String,
            default: "",
        },
        buttonText: {
            type: String,
            default: "",
        }
    })
</script>
<style src="./style.css">
</style>