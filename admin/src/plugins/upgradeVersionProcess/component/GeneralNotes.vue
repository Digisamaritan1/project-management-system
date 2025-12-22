<template>
    <div class="general-notes-section">
        <div class="position-re h-100 left-50 spinner-box" v-if="loading">
            <SpinnerComp :is-spinner="loading" />
        </div>
        <div v-else>
            <div class="text-center general-notes-title mb-30px">
                <h3 class="text-center font-size-36 font-weight-700 line-height-48_8 blue">General Notes</h3>
            </div>
            <div class="new-version-body">
                <div>
                    <p class="m-0 mb-10px mt-5px black font-size-16 font-weight-500 line-height-24">Improve Perfomance</p>
                    <span v-html="generalNotesData"></span>
                </div>
                <div class="d-flex align-items-center mt-20px">
                    <input
                        type="checkbox"
                        class="cursor-pointer"
                        id="agree_terms_conditions"
                        name="agree_terms_conditions"
                        v-model="agreeTermsConditions"
                        @change="agreeTermsConditionsChange"
                    />
                    <label for="agree_terms_conditions" class="step-form-label mt-3px ml-5px cursor-pointer">Check to agree with above points</label>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import {
        defineProps,
        ref,
        watch,
        defineEmits,
        onMounted
    } from "vue";
    import { useToast } from 'vue-toast-notification';
    import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue";
    import { apiRequest } from '@/services';
    import * as env from '@/config/env';

    const emit = defineEmits(["changeAgreeTermsConditions"]);
    const $toast = useToast();
    const props = defineProps({
        envFromData: {
            type: Object
        },
        clickType: {
            type: String
        },
        versionUpdate: {
            type: Object
        }
    });
    const loading = ref(false);
    const generalNotesData = ref("");
    const agreeTermsConditions = ref(false);
    const agreeTermsConditionsChange = () => {
        emit("changeAgreeTermsConditions", agreeTermsConditions.value)
    }
    const submitForm = () => {
        if (agreeTermsConditions.value) {
            loading.value = true;
            apiRequest("post", `${env.SUBMIT_ENV_STEP_FORM}`, {envFromData: props.envFromData, versionUpdate: props.versionUpdate})
            .then((resData) => {
                if (!resData.data.status) {
                    loading.value = false;
                    console.error(resData?.data?.error || "Something went to wrong. Please try again.");
                    $toast.error(resData?.data?.error || "Something went to wrong. Please try again.", {position: 'top-right'});
                    return;
                }
                window.location.replace("upgrade");
            })
            .catch((error) => {
                loading.value = false;
                console.error(error,"ERROR:");
                $toast.error(error?.message || error, {position: 'top-right'});
            })
        } else {
            $toast.error("Please select the check to agree with above points", {position: 'top-right'});
        }
    }
    onMounted(() => {
        loading.value = true;
        apiRequest("get", `${process.env.VUE_APP_CANYONAPIURL}${env.GET_GENERAL_NOTES}`)
        .then((resData) => {
            loading.value = false;
            if (!resData.data.status) {
                console.error(resData?.data?.error || "Something went to wrong. Please try again.");
                $toast.error(resData?.data?.error || "Something went to wrong. Please try again.", {position: 'top-right'});
                return;
            }
            generalNotesData.value = resData?.data?.data?.html;
        })
        .catch((error) => {
            console.error(error,"ERROR:");
            loading.value = true;
            generalNotesData.value = "";
            $toast.error(error?.message || error, {position: 'top-right'});
        })
    })
    watch(() => props.clickType, (newVal) => {
        if (newVal.indexOf("next") !== -1) {
            submitForm();
        }
    })
</script>