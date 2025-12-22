<template>
    <SpinnerComp :is-spinner="isSpinner" v-if="isSpinner"/>
    <div v-else>
        <div class="list_view style-scroll" v-if="groupedTasks.length" id="list_scroll">
            <SprintListing
                v-for="(sprint, index) in groupedTasks"
                :key="sprint?.id"
                :sprint="sprint"
                :groupType="grouped"
                :commonDateFormatForDate="commonDateFormatForDate"
                :style="{marginBottom: index === groupedTasks.length - 1 ? '0px' : '15px', marginTop: index === 0 ? '15px' : ''}"
                :calendarDate="initialDate"
                @change="(sprintId) => {toggleSprints(sprintId)}"
                :fromWhich="fromWhich"
            />
        </div>
        <div class="list_view d-flex align-items-center justify-content-center flex-column" v-else>
            <img :src="noSearchResult" alt="noSearchResult" v-if="project?.deletedStatusKey !== 2">
            <h3 class="mt-1" v-if="project?.deletedStatusKey !== 2">{{showArchived ? $t('Projects.archive') : ""}} {{ $t('Header.no_data_found') }}</h3>
        </div>
    </div>
</template>

<script setup>
// PACKAGES
import { ref, defineProps, defineEmits, nextTick, inject, watch, 
    onMounted, computed
} from 'vue';
import { useStore } from 'vuex';

// COMPONENTS
import SprintListing from "../SprintsList/SprintsList.vue"
import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue";
import isEqual from 'lodash/isEqual';
import { taskListHelper } from '../helper';

// UTILS
const {getters} = useStore();
const project = inject("selectedProject");
const showArchived = inject("showArchived");
const {
    groupBy,
    getSprintTasks,
} = taskListHelper();

// EMITS
defineEmits(['change'])

// PROPS
const props = defineProps({
    grouped: {
        type: Number,
        default: 0
    },
    commonDateFormatForDate: {
        type: String,
        default: "DD/MM/YYYY"
    },
    sprints: {
        type: Array,
        default: () => []
    },
    calendarDate: {
        type: String,
        default: ""
    },
    calendarDateChange: {
        type: Function,
        default: () => false
    },
    fromWhich: {
        type: String,
        default : ''
    }
})

// IMAGES
const noSearchResult = require("@/assets/images/svg/No-Search-Result.svg");

const groupedTasks = ref([]);
const expandedSprint = ref("");
const initialDate = ref(0);
const isSpinner = ref(false);

function init (group,refetch,projects,sprints,groupedTasksData,isBoard) {
    isSpinner.value = true;
    groupBy(group,refetch,projects,sprints,groupedTasksData,isBoard,(resp)=>{
        groupedTasks.value = resp;
        setTimeout(() => {
            isSpinner.value = false;
        }, 1000)
    });
}

onMounted(() => {
    if(project.value && Object.keys(project.value).length) {
        init(props.grouped,true,project,props.sprints,groupedTasks,false);
    }
})
const taskGetter = computed(() => JSON.parse(JSON.stringify(getters["taskData/tasks"])))
watch(taskGetter , () => {
    if(props.grouped === 1) {
        setTimeout(() => {
            init(props.grouped,false,project,props.sprints,groupedTasks,false);
        }, 500)
    }
})

watch([() => props.grouped, () => props.sprints, () => project.value], ([newGroup, newSprints,newProject], [oldGroup, oldSprints,oldProject]) => {
    if (props.calendarDate) {
        initialDate.value = new Date().getTime();
        props.calendarDateChange(true);
    }
    if(project.value && Object.keys(project.value).length) {
        isSpinner.value = true;
        const refetch = JSON.stringify(newProject) !== JSON.stringify(oldProject) || !isEqual(newGroup,oldGroup) || JSON.stringify(newSprints) !== JSON.stringify(oldSprints);
        init(props.grouped,refetch,project,props.sprints,groupedTasks,false);
    }
})

watch([() => props.calendarDate], (data) => {
    if (data && data.length) {
        const selectedDate = data[0];
        if (selectedDate) {
            initialDate.value = new Date(selectedDate).getTime()
        } else {
            initialDate.value = new Date().getTime()
        }
    } else {
        initialDate.value = new Date().getTime()
    }
})

function toggleSprints(sprintId) {
    groupedTasks.value.forEach((sprint) => {
        let SprintId = sprint?.id;
        if(SprintId === sprintId) {
            sprint.isExpanded = !sprint.isExpanded;
            if(sprint.isExpanded) {
                let promises = [];
                sprint.items.forEach((item) => {
                    promises.push(
                        getSprintTasks({projectId: project.value._id, sprintId: SprintId, item, projectData: project.value})
                    )
                })
                Promise.allSettled(promises)
                .then(() => {
                    nextTick(() => {
                        document.getElementById(`sprint_${SprintId}`).scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                            inline: "nearest"
                        });
                    })

                })
                .catch((error) => {
                    console.error("ERROR in toggleSprints > Promise.allSettled: ", error);
                })
                expandedSprint.value = SprintId
            }
        } else {
            sprint.isExpanded = false;
        }
    })
}
</script>

<style>
@import "./style.css";
</style>