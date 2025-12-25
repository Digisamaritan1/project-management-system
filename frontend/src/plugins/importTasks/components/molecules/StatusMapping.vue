<template>
    <div class="d-flex flex-column align-items-center">
        <div class="text-center w-80 m0-auto">
            <h2 class="m-0">{{ $t('valueMapping.status_mapping_title') }}</h2>
            <p class="font-size-14">
                {{ $t('valueMapping.status_mapping_instruction') }}
            </p>
        </div>
        <!-- Mapping Section -->
        <div class="d-flex flex-column align-items-center p-10px scrollable style-scroll">
            <div v-for="(status, statusIndex) in uniqueUserStatus" :key="statusIndex"
                class="d-flex align-items-center mb-15px border-bottom-mobiledrop pb-10px">
                <div class="min-width text-center">
                    {{ status }}
                </div>
                <div class="ml-10px mr-30px">→</div>
                <div class="min-width">
                    <DropDown z-index="9">
                        <template #button>
                            <button
                                class="bg-white border-radius-5-px border-groupBy cursor-pointer font-size-14 dark-gray w-100"
                                ref="expand_collapse_status">
                                <div class="d-flex justify-content-between align-items-center m-5px">
                                    <p class="m-0 color94">
                                        {{ selectedStatus[statusIndex] || $t('valueMapping.status_dropdown_text') }}
                                    </p>
                                    <img :src=dropDownSvg alt="dropDownSvg" class="w-20">
                                </div>
                            </button>
                        </template>
                        <template #options>
                            <DropDownOption>
                                <input type="text" placeholder="Search" v-model="search[statusIndex]"
                                    class="p6px-8px border-gray-blue border-radius-4-px font-size-14" />
                            </DropDownOption>
                            <DropDownOption v-for="(sysStatus, sysIndex) in filteredStatus(statusIndex)" :key="sysIndex"
                                :item="sysStatus"
                                @click="createStatusMap(statusIndex, sysStatus), $refs?.expand_collapse_status[statusIndex]?.click()">
                                <span>{{ sysStatus }}</span>
                            </DropDownOption>
                        </template>
                    </DropDown>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, onMounted, computed, ref, defineEmits } from "vue";
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import { useI18n } from "vue-i18n";
import { showAlertModal } from "@/components/atom/AlertBox/helper";
const dropDownSvg = require("@/assets/images/svg/dropdown_strong.svg");
const { t } = useI18n();

const props = defineProps({
    assigneeMappedData: {
        type: Array,
        required: true,
    },
    taskStatus: {
        type: Array,
        required: true,
    },
});

const systemStatusArray = ref([]);
const selectedStatus = ref([]);
const statusMappings = ref([]);
const search = ref([]);
const emit = defineEmits(['update-data']);

// Extract the system Status values from the taskStatus array
onMounted(() => {
    systemStatusArray.value = props.taskStatus.map((item) => item.name);
});

// Get all the unique user Status values
const uniqueUserStatus = computed(() => {
    const allStatus = props.assigneeMappedData.map((item) => item.status);
    return [...new Set(allStatus)];
});

// Filter status based on the search for dropdown
const filteredStatus = (index) => {
    const term = search.value[index] || "";
    return systemStatusArray.value.filter((status) =>
        status.toLowerCase().includes(term.toLowerCase())
    );
};

// Create a map for status with old and new status based on the user selection
const createStatusMap = (index, selectedSystemStatus) => {
    try {
        const userStatus = uniqueUserStatus.value[index];
        const mappingIndex = statusMappings.value.findIndex(
            (mapping) => mapping.oldStatus === userStatus
        );

        if (mappingIndex !== -1) {
            statusMappings.value[mappingIndex].newStatus = selectedSystemStatus;
        } else {
            statusMappings.value.push({
                oldStatus: userStatus,
                newStatus: selectedSystemStatus,
            });
        }
        selectedStatus.value[index] = selectedSystemStatus;
    } catch (error) {
        console.error("Error replacing status:", error)
    }
};

// Replace the mapped status in the assigneeMappedData for further process
const replaceStatus = () => {
    return new Promise((resolve, reject) => {
        try {
            const unmapppedStatus = uniqueUserStatus.value.filter((user) => !statusMappings.value.some(mapping => mapping.oldStatus === user))

            if (unmapppedStatus.length > 0) {
                showAlertModal({
                    title: t("alertBox.incomplete_mapping_title"),
                    message: t("alertBox.incomplete_mapping_text"),
                    type: "error",
                    showCancel: false,
                    confirmButtonText: t("alertBox.ok"),
                })
                reject(false);
                return;
            }

            const statusMappedData = props.assigneeMappedData.map((task) => {
                const updatedTask = { ...task };

                if (updatedTask.status) {
                    const mapping = statusMappings.value.find(
                        (map) => map.oldStatus === updatedTask.status
                    )
                    if (mapping) {
                        updatedTask.status = mapping.newStatus
                    }
                }
                return updatedTask;
            })
            emit('update-data', { statusMappedData });
            resolve(true)
        } catch (error) {
            reject(false);
            console.error('Error replacing Status:', error)
        }
    })
}

defineExpose({
    replaceStatus
});


</script>

<style scoped>
.min-width {
    min-width: 250px;
}

.scrollable {
    overflow-y: auto;
    max-height: 60vh;
    overflow-x: auto;
}
</style>