<template>
    <div class="project-global-filter-main bg-white d-flex align-items-center position-re border-radius-6-px"
        :class="{ 'ml-10-px': clientWidth > 767, 'ml-010': clientWidth <= 767 }" title="Advance Project Filter">
        <DropDown maxHeight="47dvh" :bodyClass="{ 'main-filter-dropdown-wrapper': true }">
            <template #head>
                <div class="d-flex align-items-center justify-content-between filter-title" v-if="clientWidth <= 767">
                    <h3 class="m-0">{{$t('Filters.filter')}}</h3>
                    <div class="filter-info d-flex">
                        <a href="https://help.alianhub.com/" target="_blank">
                            <img src="@/assets/images/svg/info_icon.svg" alt="info icon" class="mr-5px" />
                            {{$t('Filters.learnmorefilter')}}
                        </a>
                    </div>
                </div>
            </template>
            <template #button>
                <div class="top-filter-section">
                    <img :src="editIcon" id="dd_project_filter_options_tour" alt="TaskFilter"
                        class="task-filter-icon cursor-pointer" ref="closeFilterRef" />
                    <span v-if="isApplyed" class="task-filter-count">{{ filteredCounts }}</span>
                    <img v-if="isApplyed" src="@/assets/images/svg/deletered.svg" alt="close"
                        class="project-filter-close cursor-pointer" @click.stop.prevent="clearFilter" />
                </div>
            </template>
            <template #options>
                <div class="bottom-filter-section bg-white">
                    <div class="d-flex justify-content-between w-100 mb-13px" v-if="clientWidth > 767">
                        <div class="filter-title">
                            <h2 class="m-0 font-size-18 text-capitalize">{{ isEdit === true ? selectedRow.name :
                                "Filters"}}</h2>
                        </div>
                        <div class="filter-info d-flex">
                            <a href="https://help.alianhub.com/" target="_blank">
                                <img src="@/assets/images/svg/info_icon.svg" alt="info icon" class="mr-5px" />
                                {{$t('Filters.learnmorefilter')}}
                            </a>
                        </div>
                    </div>
                    <div v-if="!isValidate" role="alert" aria-live="polite" aria-atomic="true" class="alert alert-danger font-size-13">
                        {{$t('Filters.pleaseselectvalid')}}
                    </div>
                    <div class="table-data">
                        <FieldsTable
                            :inputs="inputs"
                            :statusArray="statusArray"
                            :users="users"
                            :projectTypes="projectTypesArray"
                            :mainOptions="keysArray"
                            @delete="deleteRow"
                        />
                    </div>
                    <div class="d-flex w-100 add-filter-wrapper">
                        <div class="add-section mb-13px"
                            :class="{ 'd-flex justify-content-between w-100': clientWidth <= 767 }"
                            v-if="keysArray.length">
                            <span><a href="#" class="mr-10px"
                                    @click.stop.prevent="clearFilter($event), $refs.closeFilterRef.click()"
                                    v-if="clientWidth <= 767"
                                    :class="{ 'font-weight-500 font-size-18': clientWidth <= 767 }">{{$t('Filters.clearall')}}</a></span>
                            <a href="#" class="blue" @click.stop.prevent="addRow"
                                :class="{ 'font-weight-400 font-size-12': clientWidth > 767, 'font-weight-500 font-size-18': clientWidth <= 767 }">
                                + {{$t('Filters.addfilter')}}
                            </a>
                        </div>
                    </div>
                    <div class="sort-by-section">
                        <h2>{{$t('Filters.sort_by')}}</h2>
                        <FieldsSortBy
                            @sortField="selectedSortByField"
                            @sortOrder="selectedSortByOrder"
                            :sortByField="sortByField"
                            :sortByOrder="sortByOrder"
                            :comparisonsData="comparisonsData"
                        />
                    </div>
                    <FieldsActions
                        :filters="filters"
                        :isInvalid="isInvalid"
                        :isEdit="isEdit"
                        @save="saveFilter"
                        @update="updateFilter"
                        @delete="deleteFilter"
                        @apply="applyFilter"
                        @clear="clearFilter($event), $refs.closeFilterRef.click()"
                        :getFiltersData="getFiltersData"
                        :handleUpdate="handleUpdate"
                    />
                </div>
            </template>
        </DropDown>
        <ConfirmModal
            :modelValue="isConfirm"
            acceptButtonText="Confirm"
            cancelButtonText="Cancel"
            :header="true"
            :showCloseIcon="false"
            @accept="handleConfirm"
            @close="isConfirm = false"
        >
            <template #header>
                <h3 class="m-0">{{$t('Filters.confirm')}}</h3>
            </template>
            <template #body>
                <span>{{$t('Filters.are_you_sure')}} ?</span>
            </template>
        </ConfirmModal>
    </div>
