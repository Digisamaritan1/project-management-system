<template >
    <div class="tab-list-header">
        <ul class="tab-list-header-ul" role="tablist">
            <template v-for="(tab, key) in tabs">
                <TabListItem
                    v-if="!(isSupport && key === 'activity')"
                    :isActive="activeTab === key"
                    :key="key"
                    :tabKey="key"
                    :tab="tab"
                    :commentCounts="commentCounts"
                    @changeTab="$emit('changeTab', $event)"
                />
            </template>
        </ul>
    </div>
</template>

<script setup>
    import { defineProps, defineEmits, inject } from 'vue';
    import TabListItem from '@/components/molecules/TabListItem/TabListItem.vue';

    const isSupport = inject("isSupport");

    defineEmits(["changeTab"])

    defineProps({
        activeTab: {
            type: String,
            default: 'task-detail-tab'
        },
        tabs: {
            type: Object,
            default: () => {}
        },
        commentCounts:{
            type: Number,
            default: 0
        }
    });
</script>
<style src="./style.css"></style>