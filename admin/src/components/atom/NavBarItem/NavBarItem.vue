<template>
    <div v-if="!item.children">
        <router-link
            :to="item.route"
            class="position-re d-flex align-items-center cursor-pointer nav-item-wrapper hover-bg-light-gray gray4b font-size-16"
            :class="{'blue font-weight-600': active}"
        >
            <div v-if="active && !isSubItem" class="position-ab active-bar bg-blue"></div>
            <div class="mr-10px ml-30px" style="min-width: 10px;">
                <img :src="item.activeIcon" v-if="active && item.activeIcon">
                <img :src="item.inactiveIcon" v-else-if="item.inactiveIcon">
            </div>
            {{item.title}}
        </router-link>
    </div>
    <div v-else>
        <div>
            <div
                class="position-re d-flex align-items-center justify-content-between cursor-pointer nav-item-wrapper hover-bg-light-gray"
                :class="{'blue font-weight-600': item.children.some((x) => x.name.includes($route.name))}"
                @click="expanded = !expanded"
            >
                <div class="d-flex align-items-center font-size-16">
                    <div v-if="item.children.some((x) => x.name.includes($route.name))" class="position-ab active-bar bg-blue"></div>
                    <div class="mr-10px ml-30px" style="min-width: 10px;">
                        <img :src="item.activeIcon" v-if="active && item.activeIcon">
                        <img :src="item.inactiveIcon" v-else-if="item.inactiveIcon">
                    </div>
                    {{item.name}}
                </div>

                <div><img :src="arrow_up" alt="arrow" style="transition: all 0.3s ease; transform: rotateX(0deg);" :class="{'rotate_arrow_down': !expanded}"></div>
            </div>

            <template v-if="expanded">
                <NavBarItem
                    v-for="(item) in item.children"
                    :key="item"

                    :item="item"
                    :active="item.name.includes($route.name)"
                    :isSubItem="true"
                />
            </template>
        </div>
    </div>
</template>

<script setup>
// PACKAGES
import { onMounted, ref } from "vue"

// COMPONENTS
import NavBarItem from "./NavBarItem.vue"

// IMAGES
const arrow_up = require("@/assets/images/svg/arrow_up.svg")

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    isSubItem: {
        type: Boolean,
        default: false
    }
})

defineEmits(["click"])

const expanded = ref(props.active);

onMounted(() => {
    expanded.value = props.active;
})
</script>

<style lang="css" src="./style.css">

</style>