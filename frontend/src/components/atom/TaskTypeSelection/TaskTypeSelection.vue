<template>
    <div v-if="!disabled">
        <DropDown :id="uid" @isVisible="$event ? '' : statusSearch = ''">
            <template #button>
                <div :ref="uid" class="status-main-div d-flex align-items-center">
                    <slot name="head">
                        <img v-if="modelValue?.taskImage?.includes('http')" :src="modelValue?.taskImage" alt="task_type" :title="modelValue?.name" :class="imgClasses" class="task__type-image vertical-middle cursor-pointer">
                        <WasabiImage 
                            v-else
                            class="vertical-middle tasktype__wasabiimg cursor-pointer"
                            :data="{url: modelValue?.taskImage}"
                            :class="imgClasses"
                        />
                    </slot>
                </div>
            </template>

            <template #head>
                <div :style="{padding: clientWidth > 765 ? '10px' : ''}" :class="{'border-bottom': clientWidth > 765}">
                    <InputText
                        input-id="taskStatusSearch"
                        v-model="statusSearch"
                        :is-direct-focus="true"
                        :maxLength="250"
                        :minLength="3"
                        :place-holder="`${$t('PlaceHolder.search')}...`"
                        width="-webkit-fill-available"
                    />
                </div>
            </template>

            <template #options>
                <DropDownOption v-for="(status, statusIndex) in filteredOptions" :key="statusIndex" @click="$emit('select', status,convertStatus), $emit('update:modelValue', item), $refs[uid].click()">
                    <div class="d-flex align-items-center">
                        <img v-if="status?.taskImage?.includes('http')" :src="status?.taskImage" alt="task_type" :title="status?.name"  class="task__type-image ml-10px vertical-middle">
                        <WasabiImage 
                            v-else
                            class="ml-10px vertical-middle tasktype__wasabiimg"
                            :data="{url: status?.taskImage}"
                        />
                        <span class="ml-5px"  :style="{color: status.textColor}">{{status.name}}</span>
                    </div>
                </DropDownOption>
            </template>
        </DropDown>
    </div>
    <template v-else>
        <img v-if="modelValue?.taskImage?.includes('http')" :src="modelValue?.taskImage" alt="task_type" :title="modelValue?.name"  :class="imgClasses"  class="task__type-image vertical-middle">
        <WasabiImage 
            v-else
            class="vertical-middle tasktype__wasabiimg"
            :data="{url: modelValue?.taskImage}"
            :class="imgClasses"
        />
    </template>
</template>

<script setup>
// PACKAGES
import {computed, defineEmits, defineProps, inject, onMounted, ref} from 'vue';

// COMPONENTS
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import InputText from '@/components/atom/InputText/InputText.vue'
import { useCustomComposable } from '@/composable';
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";

// UTILS
const clientWidth = inject('$clientWidth');
const { makeUniqueId } = useCustomComposable();

defineEmits(['update:modelValue', 'select'])

// PROPS
const props = defineProps({
    id: {
        type: String,
        default: ""
    },
    modelValue: {
        type: Object,
        required: true
    },
    options: {
        type: Array,
        required: true,
    },
    showLabel: {
        type: Boolean,
        required: false,
    },
    disabled: {
        type: Boolean,
        default: false
    },
    convertStatus: {
        type: Object,
        default: () => ({})
    },
    imgClasses: {
        type: String,
        default: ""
    },
})

const statusSearch = ref("");
const uid = ref("");

onMounted(() => {
    if(!props.id.length) {
        uid.value = `status_${makeUniqueId()}`
    } else {
        uid.value = props.id;
    }
})

const filteredOptions = computed(() => {
    return props.options.filter((item) => {
        return item.name?.toLowerCase()?.includes(statusSearch.value.toLowerCase());
    })
})
</script>

<style lang="scss" scoped>

</style>