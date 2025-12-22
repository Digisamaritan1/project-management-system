<template>
    <div class="d-flex flex-column align-items-center">
        <div class="text-center w-80 m0-auto">
            <h2 class="m-0">{{ $t('valueMapping.custom_field_mapping_title') }}</h2>
            <p class="font-size-14">
                {{ $t('valueMapping.custom_field_mapping_instruction') }}
            </p>
        </div>
        <!-- Mapping Section  -->
        <div class="d-flex flex-column align-items-center p-10px scrollable style-scroll">
            <div v-for="(field, fieldIndex) in customFields" :key="fieldIndex"
                class="d-flex flex-column align-items-center mb-15px border-bottom-mobiledrop pb-10px">
                <div class="d-flex">
                <div class="min-width text-center">
                    {{ field }}
                </div>
                <div class="mr-30px ml-10px">→</div>
                <div class="min-width">
                    <DropDown z-index="9">
                        <template #button>
                            <button
                                class="bg-white border-radius-5-px border-groupBy cursor-pointer font-size-14 dark-gray w-100"
                                ref="expand_collapse_field">

                                <div class="d-flex justify-content-between align-items-center m-5px">
                                    <p class="m-0 color94">
                                        {{ selectedType[field] || "Select a Type" }}
                                    </p>
                                    <img :src=dropDownSvg alt="dropDownSvg" class="w-20">
                                </div>
                            </button>
                        </template>
                        <template #options>
                            <DropDownOption>
                                <input type="text" placeholder="Search" v-model="search[fieldIndex]"
                                    class="p6px-8px border-gray-blue border-radius-4-px font-size-14" />
                            </DropDownOption>
                            <DropDownOption v-for="(sysType, sysIndex) in filteredType(fieldIndex)" :key="sysIndex"
                                :item="sysType"
                                @click="createTypeMap(field, sysType, sysType.cfType), $refs?.expand_collapse_field[fieldIndex]?.click()">
                                <span>{{ sysType?.cfTitle }}</span>
                            </DropDownOption>
                        </template>
                    </DropDown>
                    </div>
                </div>
                <div v-if="selectedType[field] === 'dropdown'" class="d-flex flex-column align-items-center">
                    <p class="font-size-14">
                        {{ $t('valueMapping.custom_delimiters_quest') }}
                    </p>
                    <div class="p-5px bordergray border-radius-5-px min-width">
                        <DropDown z-index="9" :bodyClass="{ 'dropDown-style': true }">
                            <template #button>
                                <button class="bg-white border-0 cursor-pointer font-size-14 dark-gray w-100"
                                    ref="expand_collapse_delimiter">
                                    {{ selectedDelimiter[field] || delimiters[0] }} ▼
                                </button>
                            </template>
                            <template #options>
                                <DropDownOption v-for="(delimiter, index) in delimiters" :key="index"
                                    @click="selectDelimiter(field, delimiter), $refs?.expand_collapse_delimiter[fieldIndex]?.click()">
                                    <span>{{ delimiter }}</span>
                                </DropDownOption>
                            </template>
                        </DropDown>
                    </div>
                    <input v-if="selectedDelimiter[field] === 'Other'" type="text" v-model="customDelimiter[field]"
                        placeholder="Enter your custom delimiter"
                        class="p6px-8px border-gray-blue border-radius-4-px font-size-14 mt-5px min-width text-center"
                        maxlength="2" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, defineProps, ref, computed, defineExpose, toRaw } from "vue";
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import { useStore } from 'vuex';
import { useI18n } from "vue-i18n";
import { showAlertModal } from "@/components/atom/AlertBox/helper";
const { t } = useI18n();

const dropDownSvg = require("@/assets/images/svg/dropdown_strong.svg");

const props = defineProps({
    priorityMappedData: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['update-data']);
const search = ref([]);
const customFields = ref([]);
const selectedType = ref({});
const { getters } = useStore();
const customFieldMapped = ref([]);
const customFieldType = computed(() => getters["settings/customFields"]);
const delimiters = ref(["None", "Slash (/)", "Hyphen (-)", "Comma (,)", "Pipe (||)", "Other"]);
const customDelimiter = ref({});
const selectedDelimiter = ref({});
const lastSelectedTypeObj = ref({});

onMounted(() => {
    customFields.value = Object.keys(props.priorityMappedData[0])?.filter(key => key.startsWith('custom_'))
});


const filteredType = (index) => {
    const term = search.value[index] || "";
    return customFieldType.value.filter((type) => type?.cfTitle?.toLowerCase().includes(term.toLowerCase()));
};

const createTypeMap = (field, typeObj, type) => {
    selectedType.value[field] = type;
    lastSelectedTypeObj.value[field] = typeObj; // Store the last selected type object
    addCustomFieldTypes(toRaw(typeObj));
};

const selectDelimiter = (field, delimiter) => {
    selectedDelimiter.value[field] = delimiter;

    if (delimiter !== "Other") {
        customDelimiter.value[field] = "";
    }
    addCustomFieldTypes(toRaw(lastSelectedTypeObj.value[field]));
};

const addCustomFieldTypes = (typeObj) => {
    customFieldMapped.value = props.priorityMappedData.map((task) => {
        let updatedTask = { ...task };

        // Iterate over selectedType and update the task object
        Object.keys(selectedType.value).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(task, key)) {
                updatedTask[key] = {
                    type: selectedType.value[key],
                    value: task[key],
                    fieldDetails: typeObj,
                    delimiter: selectedType.value[key] === "dropdown"
                        ? (selectedDelimiter.value[key] === "Other"
                            ? customDelimiter.value[key]
                            : selectedDelimiter.value[key])
                        : null, // Delimiter only applies to dropdown fields
                };
            }
        });
        return updatedTask;
    })
}

const sendMappedData = () => {
    return new Promise((resolve, reject) => {

        const unmappedFields = customFields.value.filter(field => !selectedType.value[field]);

        if (unmappedFields.length > 0) {
            showAlertModal({
                    title: t("alertBox.incomplete_mapping_title"),
                    message: t("alertBox.incomplete_mapping_text"),
                    type: "error",
                    showCancel: false,
                    confirmButtonText: t("alertBox.ok"),
                })
            reject('Incomplete Mapping');
            return;
        }
        emit('update-data', { customFieldMapped: customFieldMapped.value });
        resolve();
    })
};

defineExpose({
    sendMappedData
})
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

.dropDown-style {
    left: 885.625px !important;
    /* top: 265.602px !important; */
}
</style>