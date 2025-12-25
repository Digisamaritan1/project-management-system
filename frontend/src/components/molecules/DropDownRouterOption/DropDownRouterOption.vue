<template>
    <router-link
        :id="id"
        class="link-do d-flex align-items-center  hover-bg-lighter-gray-dropdown hover-purple cursor-pointer text-nowrap drop-down-item gray81 p-7px"
        :class="{'bg-gray91 border-radius-8-px': clientWidth <= 767 , 'border-radius-4-px' : clientWidth > 767,'bg-blue white': highlight}"
        @click.stop="$emit('click')"
        :to="item.to"
    >
        <slot>
            <div class="d-flex align-items-center project-mobile-desc hover-purple">
                <img class="drop-down-options-image mr-10px w-15px" :src="item.image" v-if="item && item.image" alt="image">
                <span class="project-mobile-desc hover-purple">{{item.label}}</span>
            </div>
        </slot>
    </router-link>
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
                image: "",
                to: ""
            }
        }
    },
    id: {
        type: String,
        default: ""
    },
    highlight: {
        type: Boolean,
        default: false
    },
})

const clientWidth = ref(document.body.clientWidth);
onMounted(() => {
    clientWidth.value = document.body.clientWidth;
})
</script>

<style>
@import "./style.css";
</style>