</template>
<script setup>
// Packages
import moment from 'moment';
import { useStore } from "vuex";
import { useToast } from 'vue-toast-notification';
import { ref, onMounted, defineProps, computed, watch, defineEmits, inject, nextTick } from 'vue';

// Components
import * as env from '@/config/env';
import { useGetterFunctions } from "@/composable";
import ConfirmModal from '@/components/atom/Modal/Modal.vue';
import DropDown from '@/components/molecules/DropDown/DropDown.vue';
import FieldsTable from '@/components/molecules/ProjectFilter/FieldsTable.vue';
import FieldsSortBy from '@/components/molecules/ProjectFilter/FieldsSortBy.vue';
import FieldsActions from '@/components/molecules/ProjectFilter/FieldsActions.vue';
import { apiRequest } from '../../../services';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

// Utils
const { getUser } = useGetterFunctions();
const { getters } = useStore();
const $toast = useToast();
// const companyOwner = computed(() => getters["settings/companyOwnerDetail"]);
const projectStatusArray = computed(() => getters["settings/AllProjectStatus"]);
const companyUsers = computed(() => {
    return getters['settings/companyUsers'].filter(user => user.isDelete === false);

});
const comparisonsData = ref([
    { name: 'Ascending', value: 'asc'},
    { name: 'Descending', value: 'desc'}
])
// Props
const props = defineProps({
    projectData: {
        type: Object,
        default: () => { }
    }
})

// Emites
const emits = defineEmits(["apply", "clear"]);

// Watch on project data update
watch(() => props.projectData, (newVal, oldVal) => {
    if (JSON.stringify(newVal._id) !== JSON.stringify(oldVal._id)) {
        getFiltersData();
    }
});

// Images
const editIcon = require("@/assets/images/svg/TaskFilter.svg");

//Variables
const clientWidth = inject("$clientWidth");
const companyId = inject('$companyId');
const userId = inject('$userId');
const isEdit = ref(false);
const isApplyed = ref(false);
const isValidate = ref(true);
const inputs = ref([]);
const sortByField = ref({});
const sortByOrder = ref({});
const isConfirm = ref(false);
const isInvalid = ref(false);
const selectedRow = ref({});
const filters = ref([]);
const closeFilterRef = ref();
const mainOptions = ref([
    { value: 'status', name: "Project_Status", type: 'array', filterOn: 'status' },
    { value: 'projectType', name: "Project_Type", type: 'array', filterOn: 'projectType' },
    { value: 'createdAt', name: "Project_Created_Date", type: 'date', filterOn: 'createdAt' },
    { value: 'DueDate', name: 'due_date', type: 'date', filterOn: 'DueDate'},
    { value: 'AssigneeUserId', name: 'Assignee', type: 'array', filterOn: 'AssigneeUserId'},
]);
const projectTypeArray = ref([
    { name: "Private", value: 'private' },
    { name: "Public", value: 'public' }
]);
const keysArray = computed(() => {
    return mainOptions.value.filter(option => {
        if (!inputs.value.some(input => input.name.value === option.value)) {
            return option;
        }
    });
});
const statusArray = computed(() => {
    return projectStatusArray?.value?.settings?.map((x) => {
        return { ...x, finalValue: x.value }
    }).filter((e)=>e.key !== 2);
});
const projectTypesArray = computed(() => {
    return projectTypeArray?.value?.map((x) => {
        return { ...x, finalValue: x.value }
    })
});

