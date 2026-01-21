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
@keyframes loading {
  to {
    background-position-x: -20%;
  }
}
.skelaton-loader {
  background-color: #d0d0d0;
  background: linear-gradient(
    100deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  ) #000000;
  background-size: 200% 100%;
  background-position-x: 180%;
  animation: 1s loading ease-in-out infinite;
}
</style>