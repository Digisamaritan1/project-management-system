<template>
    <div class="env-form-section">
        <form v-if="envVariables && envVariables.length">
            <EnvStepForm
                v-if="currentSection < envVariables.length"
                :envVariables="envVariables[currentSection]"
                :formValues="formValues"
                :fields="envVariables[currentSection].fields"
            />
        </form>
    </div>
</template>

<script setup>
    import {
        ref,
        computed,
        defineProps,
        watch,
        defineEmits
    } from "vue";
    import axios from "axios";
    import { useToast } from 'vue-toast-notification';
    import { useValidation } from "@/composable/Validation";
    const { checkAllFields} = useValidation();
    const $toast = useToast();
    const props = defineProps({
        versionUpdate: {
            type: Object
        },
        clickType: {
            type: String
        },
        oldSectionDisplay: {
            type: Number
        }
    });
    const emit =  defineEmits(["previousClick", "submitClick"]);
    const envVariables = ref(props.versionUpdate.finalVersionObj.envVariables);
    const currentSection = ref((props.oldSectionDisplay >= envVariables.value.length - 1) ? envVariables.value.length - 1 : 0);

    const verifyFieldValue = (data, cb) => {
        const verifyUrl = process.env.VUE_APP_CANYONAPIURL + '/api/v1/verifyfield';
        axios.post(verifyUrl, {
            envData: process.env,
            data: data,
            licensesKey: process.env.VUE_APP_CANYONLICENSEKEY,
            // currentVersion: packageJOSN.version
        })
        .then((res) => {
            cb(res?.data);
        })
        .catch((error) => {
            console.error("error", error.response.data.message);
            if (error.response.data.message) {
                cb({
                    status: false,
                    error: error.response.data.message
                });
            } else {
                cb({
                    status: false,
                    error: error
                });
            }
        })
    }

    function nextSection() {
        checkAllFields(envVariables.value[currentSection.value].fields.filter((x) => x.type !== 'checkbox'),false).then((result) => {
            if(result){
                verifyFieldValue(envVariables.value[currentSection.value], (verRes) => {
                    if (!verRes.status) {
                        $toast.error(verRes.error, {position: 'top-right'});
                        return;
                    }
                    if (currentSection.value < envVariables.value.length - 1) {
                        currentSection.value = currentSection.value + 1
                    }
                });
            }
        })
    }

    const prevSection = () => {
        if (currentSection.value > 0) {
            currentSection.value = currentSection.value - 1;
        }
    };
    const submitForm = () => {
        checkAllFields(envVariables.value[currentSection.value].fields,false).then((result) => {
            if(result){
                const submitObj = {
                    "finalValue": formValues.value,
                    "version": props.versionUpdate.finalVersionObj.version
                }
                verifyFieldValue(envVariables.value[currentSection.value], (verRes) => {
                    if (!verRes.status) {
                        $toast.error(verRes.error, {position: 'top-right'});
                        return;
                    }
                    emit('submitClick', submitObj);
                });
            } else {
                $toast.error("Please verify your fields. There are some missing values",{position: 'top-right'})
            }
        })
    };

    watch(() => props.clickType, (newVal) => {
        if (newVal.indexOf("next") !== -1) {
            if (currentSection.value >= envVariables.value.length - 1) {
                submitForm();
                return;
            }
            nextSection();
        }
        if (newVal.indexOf("previous") !== -1) {
            if (currentSection.value === 0) {
                emit('previousClick', true);
                return;
            }
            prevSection();
        }
    })
    
    const formValues = computed(() => {
        const values = {};
        envVariables.value.forEach((section,index) => {
            section.fields.forEach(field => {
                values[field.envFieldName] = {
                    value: field.type == "checkbox" ? field.value ? field.value : false : field.value ? field.value : '',
                    addEnv: field.addEnv,
                    section: index,
                    general: section.general || false,
                    functionName: field.functionName || "",
                    version: field.version
                };
            });
        });
        return values;
    });
</script>