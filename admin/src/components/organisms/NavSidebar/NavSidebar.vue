<template>
    <div class="h-100 nav-sidebar-wrapper">
        <div class="p-30px">
            <img :src="logo" class="w-100" alt="logo" @click="$router.push({name: 'Home'})">
        </div>
        <div class="position-ab" style="top: 30px; right: 30px; transform: rotateZ(180deg);" @click="$emit('toggleSidebar')" v-if="clientWidth <= responseWidth">
            <img :src="arrow_up" alt="arrow" class="toggle-navbar-arrow">
        </div>

        <div style="height: calc(100% - 130px);" class="overflow-y-auto pb-20px">
            <NavBarItem
                v-for="(item) in computedRoute"
                :key="item"

                :item="item"
                :active="item.name.includes($route.name) || item?.children?.some((x) => x.name.includes($route.name))"
            />
        </div>
    </div>
</template>

<script setup>
// PACKAGES
import { inject, ref, computed } from "vue";

// COMPONENTS
import NavBarItem from "@/components/atom/NavBarItem/NavBarItem.vue"
import env from '@/config/env.js'

// IMAGES
const logo = env.GET_LOGO + '?key=logo&type=admin';
const arrow_up = require("@/assets/images/svg/arrow_up.svg")

defineEmits(["toggleSidebar"])

const clientWidth = inject("$clientWidth");
const responseWidth = 1300;

const routes = ref([
    {
        title: "Dashboard",
        name: ["Home"],
        route: "/",
        activeIcon: require("@/assets/images/svg/navBarIcons/Home.svg"),
        inactiveIcon: require("@/assets/images/svg/navBarIcons/Home-inactive.svg")
    },
    {
        title: "Subscription",
        name: ["Subscription","SubscriptionDetail"],
        route: "/subscription",
        activeIcon: require("@/assets/images/svg/navBarIcons/Subscription.svg"),
        inactiveIcon: require("@/assets/images/svg/navBarIcons/Subscription-inactive.svg")
    },
    {
        title: "Company",
        name: ["Company", "Company_Detail"],
        route: "/company",
        activeIcon: require("@/assets/images/svg/navBarIcons/Company.svg"),
        inactiveIcon: require("@/assets/images/svg/navBarIcons/Company-inactive.svg")
    },
    {
        title: "Plans",
        name: ["Plan"],
        route: "/plan",
        activeIcon: require("@/assets/images/svg/navBarIcons/Plans.svg"),
        inactiveIcon: require("@/assets/images/svg/navBarIcons/Plans-inactive.svg")
    },
    {
        title: "Invoice",
        name: ["Invoice"],
        route: "/invoice",
        activeIcon: require("@/assets/images/svg/navBarIcons/Invoice.svg"),
        inactiveIcon: require("@/assets/images/svg/navBarIcons/Invoice-inactive.svg")
    },
    // {
    //     title: "Coupons",
    //     name: ["Coupons"],
    //     route: "/coupons",
    //     activeIcon: require("@/assets/images/svg/navBarIcons/Coupons.svg"),
    //     inactiveIcon: require("@/assets/images/svg/navBarIcons/Coupons-inactive.svg")
    // },
    {
        title: "Email Templates",
        name: ["Email Templates"],
        route: "/email-templates",
        activeIcon: require("@/assets/images/svg/navBarIcons/Email.svg"),
        inactiveIcon: require("@/assets/images/svg/navBarIcons/Email-inactive.svg")
    },
    {
        name: "Settings",
        activeIcon: require("@/assets/images/svg/navBarIcons/Settings.svg"),
        inactiveIcon: require("@/assets/images/svg/navBarIcons/Settings-inactive.svg"),
        children: [
            {
                title: "Brand Settings",
                name: ["Brand Settings"],
                route: "/settings/brand"
            },
            {
                title: "Tracker Settings",
                name: ["Tracker Settings"],
                route: "/settings/tracker"
            },
            {
                title: "Email Settings",
                name: ["Email Settings"],
                route: "/settings/email"
            },
            {
                title: "MongoDb",
                name: ["MongoDb Settings"],
                route: "/settings/mongoDb"
            },
            {
                title: "Wasabi",
                name: ["Wasabi Settings"],
                route: "/settings/wasabi"
            },
            {
                title: "Chargebee",
                name: ["Chargebee Settings"],
                route: "/settings/chargebee"
            },
            // {
            //     title: "Paddle",
            //     name: ["Paddle Settings"],
            //     route: "/settings/paddle"
            // },
            {
                title: "Firebase",
                name: ["Firebase Settings"],
                route: "/settings/firebase"
            },
            {
                title: "AI Settings",
                name: ["AI Settings"],
                route: "/settings/ai"
            },
            {
                title: "oAuth Setting",
                name: ["oAuth_Settings"],
                route: "/settings/oauth"
            }
        ]
    }
])

const computedRoute = computed(() => {
    return updateDataArray(JSON.parse(JSON.stringify(routes.value)), env.STORAGETYPE !== undefined && env.STORAGETYPE == 'server');
})
function updateDataArray(data, condition) {
    if (condition) {
        return data.map(item => {
            if (item.children) {
                item.children = item.children.filter(child => child.title !== "Wasabi");
            }
            return item;
        });
    }
    return data;
}
</script>

<style lang="css" src="./style.css">

</style>