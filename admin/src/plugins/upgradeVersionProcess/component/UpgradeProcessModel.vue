<template>
    <div class="main-upgrade-modal">
        <Modal v-model="iscloseModel" :header="false" :footer="true" :className="'upadte-modal-main'">
            <template #body>
                <CustomizationModel
                    v-if="isCustomization"
                    :loading="loading"
                ></CustomizationModel>
                <ReleaseNoteModelComponent
                    v-if="sectionDisplay === 1 && !isCustomization"
                    :openReleaseNoteModel="props.openReleaseNoteModel"
                    :loading="loading"
                    :errorMessage="errorMessage"
                    :infoMessage="infoMessage"
                    :versionUpdate="versionUpdate"
                    :fromWhich="fromWhich"
                >
                </ReleaseNoteModelComponent>

                <EnvFormModelComponent
                    v-if="sectionDisplay === 2 && !isCustomization"
                    :versionUpdate="versionUpdate"
                    :oldSectionDisplay="oldSectionDisplay"
                    :clickType="clickType"
                    @submitClick="submitEnvClick"
                    @previousClick="previousEnvClick"
                >
                </EnvFormModelComponent>
                <GeneralNotes
                    v-if="sectionDisplay === 3 && !isCustomization"
                    :envFromData="envFromData"
                    :clickType="clickType"
                    :versionUpdate="versionUpdate"
                    @changeAgreeTermsConditions="changeAgreeTermsConditions"
                >
                </GeneralNotes>
            </template>
            <template #footer>
                <div class="d-flex justify-content-center" v-if="isCustomization">
                    <button class="white_btn mr-10px" @click="closeModal()">Cancel</button>
                </div>
                <div class="d-flex justify-content-center" v-if="!isCustomization">
                    <button class="blue_btn mr-10px" v-if="sectionDisplay === 1" @click="closeModal(),resetReleaseFlag()">Leter</button>
                    <button class="blue_btn" v-if="sectionDisplay === 1 && !errorMessage && !infoMessage" @click="nextSubmit(),resetReleaseFlag()">Upgrade</button>
                    <button class="blue_btn mr-10px" v-if="sectionDisplay !== 1" @click="closeModal()">Cancel</button>
                    <button class="blue_btn mr-10px" v-if="sectionDisplay !== 1" @click="previousSubmit()">Pevious</button>
                    <button class="blue_btn" v-if="!infoMessage && sectionDisplay !== 1 && sectionDisplay !== 3" @click="nextSubmit()">Next</button>
                    <button class="blue_btn" :class="isFinalBtnDisable ? 'pointer-event-none opacity-5' : ''" :disabled="isFinalBtnDisable" v-if="!infoMessage && sectionDisplay === 3" @click="finalSubmit()">Install Now</button>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup>
    import {
        defineProps,
        ref,
        onMounted,
        defineEmits,
        // inject
    } from "vue";
    import axios from "axios";
    import { useToast } from 'vue-toast-notification';
    import Modal from "@/components/atom/Modal/Modal.vue";
    import packageJOSN from "../../../../../package.json";
    import { apiRequest } from "../../../services";
    import * as env from '@/config/env';
    const props = defineProps({
        openReleaseNoteModel: {
            type: Boolean,
        },
        fromWhich: {
            type: String,
            default: ''
        }
    });
    const $toast = useToast();
    const loading = ref(true);
    const isCustomization = ref(false);
    const infoMessage = ref("");
    const errorMessage = ref("");
    const versionUpdate = ref({});
    const sectionDisplay = ref(1);
    const oldSectionDisplay = ref(1);
    const clickType = ref("");
    const envFromData = ref({});
    const isFinalBtnDisable = ref(true);
    const emit = defineEmits(["closeReleaseNoteModel"]);
    const iscloseModel = ref(props.openReleaseNoteModel);

    const getVersionUpdate = () => {
        const languageUrl = process.env.VUE_APP_CANYONAPIURL + '/api/v1/upgradeversion';
        axios.post(languageUrl, {
            licensesKey: process.env.VUE_APP_CANYONLICENSEKEY,
            currentVersion: packageJOSN.version
        })
        .then((res) => {
            if (res?.data?.status) {
                if (res?.data?.message) {
                    loading.value = false;
                    infoMessage.value = res?.data?.message || "Latest version is not available.";
                }
                if (res?.data?.data) {
                    loading.value = false;
                    versionUpdate.value = res?.data?.data;
                    isCustomization.value = res?.data?.domainData?.isCustomization || false;
                }
                // $toast.success(res?.data?.message, {position: 'top-right'});
            } else {
                loading.value = false;
                versionUpdate.value = res?.data?.data;
            }
        })
        .catch((error) => {
            loading.value = false;
            console.error("error", error);
            errorMessage.value = error?.response?.data?.error || "Something went wrong. Please try again.";
            $toast.error(errorMessage.value, {position: 'top-right'});
        })
    }
    const changeAgreeTermsConditions = (status) => {
        isFinalBtnDisable.value = !status;
    }
    const previousSubmit = () => {
        oldSectionDisplay.value = sectionDisplay.value;
        if (sectionDisplay.value === 3 && !versionUpdate.value?.finalVersionObj?.envUpdate) {
            sectionDisplay.value -= 2;
            return;
        }
        if (sectionDisplay.value === 2) {
            clickType.value = "previous-" + new Date().getTime();
            return;
        }
        sectionDisplay.value -= 1;
    }
    const submitEnvClick = (data) => {
        oldSectionDisplay.value = sectionDisplay.value;
        envFromData.value = data;
        sectionDisplay.value += 1;
    }
    const previousEnvClick = () => {
        oldSectionDisplay.value = sectionDisplay.value;
        sectionDisplay.value -= 1;
    }
    const finalSubmit = () => {
        clickType.value = "next-" + new Date().getTime();
    }
    const nextSubmit = () => {
        oldSectionDisplay.value = sectionDisplay.value;
        if (sectionDisplay.value === 1 && !versionUpdate.value?.finalVersionObj?.envUpdate) {
            sectionDisplay.value += 2;
            return;
        }

        if (sectionDisplay.value === 2) {
            clickType.value = "next-" + new Date().getTime();
            return;
        }
        sectionDisplay.value += 1;
    }
    const closeModal = () => {
        iscloseModel.value = false;
        clickType.value = "";
        sectionDisplay.value = 1;
        oldSectionDisplay.value = 1;
        isCustomization.value = false;
        emit("closeReleaseNoteModel", iscloseModel.value)
    }
    onMounted(() => {
        loading.value = true;
        getVersionUpdate();
    })

    function resetReleaseFlag() {
        const user = JSON.parse(localStorage.getItem('userDetails'));
        if(user.isVesionUpdate){
            apiRequest("post", env.VERSION_UPDATE_NOTIFY, {flag : false}).catch((error) => {
                console.error(error,"ERROR");
            });
        }
    }
</script>

<style src="../css/style.css">
</style>