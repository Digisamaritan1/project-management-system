<template>
    <teleport to="#my-sidebar">
        <div
            class="position-fi justify-content-end sidebar"
            v-if="unMount ? visible : true"
            :class="`${className} ${left ? 'flex-row-reverse' : ''} ${!visible ? 'd-none' : 'd-flex'}`"
            :style="[{'z-index':zIndex}]"
        >
            <div class="back-drop" @click="closeOnBackDrop ? $emit('update:visible', !visible) : ''"></div>
            <div
                :style="`${width ? `width: ${width}` : ''}; top: ${top}; height: calc(100% - ${top});`"
                :class="{'hide-side-left':!showSide && left, 'hide-side-right':!showSide && !left}"
                class="position-fi bg-white d-flex flex-column sidebar-content z-index-7"
            >
                <div v-if="!hideHeader" :class="headClass" class="sidebar-head bg-white d-flex align-items-center justify-content-between px-1 blue border-bottom cursor-default">
                    <slot name="head">
                        <div class="assignee-headtitle d-block text-ellipsis text-nowrap">
                            <slot name="head-left">
                                {{title}}
                            </slot>
                        </div>
                        <div>
                            <slot name="head-mid">
                            </slot>
                        </div>
                        <div class="cursor-pointer d-flex align-items-center">
                            <slot name="head-right">
                                <button v-if="multiSelect && showClear" class="clear-all outline-primary bg-light-gray black mr-1" :class="{'opacity-5 cursor-default': !value.length, 'opacity-10 cursor-pointer': value.length}" @click="$emit('clear')">Clear all</button>
                                <img :src="closeBlueImage" alt="closeButton" class="cursor-pointer" @click="$emit('update:visible', !visible)"/>
                            </slot>
                        </div>
                    </slot>
                </div>
                <div class="black sidebar-body bg-light-gray" :style="{
                    'height': (hideHeader ? '100%' : '')
                }">
                    <div v-if="enableSearch" class="bg-white mobile-list-inputsearch-wrapper border-bottom p-15px">
                        <input ref="sidebar_search" type="text" v-model="search" placeholder="Search" class="form-control listsidebar-search font-size-16" @input="$emit('searchChange', search)">
                    </div>
                    <slot name="body">
                        <div v-if="defaultLayout" class="overflow-y-auto sidebar-options overflow-x-hidden" :style="`height: ${!enableSearch ? 'calc(100% - 0px);' : 'calc(100% - 52px);'}`">
                            <template v-if="!grouped">
                                <template v-if="filteredOptions?.length">
                                    <SidebarItems
                                        v-for="(item, itemIndex) in filteredOptions"
                                        :key="'item'+itemIndex"
                                        :item="item"
                                        :multiSelect="multiSelect"
                                        :selected="checkSelected(item)"
                                        @select="(item) => updateItem('add', item)"
                                        @remove="(item) => updateItem('remove', item)"
                                        :isDefault="isDefault"
                                        :imageDisplayForPriority="imageDisplayForPriority"
                                    />
                                </template>
                                <template v-else>
                                    <div class="text-center mt-10px">
                                        <span class="red" >No results found</span>
                                    </div>
                                </template>
                            </template>
                            <template v-else>
                                <template v-for="(group, index) in filteredOptions">
                                    <div v-if="group.options.length" :key="index">
                                        <div class="group-title p-1">
                                            {{group.label}}
                                        </div>

                                        <SidebarItems
                                            v-for="(item, itemIndex) in group.options"
                                            :key="'item'+itemIndex"
                                            :item="item"
                                            :multiSelect="multiSelect"
                                            :selected="checkSelected(item)"
                                            @select="(item) => updateItem('add', item)"
                                            @remove="(item) => updateItem('remove', item)"
                                            :imageDisplayForPriority="imageDisplayForPriority"
                                        />
                                    </div>
                                    <div v-else :key="'no_result'+index">
                                        <div class="group-title p-1">
                                            {{group.label}}
                                        </div>
                                        <div class="text-center mt-10px">
                                            <span class="red">No results found</span>
                                        </div>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </slot>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
