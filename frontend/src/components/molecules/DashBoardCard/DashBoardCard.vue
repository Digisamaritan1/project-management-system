<template>
  <div class="my-component dashboard-container" ref="containerRef" style="overflow:hidden;">
    <div class="cardHeader">
      <span class="font-size-18 font-weight-bold text-ellipsis w-85" :title="title">{{ title }}</span>  
      <span class="cursor-pointer dashboard-container-setting-controller">
        <img :src="editIcon" style="height:14px;width:14px;" class="mr-10px" @click="$emit('edit-card', id)"/>
        <img :src="closeIcon" @click="$emit('delete-card', id)"/><!-- Emit event -->
      </span>
  </div>
  <div class="content">
    <slot></slot>
  </div>
</div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, ref, provide, onUnmounted} from 'vue';
const closeIcon = require("@/assets/images/svg/CloseSidebar.svg");
const editIcon = require("@/assets/images/svg/Setting_icon.svg");
defineProps({
  title: {
    type:String,
    default: ""
  },
  id: {
    type:String,
    default: ''
  },
  componentId : {
    type: String,
    default: ''
  }
});
const containerRef = ref(null)
const containerWidth = ref(0)
let resizeObserver = null;
onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(([entry]) => {
      containerWidth.value = entry.contentRect.width
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value);
    resizeObserver.disconnect();
  }
})
provide("$containerWidth", containerWidth);
defineEmits(['delete-card','edit-card']); // Define delete-card event
</script>



<style scoped>
.my-component {
  height: 100%;
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
}
h2 {
  margin: 0;
  font-size: 1.5em;
}
.content {
  margin-top: 8px;
  height: calc(100% - 35px);
}
.cardHeader {
  display: flex;
  justify-content: space-between;
}
.dashboard-container {
  container-type: inline-size; /* Enables container queries */
  container-name: dashboard; /* This name is referenced in @container */
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
}
.dashboard-container-setting-controller {
  min-width: 38px;
}
</style>
