<template>
    <div class="image-item-wrapper">
        <!-- IMAGE WRAPPER -->
        <div class="images" :class="{ 'selected': selected }" @click="$emit('click', $event)" draggable="false">
            <img 
                :src="previewData.url" 
                :alt="previewData.alt || ''" 
                :id="`image_item_${index}`" 
                loading="lazy"
                draggable="false" 
                :style="[{ width: previewData.width }]"
                @error="previewData = { ...props.image, ...getFileImage('DEFAULT') }">
        </div>
        <!-- NAME -->
        <span draggable="false" :title="`${previewData.name || ''}`" class="image-name">{{ previewData.name || ''}}</span>
    </div>
</template>

<script setup>
import {defineProps, ref, watch} from "vue";

import { fileImageReplacer } from "@/components/organisms/ImagePreviewer/hepler";

const props = defineProps({
    image: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    selected: {
        type: Boolean,
        required: true
    }
})

const {getFileImage} = fileImageReplacer();

const previewData = ref(props.image)

watch(() => props.image, (val) => {
    if(val.type === "image") {
        previewData.value = JSON.parse(JSON.stringify(props.image));
    } else {
        previewData.value = {...props.image, ...getFileImage(val?.type, val?.ext)};
    }
}, {immediate: true})
</script>

<style lang="css" scoped>
@import url("./style.css");
</style>