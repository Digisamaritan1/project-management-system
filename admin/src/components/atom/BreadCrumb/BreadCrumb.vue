<template>
    <div class="d-flex">
        <div v-for="(ele,index) in breadCrumb" :key="index">
            <span @click="ele.isClickable ? $router.push(ele.routeObj) : ''" :class="{'cursor-pointer' : ele.isClickable}" class="breadcrumb-text">{{ele.name}}</span>
            <span v-if="index !== breadCrumb.length-1" class="mr-5px"> - </span>
        </div>
    </div>
</template>
<script setup>
    import {defineProps, ref, watch} from "vue";
    const props = defineProps({
        breadCrumbArray: {
            type: Array,
            default: () => []
        }
    })

    const breadCrumb = ref(props.breadCrumbArray);

    watch(() => props.breadCrumbArray, (newVal) => {
       breadCrumb.value = newVal
    })
</script>
<style scoped src="./style.css">
</style>