const users = computed(() => {
    return companyUsers.value?.filter((x) => x.status !== 1).map((x) => {
        const user = getUser(x.userId);
        if (!user) return null;
        return {
            finalValue: user.id,
            value: user.id,
            name: user.Employee_Name,
            image: user.Employee_profileImageURL,
            isOnline: user.isOnline
        };
    })
});
const filteredCounts = computed(() => {
    let inputArray = inputs.value.filter((x) => Object.keys(x.name).length !== 0)
    let count = inputArray.length || 0;
    const hasSortField = Object.keys(sortByField.value).length > 0;
    const hasSortOrder = Object.keys(sortByOrder.value).length > 0;
    const itemsAreValid = validateItems();

    if (itemsAreValid && !hasSortField && !hasSortOrder) {
        count = inputArray.length;
    } else if (!itemsAreValid && hasSortField && hasSortOrder) {
        count = inputArray.length || 1;
    } else if (itemsAreValid && hasSortField && hasSortOrder) {
        count = inputArray.length + 1;
    }
    return count;
});

// Mounted
onMounted(() => {
    addRow();
    getFiltersData();
});

// Get saved filter data from database
const getFiltersData = async () => {
    await apiRequest("get", `${env.PROJECT_GLOBAL_FILTER}/${userId.value}`).then((result) => {
        if (result.data.status) {
            filters.value = [];
            if (result && result?.data?.data.length) {
                result?.data?.data.forEach((doc) => {
                    filters.value.push({ ...doc, isEdit: false });
                });
            }
        }
    });
}

// This function is used for the handle update event
const handleUpdate = async (obj) => {
    let params = [];
    if (obj?.name) {
        params = [
            { _id: obj.id },
            { $set: { 
                    name: obj.name
                } 
            }
        ];
    } else {
        params = [
            { _id: obj.id },
            { $set: { 
                    filters: obj.filters,
                    sortByField: sortByField.value || {},
                    sortByOrder: sortByOrder.value || {}
                } 
            }
        ];
    }

    await apiRequest("put", `${env.PROJECT_GLOBAL_FILTER}/update`, params).then((result) => {
        if (result.status) {
            getFiltersData();
            $toast.success(t('Toast.Filter_update_successfully'), { position: 'top-right' });
        }
    });
}

// This is a callback function which is used to manage mulitple array based on type. It return data based on used
const manageArray = (type) => {
    let arrayData = [];
    if (type === "status") {
        arrayData = statusArray;
    } else if (type === "projectType") {
        arrayData = projectTypesArray;
    } else if(type === 'AssigneeUserId') {
        arrayData = users
    }
    return arrayData;
}

// Populate the value in comparision array based on key
const manageComparisonArray = (key) => {
    const arraykeys = ["status", "projectType", "AssigneeUserId"];
    const dateKeys = ["createdAt", "DueDate"];
    let arrayData = [];
    if (arraykeys.includes(key)) {
        arrayData = [
            { value: ':', name: "Is" }
        ]
    } else if (dateKeys.includes(key)) {
        arrayData = [
            { value: ':>', name: "Greater Than" },
            { value: ':<', name: "Less Than" },
            { value: ':=', name: "Equal To" }
        ]
    }
    return arrayData;
}

// This function is used to validate each fields in the tables
const validateItems = () => {
    let isValid = true; // Assume the array is valid initially
    
    inputs.value.forEach(item => {
        item.isValidate = true;
        if (Object.keys(item.name).length) {     
            if (typeof item.name !== "object" || Object.keys(item.name).length === 0) {
                item.isValidate = false;
            }
            if (typeof item.comparison !== "object" || Object.keys(item.comparison).length === 0) {
                item.isValidate = false;
            }
            if (item.name.value === "createdAt"|| item.name.value === "DueDate") {
                if (item.date === "") {
                    item.isValidate = false;
                }
            } else {
                if (!Array.isArray(item.values) || item.values.length === 0) {
                    item.isValidate = false;
                }
            }
            if (item.isValidate === false) {
                isValid = false;
            }
        }
    });
    
    if (inputs.value.filter((x) => Object.keys(x.name).length === 0).length) {
        if (inputs.value.length > 1) {
            isValid = false;
        } else {
            if (Object.keys(sortByField.value).length === 0 || Object.keys(sortByOrder.value).length === 0) {
                isValid = false;
            }
        }
    }
    return isValid;
}

