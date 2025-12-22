<template>
    <div>
        <div class="select-option form-control" :id="`${name}_options`" @click="!disabled ? showOption = !showOption : ''" :class="{'cutom-select-disabled': disabled, 'focused': showOption}">
            <div class="d-flex align-items-center justify-content-between h-100" :class="{'cursor-default' : disabled, 'cursor-pointer': !disabled}">
                <div class="select-option__label text-ellipsis">
                    <slot name="header">
                        <span>
                            {{modelValue && modelValue[displayKey] ? modelValue[displayKey] : placeholder}}
                        </span>
                    </slot>
                </div>
                <img v-if="!props.selectImage" :src="clientWidth > 767 ? selectArrow : selectArrowMobile" alt="arrow" :style="`transform: rotateZ(${showOption ? '180' : '0'}deg)`">
                <img v-else :src="clientWidth > 767 ? otherArrow : selectArrowMobile" alt="arrow" :style="`transform: rotateZ(${showOption ? '180' : '0'}deg)`">
                
            </div>
            <div class="select-option-value" v-if="showOption">
                <div class="cutsom-select-search p-8px" v-if="enableSearch">
                    <input ref="searchBox" type="text" @click.stop @keydown.enter.prevent v-model="search" placeholder="search" class="form-control gray">
                </div>
                <div class="custom-selectoptions-wrapper overflow-y-auto">
                    <div class="d-flex flex-column py-10px">
                        <slot name="options">
                            <span 
                                v-for="(item, index) in options.filter((x) => x[displayKey].trim().toLowerCase().includes(search.trim().toLowerCase()))"
                                :key="index"
                                @click.stop="selectOption(item)"
                                :class="{'bg-blue white hover-white': JSON.stringify(item) === JSON.stringify(modelValue)}"
                                class="custom-select-options text-ellipsis font-size-14 gray4b"
                            >
                            <slot name="item" :item="item">
                                <div v-if="props.isDisplayImage !== false">
                                    <img v-if="item?.image?.includes('http')" :src="item.image" alt="task_type" class="mr-5px">
                                    <WasabiImage
                                        v-else
                                        class="mr-5px"
                                        :data="{url: item.image}"
                                    />
                                </div>
                                {{ item[displayKey] }}
                            </slot>
                            </span>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// PACKAGES
import { defineComponent, defineProps, defineEmits, ref, nextTick, watch,inject } from 'vue';
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";


// IMAGES
const selectArrow = require('@/assets/images/svg/filter_select_dropdown.svg');
const selectArrowMobile = require('@/assets/images/svg/drop_down_mobile.svg');
const otherArrow = require('@/assets/images/svg/imageArrowUpDown.svg');


defineComponent({
    name: "SelectComponent",
})

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    placeholder: {
        type: String,
        required: false,
        default: "Select"
    },
    isDisplayImage:{
        type: Boolean,
        required: false,
        default: true
    },
    displayKey: {
        type: String,
        required: false,
        default: "title"
    },
    modelValue: {
        required: true
    },
    options: {
        type: Array,
        required: true
    },
    enableSearch: {
        type: Boolean,
        required: false,
        default: false
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    },
    selectImage :{
        type: Boolean,
        required: false,
        default: false
    }
})

const emit = defineEmits(["change", "input", "update:modelValue", "ShowOpiton"]);

const showOption = ref(false);
const search = ref("");
const searchBox = ref();
const clientWidth = inject("$clientWidth");

emit("ShowOpiton",showOption.value)

watch(showOption, (val) => {
    if(val) {
        startClickListener();
        search.value = "";
        nextTick(() => {
            if(searchBox.value) {
                searchBox.value.focus();
            }
        });
    } else {
        stopClickListener();
    }
})

watch(() => props.modelValue, (newValue, oldValue) => {
    if(newValue !== oldValue && (newValue !== null && newValue !== undefined && newValue !== "")) {
        emit(`change`);
        showOption.value = false;
    }
})

function clickListener(e) {
    const container = document.getElementById(`${props.name}_options`);
    if(container && !container.contains(e.target)) {
        showOption.value = false;
    }
}
function startClickListener() {
    document.addEventListener("click", clickListener);
}
function stopClickListener() {
    document.removeEventListener("click", clickListener);
}

function selectOption(item) {
    showOption.value= false
    emit('input', item),
    emit('update:modelValue', item)
}
</script>

<style>
@import './style.css';
</style>