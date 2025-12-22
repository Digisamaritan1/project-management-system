<template>
    <div class="sprint position-re" :id="`sprint_${sprint?.id}`">
        <!-- FOLDER NAME LEGEND -->
        <div
            v-if="sprint && sprint.folderName"
            class="cursor-default black position-ab bg-white border border-radius-5-px text-capitalize color52 p0x-10px sprint__foldername"
        >
            {{sprint.folderName}}
        </div>

        <div class="sprint_name TaskName d-flex justify-content-between align-items-center flex-wrap"  :class="{'mb-20px': sprint.isExpanded , 'flex-column align-items-start' : clientWidth<=512}" >
            <div @click="sprint.deletedStatusKey === 0 || sprint.deletedStatusKey === undefined ? $emit('change', sprint?.id) : ''">
                <img v-if="sprint.deletedStatusKey === 0 || sprint.deletedStatusKey === undefined" :src="triangleBlack" alt="traingle" :style="`transform: rotateZ(${sprint.isExpanded ? 90 : 0}deg); width: 6px;`" class="cursor-pointer">
                <img v-if="sprint.deletedStatusKey === 2" :src="inventory_2" class="pr-10px" />
                <img v-if="sprint.isFolder === true" :src="folder">
                <span class="text-ellipse font-weight-bold text-capitalize ml-10px cursor-pointer font-size-14 color52">{{ sprint.name }}</span>
                <template v-if="$route?.query?.tab !== 'Calendar'">
                    <button
                        v-if="sprint.isExpanded && !searchedTask && checkPermission('task.task_create',project.isGlobalPermission) === true && checkPermission('task.task_list',project.isGlobalPermission) == true && showArchiveVar === false"
                        class="outline-secondary-bg-gray ml-10px"
                        @click.stop="createTask = !createTask,
                        (sprint.isExpanded ? '' : $emit('change', sprint?.id))"
                    >
                        + {{$t('Projects.new_task')}}
                    </button>
                </template>
            </div>
        </div>

        <Transition>
            <div v-if="sprint.isExpanded">
                <CreateTask
                    v-if="createTask && checkPermission('task.task_create',project.isGlobalPermission) === true && checkPermission('task.task_list',project.isGlobalPermission) == true"
                    :sprint="sprint"
                    :assigneeOptions="project.AssigneeUserId"
                    :startDate="modalStartDate"
                    :endDate="modalEndDate"
                    @cancel="createTask = false"
                    @submit="taskSubmit"
                    :groupBy="groupType"
                    :addDefaultAssignee="project?._id === '6571e7195470e64b1203295c'"
                />
                <div class="itemSprintWrapper style-scroll-6-px">
                    <template v-if="$route?.query?.tab !== 'Calendar'">
                        <ItemList
                            v-for="item in sprint.items"
                            :key="item.key"
                            :item="item"
                            :sprintId="sprint?.id"
                            :projectId="project._id"
                            :groupType="groupType"
                            :commonDateFormatForDate="commonDateFormatForDate"
                            @toggle="item.isExpanded = !item.isExpanded"
                            :project="project"
                            :sprintObject="sprint"
                        />
                    </template>
                    <template v-else>
                        <CalendarViewComponent
                            :projectData="project"
                            :sprint="sprint"
                            :newTaskData="newTaskData"
                            :calendarDate="initialDate"
                            @openTaskModel="openTaskModel"
                        />
                    </template>
                </div>
            </div>
        </Transition>

        <ConfirmationSidebar
            v-model="showSidebar"
            :title="`${close ? $t('Projects.close') : archive ? $t('Projects.archive') : $t('Projects.delete')}`"
            :message="close ? $t('conformationmsg.sprintclosemsg') : archive ? $t('conformationmsg.archive') : $t('conformationmsg.delete')"
            :confirmationString="`${close ? 'close' : archive ? 'archive' : 'delete'}`"
            :acceptButtonClass="archive && !close ? 'btn-primary': 'btn-danger'"
            :acceptButton="`${close ? $t('Projects.close') : archive ? $t('Projects.archive') : $t('Projects.delete')}`"
            @confirm="updateItem()"
            :showSpinner="showSpinner"
            @selected="changeAssignee('add', $event.id)"
            @removed="changeAssignee('remove', $event.id)"
        />
    </div>
</template>

<script setup>
// PACKAGES
import { computed, defineComponent, defineEmits, defineProps, inject, onMounted, ref, watch } from 'vue';
import { useCustomComposable, useGetterFunctions } from '@/composable';
import { useToast } from 'vue-toast-notification';

// COMPONENTS
import ItemList from '../ItemList/ItemList.vue';
import CreateTask from "../CreateTask/CreateTask.vue"
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import CalendarViewComponent from '@/views/Projects/ProjectCalendarView/CalendarViewComponent.vue';
import * as env from '@/config/env';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { apiRequest } from '../../../services'
import { useI18n } from "vue-i18n";
const { t } = useI18n();

