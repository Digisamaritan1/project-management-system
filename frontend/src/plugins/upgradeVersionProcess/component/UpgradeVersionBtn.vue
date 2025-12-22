<template>
    <button @click="clickReleaseNoteModel" class="white border-0 cursor-pointer align-items-center d-flex mr-0 update-now-btn">{{$t('Upgrades.update_now')}}</button>
</template>
<script setup>
    import {
        defineEmits
    } from "vue";
    const emit = defineEmits(["clickReleaseNoteModel"]);
    const clickReleaseNoteModel = () => {
        emit("clickReleaseNoteModel", true)
    }
</script>