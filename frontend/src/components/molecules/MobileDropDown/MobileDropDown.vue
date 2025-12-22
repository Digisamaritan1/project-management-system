<template>
    <div>
        <div v-if="showBackDrop" :class="[{'position-fi mobile-back-drop': visible}]" @click="$emit('closeModal')"></div>
        <div class="mobiletabList bg-white position-fi">
            <div class="mobile-option-head black d-flex align-items-center justify-content-between">
                <slot name="head">
                    <div>
                        <slot name="head-left">
                        </slot>
                    </div>
                    <div>
                        <slot name="head-mid">
                        </slot>
                    </div>
                    <div>
                        <slot name="head-right">
                        </slot>
                    </div>
                </slot>
            </div>
            <div class="mobile-option-body">
                <slot name="body"></slot>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'mobile-options-structure',
    emits: ["closeModal"],
    props: {
        showBackDrop: {
            type: Boolean,
            default: true
        },
        visible: {
            type: Boolean,
            default: true
        },
    }
}
</script>
<style>
@import "./style.css"
</style>