<template>
   <div>
        <progress :id="id" :value="value" max="100" class="w-100"></progress>
  </div>
</template>

<script setup>
import { defineComponent } from "vue";

defineComponent({
    name: 'Progress-Comp'
})
defineProps({
    value: {
        type: Number,
        required: true,
        default: 0
    },
    id: {
      type: String,
      required: true
    },
})
</script>