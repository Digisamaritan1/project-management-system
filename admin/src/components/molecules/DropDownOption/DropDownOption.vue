<template>
    <div
        class="d-flex align-items-center  hover-bg-lighter-gray-dropdown hover-purple cursor-pointer text-nowrap drop-down-item gray81 p-7px"
        :class="{'bg-gray91 border-radius-8-px': clientWidth <= 767 , 'border-radius-4-px' : clientWidth > 767}"
        @click.stop.prevent="$emit('click')"
    >
        <slot>
            <div class="d-flex align-items-center project-mobile-desc">
                <img class="drop-down-options-image mr-10px w-15px" :src="item.image" v-if="item && item.image" alt="image">
                <span class="project-mobile-desc">{{item.label}}</span>
            </div>
        </slot>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, ref } from "vue";

defineEmits(["click"]);
defineProps({
    item: {
        type: Object,
        default: () => {
            return {
                label: "Item",
                image: ""
            }
        }
    }
})

const clientWidth = ref(document.body.clientWidth);
onMounted(() => {
    clientWidth.value = document.body.clientWidth;
})
</script>

<style>
@import "./style.css";
</style>