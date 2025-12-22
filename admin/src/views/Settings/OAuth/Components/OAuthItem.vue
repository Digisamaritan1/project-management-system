<template>
    <div class="oauth-item">
        <div class="oauth-header">
            <label class="oauth-title">{{ title }}</label>
            <label class="switch">
                <input
                    type="checkbox"
                    :checked="enabled"
                    @change="$emit('update:enabled', $event.target.checked); $emit('toggle', $event.target.checked)"
                />
                <span class="slider round"></span>
            </label>
        </div>

        <div :class="['oauth-body', { 'oauth-disabled': !enabled }]">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    enabled: { type: Boolean, default: false },
});

defineEmits(["update:enabled", "toggle"]);
</script>

<style scoped>
.oauth-disabled {
    pointer-events: none;
    opacity: 0.2;
}
</style>