// UTILS
const project = inject("selectedProject");
const searchedTask = inject("searchedTask");
const clientWidth = inject("$clientWidth");
const { checkPermission } = useCustomComposable();
const showArchiveVar = inject("showArchived");
const companyId = inject("$companyId");
const userId = inject("$userId");
const modalStartDate = ref(null);
const modalEndDate = ref(null);
const initialDate = ref(0);
const $toast = useToast();
const {getters} = useStore();
const route = useRoute()
const {getUser} = useGetterFunctions()

// IMAGES
const triangleBlack = require('@/assets/images/svg/triangleBlack.svg');
const folder = require('@/assets/images/folder.png');
const inventory_2 = require('@/assets/images/inventory_2.png');

defineComponent({
    name: "SprintsList",

    components: {
        ItemList,
        CreateTask,
        ConfirmationSidebar
    }
})

defineEmits(['change']);

const props = defineProps({
    sprint: Object,
    groupType: Number,
    commonDateFormatForDate: String,
    calendarDate: Number
})

watch(route, () => {
    if (createTask.value) {
        createTask.value = false;
        modalStartDate.value = null;
        modalEndDate.value = null;
    }
})
const companyUsers = computed(() => {
    return getters["settings/companyUsers"]?.map((x) => x.userId)
})

const companyOwnerId = computed(() => getters["settings/companyOwnerDetail"]?.userId)

const createTask = ref(false);
const assigneeInProgress = ref(false);
const showSpinner = ref(false);
const archive = ref(false);
const close = ref(false);
const showSidebar = ref(false);
const newTaskData = ref({});
const watcherUsers = ref([]);

