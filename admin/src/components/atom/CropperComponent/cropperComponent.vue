<template lang="">
    <div class="d-flex justify-content-center cropper_main" id="cropper_main">
        <Cropper
            class="cropper"
            :src="image"
            :stencil-size="stencilSize"
            :stencil-props="stencilProps"
            :zoom="zoom"
            image-restriction="stencil"
            @ready="onReady"
            ref="cropper1"
        />
    </div>
</template>
<script setup>

import { ref, defineProps } from 'vue';
import { Cropper } from 'vue-advanced-cropper';

const cropper1 = ref(null)
const emit = defineEmits('getCropper');

const props = defineProps({
    image: {
        type: String
    },
    stencilProps: {
        type: Object,
        default: () => ({
            handlers: {},
            movable: false,
            resizable: false,
            aspectRatio: 1,
        })
    },
    change: {
        type: Function
    },
    zoom: {
        type: Number,
        default: 0.1
    },
    stencilSize: {
        type: Object,
        default: () => ({
            width: 180,
            height: 180
        })
    }
})

const onReady = () => {
    if (cropper1.value) {
        emit('getCropper', cropper1.value)
        const rootCss = document.querySelector(':root');
        rootCss.style.setProperty('--width', props.stencilSize.width + 'px')
        rootCss.style.setProperty('--height', props.stencilSize.height + 'px')
    }
};

</script>
<style src="./style.css"></style>