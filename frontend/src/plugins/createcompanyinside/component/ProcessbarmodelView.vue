<template>
    <Modal v-model="isCompanyProcess" :header="false" :footer="false" >
        <template #body>
            <div>
                <div class="pr-2 pl-2 pt-5 pb-5 text-center">
                    {{stepCompanyProcessMessage}}
                    <div class="mt-3">
                        <div class="custom-loader">
                            <div class="loaderBar bg-blue"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>
<script setup>
    import { ref, defineProps, watch } from "vue";
    import Modal from "@/components/atom/Modal/Modal.vue";

    
    const props = defineProps({
        isCompanyProcess: {
            type: Boolean,
            default: true
        },
        stepCompanyProcessMessage: {
            type: String,
            default: ""
        }
    });
    const isCompanyProcess = ref(props.isCompanyProcess);
    const stepCompanyProcessMessage = ref(props.stepCompanyProcessMessage);
    watch(() => props.isCompanyProcess, (newVal) => {
        isCompanyProcess.value = newVal;
    })
    watch(() => props.stepCompanyProcessMessage, (newVal) => {
        stepCompanyProcessMessage.value = newVal;
    })
</script>