watch(props.sprint, (val) => {
    if(val.isExpanded === false && createTask.value === true) {
        createTask.value = false;
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
const openTaskModel = (data) => {
    createTask.value = true;
    modalStartDate.value = data.modalStartDate;
    modalEndDate.value = data.modalEndDate;
}
const taskSubmit = (taskData) => {
    const data = taskData.data;
    newTaskData.value = data;
}
function getUserData() {
    const user = getUser(userId.value);
    const userData = {
        id: user._id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: user.companyOwnerId,
    }

    return userData;
}

function updateItem(value = null) {
    showSpinner.value = true;

    let obj = {};
    let updatedValue = '';
    if(props.sprint.isFolder) {
        obj.$set = {deletedStatusKey: value !== null ? value : archive.value ? 2 : 1}
        updatedValue = value !== null ? value : archive.value ? 2 : 1
    } else {
        obj.$set = {deletedStatusKey: value !== null ? value : close.value ? 5 : archive.value ? 2 : 1};
        updatedValue = value !== null ? value : close.value ? 5 : archive.value ? 2 : 1
    }

    const userData = getUserData();

    const axiosData = {
        type: !props.sprint.isFolder ? "updateSprint" : "updateFolder",
        companyId: companyId.value,
        projectId: project.value._id,
        folderId: props.sprint.isFolder ? props.sprint.folderId : props.sprint.id,
        updateObject: {
            ...obj
        },
        updatedValueDeleteStatusKey: updatedValue,
        userData,
        sprintName: !props.sprint.isFolder ? props.sprint.name : null,
        projectData: {
            id: project.value._id,
            ProjectName: project.value.ProjectName
        },
        folderName: props.sprint.isFolder ? props.sprint?.name : "",
    }

    if(!props.sprint.isFolder && props.sprint?.folderId) {
        axiosData.folderName = props.sprint.folderName
        //Try For CHECK
        axiosData.sprints = Object.values(project.value.sprintsfolders[props.sprint.id].archivedSprintList).filter((x) => !x.deletedStatusKey || x.deletedStatusKey === 6)?.map((x) => x.id)
    } else if (props.sprint.isFolder) {
        axiosData.sprints = Object.values(props.sprint.archivedSprintList).filter((x) => !x.deletedStatusKey || x.deletedStatusKey === 6)?.map((x) => x.id)
    }
    let reqUrl = env.SPRINT+"/"+props.sprint.id;
    if (props.sprint.isFolder) {
        reqUrl = env.FOLDER+"/"+props.sprint.id;
    }
    apiRequest("patch", reqUrl, axiosData)
    .then(() => {
        $toast.success(t(`Toast.${props.sprint.isFolder ? 'Folder' : 'Sprint'} ${value !== null ? 'restored' : close.value ? 'closed' : archive.value ? 'archived' : 'deleted'} successfully`), {position: "top-right"})
        showSidebar.value = false;
        showSpinner.value = false;
        close.value = false;
    })
    .catch((error) => {
        close.value = false;
        showSidebar.value = false;
        showSpinner.value = false;
        $toast.error(t(`Toast.something_went_wrong`), {position: "top-right"});
        console.error("ERROR in updateItem: ", error);
    })
}
// CHANGE ASSIGNEE OF PRIVATE SPRINTS
function changeAssignee(type, uid) {
    if(assigneeInProgress.value) return;
    assigneeInProgress.value = true;

    let updateData = {};
    if(type === "add") {
        if(!props.sprint?.AssigneeUserId?.includes(uid)) {
            updateData.$addToSet = {
                'AssigneeUserId': uid,
                'watchers': uid
            }
        }
    } else {
        if(props.sprint?.AssigneeUserId?.includes(uid)) {
            updateData.$pull = {
                AssigneeUserId: uid,
                watchers: uid
            }

            if(props.sprint?.AssigneeUserId?.length === 1) {
                updateData.$set = {
                    private: false
                }
            }
        }
    }
    let obj = {
        type : type === 'add' ? 'added' : 'removed',
        userName : getUser(uid)?.Employee_Name
    }

    updateSprintAPICALL(updateData,obj)
}
// CALL SPRINT UPDATE
function updateSprintAPICALL(updateData = null,historyObj) {
    if(updateData) {
        try {
            const userData = getUserData();
            apiRequest("patch", `${env.SPRINT}/${props.sprint?.id ? props.sprint?.id : props.sprint?._id}`, {
                companyId: companyId.value,
                projectId: project.value._id,
                folderId: props.sprint?.folderId || null,
                type: "updateSprint",
                updateObject: updateData,
                userData,
                sprintName: !props.sprint.isFolder ? props.sprint.name : null,
                projectData: {
                    id: project.value._id,
                    ProjectName: project.value.ProjectName
                },
                folderName: props.sprint.isFolder ? props.sprint?.folderName : "",
                historyData : historyObj
            })
            .then((resp) => {
                if(resp.data.status) {
                    // let historyObj = {
                    //     message: `<b>${userData.Employee_Name}</b> has ${type} <b>${props.sprint.name}</b> sprint ${props.sprint?.folderId === null ? '' : `in <b>${props.sprint.isFolder ? props.sprint?.folderName : ""}</b> folder`} in <b>${project.value.ProjectName}</b> project.`,
                    //     key: "project_sprint_removed",
                    //     sprintId: props.sprint.id,
                    // }
                    // apiRequest("post", env.HANDLE_HISTORY, {
                    //     "type": 'project',
                    //     "companyId": companyId.value,
                    //     "projectId": props.projectData._id,
                    //     "taskId": null,
                    //     "object": historyObj,
                    //     "userData": userData
                    // })
                    $toast.success(t(`Toast.Sprint_updated_successfully`), {position: "top-right"})
                }
                assigneeInProgress.value = false;
            })
            .catch((error) => {
                console.error('ERROR in update Sprint: ', error);
                $toast.error(t(`Toast.something_went_wrong`), {position: "top-right"})
                assigneeInProgress.value = false;
            })
        } catch (error) {
            $toast.error(t(`Toast.something_went_wrong`), {position: "top-right"})
            console.error('ERROR in update Sprint: ', error);
            assigneeInProgress.value = false;
        }
    } else {
        assigneeInProgress.value = false;
    }
}

// WATCHERS
onMounted(() => {
    handleWatcherList();
})
function handleWatcherList() {
    watcherUsers.value = [];
    let allUsers = JSON.parse(JSON.stringify(project.value?.isPrivateSpace ? !props.sprint?.private ? (project.value?.AssigneeUserId || []) : (props.sprint?.AssigneeUserId || []) : companyUsers.value));

    if(!allUsers.includes(companyOwnerId.value)) {
        allUsers.push(companyOwnerId.value);
    }

    if(props.sprint?.watchers?.length) {
        props.sprint.watchers.forEach(element => {
            if (!getUser(element).ghostUser) {
                watcherUsers.value.push({
                    ...getUser(element),
                    isWatcher: true,
                    isLoggedUser: element === userId.value
                });
            }
        });
    } else {
        if (!getUser(userId.value).ghostUser) {     
            watcherUsers.value = [{
                ...getUser(userId.value),
                isWatcher: false,
                isLoggedUser: true
            }];
        }
    }

    allUsers.forEach((uid) => {
        if(!watcherUsers.value.filter((x) => x.id === uid).length) {
            if (!getUser(uid).ghostUser) {  
                watcherUsers.value.push({
                    ...getUser(uid),
                    isWatcher: false,
                    isLoggedUser: true
                });
            }
        }
    })
}
watch(() => props.sprint?.watchers, () => {
    handleWatcherList();
})
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.sprint__foldername{
    top: -10px;
    left: 10px;
}
.eye__icon-wrapper{
    height: 30px; 
    width: 30px;
}
.emp__profile-imgurl{
    width: 30px; 
    height: 30px;
    border-radius: 30px;
    border: 2px solid #fff;
}

</style>
<style scoped src="./style.css"></style>