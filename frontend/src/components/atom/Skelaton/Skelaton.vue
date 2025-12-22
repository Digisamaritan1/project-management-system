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
/* .skelaton-loader {
    animation: loading 1s infinite;
} */

/* @keyframes pulse-bg {
    0% {
      background-color: #2f3990;
    }
    50% {
      background-color: #f241cd;
    }
    100% {
      background-color: #41d7ff;
    }
} */

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