// This function is used to add new row
const addRow = () => {
    if (!validateItems()) {
        isValidate.value = false;
        return;
    }

    isValidate.value = true;
    const obj = {
        name: {},
        comparison: {},
        values: [],
        condition: inputs.value.length > 0 ? inputs.value[0].condition : "&&",
        date: "",
        isAllChecked: false,
        isValidate: true,
        displayData: [],
        comparisonsData: [],
    }
    inputs.value.push(obj);

    nextTick(() => {
        if (inputs.value.length > 5) {
            const el = document.querySelector(`#num-${inputs.value.length - 1}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: "end" });
            }
        }
    })
}

// This function is used to delete perticuler row for the filters
const deleteRow = (row) => {
    inputs.value.splice(row.index, 1);
}

// This function is used to apply filter on the seleted query and get result from the mongo
const applyFilter = (data) => {

    isValidate.value = true;
    let filterBy = {};
    let queries = [];
    if (data.type === "saved") {
        inputs.value = [];
        isEdit.value = true;
        selectedRow.value = data.item;
        sortByField.value = data.item?.sortByField || {};
        sortByOrder.value = data.item?.sortByOrder || {};
        if (data.item.filters.filter((z)=> z.values.length).length) {
            queries = JSON.parse(JSON.stringify(data.item.filters));
            queries.map(x => x.comparisonsData = manageComparisonArray(x.name.value));
            queries.map(x => x.displayData = !['createdAt', 'DueDate'].includes(x.name.value)  ? manageArray(x.name.value).value.filter(v => x.values.includes(v.finalValue)) : []);
            nextTick(() => {
                inputs.value = queries
            });
        }
    } else {
        if (!validateItems()) {
            isValidate.value = false;
            return;
        }
        queries = JSON.parse(JSON.stringify(inputs.value));
    }

    queries.forEach((query) => {
        const queryField = query.name.value;
        const comparison = query.comparison.value;
        const condition = query.condition === '||' ? '$or' : '$and';
        const filterOn = query.name.filterOn;
        if (filterBy[condition] === undefined) {
            filterBy[condition] = [];
        }

        if (query.name.type === "arrayOfObject") {
            filterBy[condition].push({ [queryField]: { $elemMatch: { [filterOn]: { $in: query.values } } } })
        } else if (query.name.type === "object") {
            const filteField = `${queryField}.${filterOn}`;
            filterBy[condition].push({ [filteField]: { $in: query.values } });
        } else if (query.name.type === "string" || query.name.type === "array") {
            if(queryField === 'projectType') {
                filterBy[condition].push({ 'isPrivateSpace': query.values[0] === 'private' ? true : false });
            } else {
                filterBy[condition].push({ [filterOn]: { $in: query.values } });
            }
        } else if (query.name.type === "date") {
            const date = new Date(query.date);
            const now = moment(new Date(query.date));
            const nextDate = new Date(now.endOf('day'));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            if (comparison === ':=') {
                const startDate = new Date(query.date).setHours(0, 0, 0, 0);
                const endDate = new Date(query.date).setHours(23, 59, 59, 59);
                filterBy[condition].push({ [filterOn]: { $gte: new Date(startDate).toISOString(), $lte: new Date(endDate).toISOString() } });
            } else if (comparison === ':>') {
                filterBy[condition].push({ [filterOn]: { $gt: new Date(nextDate).toISOString() } });
            } else {
                filterBy[condition].push({ [filterOn]: { $lt: new Date(date).toISOString() } });
            }
        } else if (query.name.type === "dateNumber") {
            const date = new Date(query.date);
            const now = moment(new Date(query.date));
            const nextDate = new Date(now.endOf('day'));
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            if (comparison === ':=') {
                const startDate = new Date(query.date).setHours(0, 0, 0, 0);
                const endDate = new Date(query.date).setHours(23, 59, 59, 59);
                filterBy[condition].push({ [filterOn]: { $gte: new Date(startDate).getTime() / 1000, $lte: new Date(endDate).getTime() / 1000 } });
            } else if (comparison === ':>') {
                filterBy[condition].push({ [filterOn]: { $gt: new Date(nextDate).getTime() / 1000 } });
            } else {
                filterBy[condition].push({ [filterOn]: { $lt: new Date(date).getTime() / 1000 } });
            }
        } else {
            filterBy = { ...filterBy }
        }
    });
    emits('apply', filterBy, sortByField.value, sortByOrder.value);
    isApplyed.value = true;
    closeFilterRef.value.click();
}

// This function is used to clear all the selected filters and close it
const clearFilter = () => {
    inputs.value = [];
    sortByField.value = {};
    sortByOrder.value = {};
    addRow();
    emits('clear', true);
    isValidate.value = true;
    isEdit.value = false;
    isApplyed.value = false;
}

// This function is used to save the filter to the database
const saveFilter = async (inputName) => {
    if (inputName === "") {
        isInvalid.value = true;
        return;
    } else {
        if (!validateItems()) {
            isValidate.value = false;
            return;
        }
    }
    isValidate.value = true;
    isInvalid.value = false;
    const arr = JSON.parse(JSON.stringify(inputs.value));
    arr.forEach((key) => {
        delete key.displayData;
        delete key.isValidate;
        delete key.comparisonsData;
    });

    let axiosData = {
        name: inputName,
        filters: arr,
        userId: userId.value,
        companyId: companyId.value,
        sortByOrder: sortByOrder.value,
        sortByField: sortByField.value,
        typeFilter: 'projects',
        filter: 'projectFilter',
    }
    await apiRequest("post", `${env.PROJECT_GLOBAL_FILTER}/create`, axiosData).then((result) => {
        if (result.status) {
            $toast.success(t('Toast.Filter_saved_successfully'), { position: 'top-right' });
            getFiltersData();
        }
    });
}

// This function is used to update selected filter to the database
const updateFilter = async () => {
    // Validate if any field is blank or not
    if (!validateItems()) {
        isValidate.value = false;
        return;
    }
    isValidate.value = true;
    const arr = JSON.parse(JSON.stringify(inputs.value));
    arr.forEach((key) => {
        delete key.displayData;
        delete key.isValidate;
        delete key.comparisonsData;
    });

    const obj = { filters: arr, id: selectedRow.value._id };
    await handleUpdate(obj);
}

// This function is used to delete selected the filter to the database
const deleteFilter = (row) => {
    isConfirm.value = true;
    selectedRow.value = row;
}

const handleConfirm = async (val) => {
    if (val) {
        await apiRequest("delete", `${env.PROJECT_GLOBAL_FILTER}/delete/${companyId.value}/${selectedRow.value._id}`).then((result) => {
            if (result.status) {
                const index = filters.value.findIndex(x => x._id === selectedRow.value._id);
                if (index !== -1) {
                    filters.value.splice(index, 1);
                }
                $toast.success(t('Toast.Tag_Deleted_successfully'), { position: 'top-right' });
                isConfirm.value = false;
            }
        });
    }
}

// onChange for the sort field dropdown
const selectedSortByField = (option) => {
    sortByField.value = option
    if (option.value === "running_time_tracker") {
        comparisonsData.value = [
            { name: 'Yes', value: 'desc'},
            { name: 'No', value: 'asc'},
        ]
    } else if (option.value === "name") {
        comparisonsData.value = [
            { name: 'A-Z', value: 'asc'},
            { name: 'Z-A', value: 'desc'}
        ]
    } else {
        comparisonsData.value = [
            { name: 'Ascending', value: 'asc'},
            { name: 'Descending', value: 'desc'}
        ]
    }
}

// onChange for the sort order dropdown
const selectedSortByOrder = (option) => {
    sortByOrder.value = option
}

</script>
<style>
 @import "./style.css";
</style>