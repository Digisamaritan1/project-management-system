<template>
    <div class="skelaton-loader"></div>
</template>

<script setup>
import { defineComponent } from "vue";

defineComponent({
    name: "skelaton-loader"
})
</script>

<style lang="css" scoped>
.skelaton-loader {
    animation: pulse-bg 1s infinite;
}

@keyframes pulse-bg {
    0% {
      background-color: #ddd;
    }
    50% {
      background-color: #d0d0d0;
    }
    100% {
      background-color: #ddd;
    }
}
</style>