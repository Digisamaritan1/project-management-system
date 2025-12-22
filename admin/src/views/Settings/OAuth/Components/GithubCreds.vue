<template>
    <div class="p-10-px oauth_wrapper">
        <div class="setting-content-wrapper">
            <div class="row">
                <div v-for="(field, key) in formDatas" :key="key" class="col-md-12" :class="{'mb-20px': key === 'clientId'}">
                    <div class="form-group">
                        <label :for="key" class="control-label">
                            {{ field.label }}<span>*</span>
                        </label>
                        <InputText
                            :id="key"
                            :type="field.type"
                            class="form-control"
                            :placeholder="field.label"
                            v-model="field.value"
                            @keyup="handleKeyup(key, $event)"
                        />
                        <div class="red">{{ field.error }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <button class="link-button mr-20" :disabled="loading" @click="reset">
                Cancel
            </button>
            <button class="primary-button" :disabled="loading" @click="save">
                {{ loading ? "Saving..." : "Save" }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useToast } from "vue-toast-notification";

// Components
import InputText from "@/components/atom/InputText/InputText.vue";

// Utilities
import * as env from "@/config/env";
import { apiRequestWithoutCompnay } from "../../../../services";
import { useValidation } from "../../../../composable/Validation";

// Props from parent
const props = defineProps({
    credentials: {
        type: Object,
        default: () => ({ clientId: "", clientSecret: "" })
    }
});

// Composable
const { checkErrors, checkAllFields } = useValidation();
const $toast = useToast();

// Reactive form state
const formDatas = ref({
    clientId: {
        type: "text",
        label: "Github Client ID",
        name: "client id",
        value: "",
        rules: "required",
        error: "",
    },
    clientSecret: {
        type: "text",
        label: "Github Client Secret",
        name: "client secret",
        value: "",
        rules: "required",
        error: "",
    },
});
const loading = ref(false);

// Watch for prop changes and update form
watch(
    () => props.credentials,
    (newCreds) => {
        formDatas.value.clientId.value = newCreds.githubClientId || "";
        formDatas.value.clientSecret.value = newCreds.githubClientSecret || "";
    },
    { immediate: true, deep: true }
);

function handleKeyup(key, event) {
    const field = formDatas.value[key];
    checkErrors({
        field,
        name: field.name,
        validations: field.rules,
        type: field.type,
        event: event?.event,
    });
}

async function save() {
    const isValid = await checkAllFields(formDatas.value);
    if (!isValid) return;

    loading.value = true;
    try {
        // Prepare backend variables
        const backendVariables = [
            {
                variableName: "GITHUB_CLIENT_ID",
                variableValue: formDatas.value.clientId.value,
            },
            {
                variableName: "GITHUB_CLIENT_SECRET",
                variableValue: formDatas.value.clientSecret.value,
            },
            {
                variableName: "GITHUB_BASE_OAUTH_URL",
                variableValue: "https://github.com/login/oauth",
            }
        ];
        
        // Prepare frontend variables
        const frontendVariables = [
            {
                variableName: "VUE_APP_GITHUB_CLIENT_ID",
                variableValue: formDatas.value.clientId.value,
            },
            {
                variableName: "VUE_APP_GITHUB_BASE_OAUTH_URL",
                variableValue: "https://github.com/login/oauth",
            }
        ];
        
        await apiRequestWithoutCompnay("post", `${env.API_OAUTH}`, {
            pathType: "root",
            variables: backendVariables,
        });

        await apiRequestWithoutCompnay("post", `${env.API_OAUTH}`, {
            pathType: "frontend",
            variables: frontendVariables,
        });

        $toast.success("Credentials saved successfully!", { position: "top-right" });
    } catch (err) {
        console.error("Error saving credentials:", err);
        $toast.error("Something went wrong.", { position: "top-right" });
    } finally {
        loading.value = false;
    }
}


function reset() {
    Object.keys(formDatas.value).forEach((key) => {
        formDatas.value[key].value = "";
        formDatas.value[key].error = "";
    });
}
</script>

<style src="../style.css"></style>