// PACKAGES
import { defineComponent, defineProps, defineEmits, ref, watch, nextTick, onMounted } from "vue";

// COMPONENTS
import SidebarItems from "../SidebarItems/SidebarItems.vue";

// COMPOSABLES
import { useCustomComposable } from "@/composable";

// USE COMPOSABLES
const { debounce } = useCustomComposable();

// IMAGES
const closeBlueImage = require("@/assets/images/svg/CloseSidebar.svg");

// COMPONENT
defineComponent({
    name: "Sidebar-Component",
    components: {
        SidebarItems
    },
})

// EMITS
const emit = defineEmits(["update:visible", "selected", "removed", "update:value", "clear", "searchChange"])

// PROPS
const props = defineProps({
    title: {
        type: String,
        default: "Title"
    },
    top: {
        type: String,
        default: "0px"
    },
    visible: {
        type: Boolean,
        default: true
    },
    defaultLayout: {
        type: Boolean,
        default: true
    },
    options: {
        type: Array,
        default: () => []
    },
    value: {
        type: Array,
        default: () => []
    },
    left: {
        type: Boolean,
        default: false
    },
    className: {
        type: String,
        default: ""
    },
    width: {
        type: String,
        default: "374px"
    },
    headClass: {
        type: String,
        default: ""
    },

    unMount: {
        type: Boolean,
        default: true
    },
    hideHeader: {
        type: Boolean,
        default: false
    },

    grouped: {
        type: Boolean,
        default: false
    },
    enableSearch: {
        type: Boolean,
        default: false
    },
    closeOnBackDrop: {
        type: Boolean,
        default: true
    },
    closeOnSelect: {
        type: Boolean,
        default: true
    },
    multiSelect: {
        type: Boolean,
        default: false
    },
    showClear: {
        type: Boolean,
        default: true
    },
    zIndex: {
        type: Number,
        default:7
    },
    isDefault: {
        type:Boolean,
        default:false
    },
    imageDisplayForPriority: {
        type:Boolean,
        default:false
    }
})
const showSide = ref(false);
const search = ref("");
const sidebar_search = ref(null);
// eslint-disable-next-line
const visible = ref(false);

onMounted(() => {
    if(props.visible === true) {
        visible.value = true;
        setTimeout(() => {
            showSide.value = true;
        }, 100)
    }
})

watch(() => props.visible, (val) => {
    if(props.enableSearch && props.visible) {
        nextTick(() => {
            sidebar_search.value.focus();
        })
    }
    if(val === false) {
        setTimeout(() => {
            visible.value = val;
            search.value = "";
        }, 100)
        showSide.value = val;
    } else {
        setTimeout(() => {
            showSide.value = val;
        }, 100)
        visible.value = val;
    }
})


function updateItem(type, item) {
    if (type === "add") {
        if (props.value) {
            if (props.value.some((x) => x.value === item.value)) {
                return;
            }

            emit('selected', item);
            if(!props.multiSelect) {
                emit('update:visible', !visible.value)
                emit('update:value', [item])
            } else {
                const value = [...props.value, item]
                emit('update:value', value)
            }
        }
    } else {
        if(props.value) {
            const value = props.value.filter((x) => x.value !== item.value);
            emit('update:value', value)
            emit('removed', item)
        }
    }
}

function checkSelected(item) {
    if (props.value) {
        return props.value.some((x) => x.value === item.value);
    }
    return false;
}

// FILTER OPTIONS
const filteredOptions = ref();
onMounted(() => {
    filteredOptions.value = props.options;
})

watch([search], debounce(([val]) => {
        searchOptions(val);
    }, 1000)
)

function searchOptions(val) {
    if(!props.grouped) {
        filteredOptions.value = props.options.filter((item) => item && item.label && item.label.toLowerCase().includes(val.toLowerCase()));
    } else {
        filteredOptions.value = props.options.map((group) => {
            return {
                ...group,
                options: group.options.filter((item) => item && item.label && item.label.toLowerCase().includes(val.toLowerCase()))
            }
        })
    }
}

watch(() => props.options, () => {
    searchOptions(search.value);
})
</script>

<style>
@import "./style.css";
</style>
