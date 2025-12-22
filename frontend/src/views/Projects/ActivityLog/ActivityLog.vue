<template>
    <div>
        <ActivityLog :data-obj="projectData" :from-project="true"/>
    </div>
</template>

<script setup>
import { defineComponent } from 'vue';
import ActivityLog from '@/components/templates/ActivityLog/ActivityLog.vue';

defineComponent({
    name: 'ActivityLog',
    components: {
        ActivityLog
    }
})
defineProps({
    projectData: Object,
});
</script>