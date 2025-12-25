<template>
    <div class="d-flex flex-row justify-content-between w-100 p-10px align-items-center bg-light-gray">
        <div class="w-618px">
            <table class="w-100 text-left bg-white">
                <thead>
                    <tr class="bg-colorlightgray">
                        <th
                            class="w-250px bg-colorlightgray p8px-12px font-size-14 text-left dark-gray opacity-5">
                            {{ header }}
                        </th>
                    </tr>
                </thead>
            </table>
        </div>
        <div class="d-flex">
            <img :src=eye_hide_svg alt="eye_hide_svg" class="w-25px mr-10px"> 
            <p class="m-0">{{ $t('headerMapping.ignored_text') }}</p>
        </div>
        <div>
            <button class="outline-primary w-max-content" @click="emitEditIgnoredField()">
                {{ $t('headerMapping.edit_button') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const eye_hide_svg = require("@/assets/images/svg/eyeHide.svg");


const emit = defineEmits(['editIgnoredField']);

defineProps({
    header: {
        type: String,
        required: true
    }
})

const emitEditIgnoredField = () => {
    emit('editIgnoredField')
}
</script>