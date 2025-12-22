<template>
    <div class="oauth-main">
        <BreadCrumb :breadCrumbArray="breadCrumbArray" class="mb-20px" />

        <div class="oauth-section">
            <OAuthItem
                v-for="provider in oauthProviders"
                :key="provider.key"
                :title="provider.title"
                v-model:enabled="provider.enabled"
                @toggle="(newValue) => handleToggle(provider, newValue)"
            >
                <component :is="provider.component" :credentials="credentials" />
            </OAuthItem>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

import BreadCrumb from "@/components/atom/BreadCrumb/BreadCrumb";
import GoogleCreds from "./Components/GoogleCreds.vue";
import OAuthItem from "./Components/OAuthItem.vue";
import GithubCreds from "./Components/GithubCreds.vue";

import * as env from "@/config/env";
import { apiRequestWithoutCompnay } from "../../../services";

// Breadcrumb
const breadCrumbArray = [
    { name: "Home", routeObj: { name: "Home" }, isClickable: true },
    { name: "Settings", routeObj: { name: "" }, isClickable: false },
    {
        name: "oAuth Settings",
        routeObj: { name: "oAuth_Settings" },
        isClickable: false,
    },
];

/**
 * Credentials + Providers
 * Here 'responseKey' is the key which is coming in response from backend side. For check this please put
 * console.log(data) in getData() method. So it is fully dynamic
 */
const credentials = ref({});
const oauthProviders = ref([
    {
        key: "google",
        title: "Google",
        responseKey: "isGoogleLogin",
        pathType: "frontend",
        variableName: "VUE_APP_IS_GOOGLE_LOGIN",
        enabled: false,
        component: GoogleCreds,
    },
    {
        key: "github",
        title: "GitHub",
        responseKey: "isGithubLogin",
        pathType: "frontend",
        variableName: "VUE_APP_IS_GITHUB_LOGIN",
        enabled: false,
        component: GithubCreds,
    }
]);

// Fetch Data on Mount
onMounted(getData);

async function getData() {
    try {
        const response = await apiRequestWithoutCompnay("get", env.API_OAUTH);
        const data = response?.data?.data || {};
        credentials.value = data;

        oauthProviders.value.forEach((provider) => {
            provider.enabled = !!data[provider.responseKey];
        });
    } catch (err) {
        console.error("Error fetching credentials:", err);
    }
}

// Single Toggle Handler
async function handleToggle(provider, newValue) {
    try {
        const variables = [
            {
                variableName: provider.variableName,
                variableValue: newValue
            },
        ];

        await apiRequestWithoutCompnay("post", env.API_OAUTH, {
            pathType: provider.pathType || "frontend",
            variables,
        });

        provider.enabled = newValue;
    } catch (err) {
        console.error(`Error updating ${provider.key} credentials:`, err);
        provider.enabled = !newValue;
    }
}
</script>

<style src="./style.css" scoped>
.oauth-disabled {
    pointer-events: none;
    opacity: 0.2;
}
</style>
