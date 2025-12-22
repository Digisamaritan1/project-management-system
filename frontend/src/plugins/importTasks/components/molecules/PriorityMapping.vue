<template>
    <div class="d-flex flex-column align-items-center">
        <div class="text-center w-80 m0-auto">
            <h2 class="m-0">{{ $t('valueMapping.priority_mapping_title') }}</h2>
            <p class="font-size-14">
                {{ $t('valueMapping.priority_mapping_instruction') }}
            </p>
        </div>
        <!-- Mapping Section  -->
        <div class="m0-auto d-flex flex-column align-items-center p-10px scrollable style-scroll">
            <div v-for="(priority, priorityIndex) in uniqueUserPriority" :key="priorityIndex"
                class="d-flex align-items-center mb-15px border-bottom-mobiledrop pb-10px">
                <div class="min-width text-center">
                    {{ priority }}
                </div>
                <div class="mr-30px ml-10px">→</div>
                <div class="min-width">
                    <DropDown z-index="9">
                        <template #button>
                            <button
                                class="bg-white border-radius-5-px border-groupBy cursor-pointer font-size-14 dark-gray w-100"
                                ref="expand_collapse_priority">
                                <div class="d-flex justify-content-between align-items-center m-5px">
                                    <p class="m-0 color94">
                                        {{ selectedPriority[priorityIndex] || $t('valueMapping.priority_dropdown_text')
                                        }}
                                    </p>
                                    <img :src=dropDownSvg alt="dropDownSvg" class="w-20">
                                </div>
                            </button>
                        </template>
                        <template #options>
                            <DropDownOption>
                                <input type="text" placeholder="Search" v-model="search[priorityIndex]"
                                    class="p6px-8px border-gray-blue border-radius-4-px font-size-14" />
                            </DropDownOption>
                            <DropDownOption v-for="(sysStatus, sysIndex) in filteredPriority(priorityIndex)"
                                :key="sysIndex" :item="sysStatus"
                                @click="createPriorityMap(priorityIndex, sysStatus), $refs?.expand_collapse_priority[priorityIndex]?.click()">
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
import { useStore } from "vuex";
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import { useI18n } from "vue-i18n";
import { showAlertModal } from "@/components/atom/AlertBox/helper";
const { t } = useI18n();
const { getters } = useStore();
const dropDownSvg = require("@/assets/images/svg/dropdown_strong.svg");

const priorities = computed(() => getters["settings/companyPriority"]);
const props = defineProps({
    statusMappedData: {
        type: Array,
        required: true,
    },
});

const systemPriorityArray = ref([]);
const selectedPriority = ref([]);
const priorityMapping = ref([]);
const search = ref([]);
const emit = defineEmits(['update-data']);

// Extract the system priorities values from the priorities array
onMounted(() => {
    systemPriorityArray.value = priorities.value.map((item) => item.value);
});

// Get all the unique user priority values
const uniqueUserPriority = computed(() => {
    const allPriorities = props.statusMappedData.map((item) => item.Task_Priority);
    return [...new Set(allPriorities)]
})

// Filter Priority based on the search for dropdown
const filteredPriority = (index) => {
    const term = search.value[index] || "";
    return systemPriorityArray.value.filter((priority) =>
        priority.toLowerCase().includes(term.toLowerCase())
    );
};

// Create a map for Priority with old and new Priority based on the user selection
const createPriorityMap = (index, selectedSystemPriority) => {
    try {
        const userPriority = uniqueUserPriority.value[index];
        const mappingIndex = priorityMapping.value.findIndex((mapping) => mapping.oldPriority === userPriority);

        if (mappingIndex !== -1) {
            priorityMapping.value[mappingIndex].newPriority = selectedSystemPriority;
        } else {
            priorityMapping.value.push({
                oldPriority: userPriority,
                newPriority: selectedSystemPriority,
            })
        }
        selectedPriority.value[index] = selectedSystemPriority
    } catch (error) {
        console.error("Error replacing Priority:", error)
    }
};

// Replace the mapped priority in the statusMappedData for further process
const replacePriority = () => {
    return new Promise((resolve, reject) => {
        try {
            const unmappedPriority = uniqueUserPriority.value.filter((user) => !priorityMapping.value.some(mapping => mapping.oldPriority === user))

            if (unmappedPriority.length > 0) {
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

            const priorityMappedData = props.statusMappedData.map((task) => {
                const updatedTask = { ...task };

                if (updatedTask.Task_Priority) {
                    const mapping = priorityMapping.value.find(
                        (map) => map.oldPriority === updatedTask.Task_Priority
                    )
                    if (mapping) {
                        updatedTask.Task_Priority = mapping.newPriority
                    }
                }
                return updatedTask;
            })
            emit('update-data', { priorityMappedData });
            resolve(true)
        } catch (error) {
            reject(false);
            console.error('Error replacing Status:', error)
        }
    })
}

defineExpose({
    replacePriority
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