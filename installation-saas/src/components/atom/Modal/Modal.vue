<template>
    <div :id="uid" v-if="modelValue" class="position-fi modal-wrapper">
        <teleport to="#my-modal">
            <div class="modal-overlay" @click="closeOnBackdrop ? closeModal() : ''"></div>
            <div class="modal" :style="styles" :class="className">
                <div class="modal-header d-flex align-items-center justify-content-between" :class="headerClasses" v-if="header">
                    <slot name="header">
                        <span>{{title}}</span>
                    </slot>
                </div>
                <div class="modal-body" :class="bodyClasses">
                    <slot name="body"/>
                </div>
                <div class="modal-footer" v-if="footer">
                    <slot class="modal-footer" name="footer">
                        <div class="d-flex justify-content-end">
                            <button class="outline-secondary" @click="closeModal()" v-if="cancelButton">{{cancelButtonText}}</button>
                            <button class="btn-primary ml-10px" @click="$emit('accept', true)" v-if="acceptButton">{{acceptButtonText}}</button>
                        </div>
                    </slot>
                </div>
            </div>
        </teleport>
    </div>
</template>

<script setup>
// PACKAGES
import { useCustomComposable } from "@/composable";
import { defineComponent, defineEmits, defineProps, onMounted, ref } from "vue"

// UTILS
const {makeUniqueId} = useCustomComposable();

defineComponent({
    name: 'ModalComponent'
})

const emit = defineEmits(["close", "accept", "removeListners"])

const props = defineProps({
    closeOnBackdrop: {
        type: Boolean,
        default: true
    },

    className: {
        type: String,
        default: ""
    },

    styles: {
        type: String,
        default: ""
    },

    modelValue: {
        type: Boolean,
        default: false
    },

    title: {
        type: String,
        default: ""
    },

    id: {
        type: String,
        default: ""
    },

    header: {
        type: Boolean,
        default: true
    },
    footer: {
        type: Boolean,
        default: true
    },

    cancelButton: {
        type: Boolean,
        default: true
    },
    cancelButtonText: {
        type: String,
        default: "Cancel"
    },

    acceptButton: {
        type: Boolean,
        default: true
    },
    acceptButtonText: {
        type: String,
        default: "Accept"
    },
    headerClasses: {
        type: String,
        default: ""
    },
    bodyClasses: {
        type: String,
        default: ""
    },
})

const uid = ref("");
onMounted(() => {
    if(props.id) {
        uid.value = props.id
    } else {
        uid.value = makeUniqueId();
    }
})

function closeModal() {
    emit("close", !props.modelValue);
    emit("removeListners");
}
</script>

<style scoped>
@import './style.css';

</style>