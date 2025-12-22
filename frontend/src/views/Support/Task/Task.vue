<template>
    <div>
        <div class="new-row list-group-item">
            <!-- LEFT SECTION -->
            <div class="new-col1" :style="{ border: (clientWidth > sideScrollWidth ? '0px' : '')}">
                <div class="common-section task ignore-drag" :style="`${task.isParentTask === false ? 'padding-left: 12px;' : ''}`">
                    <img :src="dragIcon" alt="dragIcon" v-if="!showArchiveVar && false" class="draggable_icon cursor-all-scroll">
                    <div class="parent__tasksubarray-wrapper position-ab">
                        <template v-if="(task.subTasks && task.isParentTask) || (searchedTask && task?.subtaskArray?.length)">
                            <img class="cursor-pointer parent__task-image" v-if="(task.subTasks && task.isParentTask) || (searchedTask && task?.subtaskArray?.length)" :src="triangleBlack" alt="triangle" :style="`transform: rotateZ(${data.isExpanded ? '90' : '0'}deg)`" @click="$emit('toggle')">
                        </template>
                        <template v-else>
                            <img class="parent__task-image" v-if="(task.isParentTask) || (searchedTask && task?.subtaskArray?.length)" :src="triangleBlack" alt="triangle" :style="`opacity: 0.1;`" @click="$emit('toggle')">
                        </template>
                    </div>

                    <img v-if="!data.isParentTask" :src="lastChild ? pointer : extendedPointer" alt="" class="align-self-baseline parent__task-lastchild parent__task-image">

                    <!-- INVENTORY -->
                    <img v-if="task.deletedStatusKey === 2" :src="inventoryIcon" alt="inventory" class="ml-5px" />
                    <img v-if="task.deletedStatusKey === 1" :src="deleteIcon" alt="delete" class="ml-5px">

                    <!-- MARK FAVOURITE -->
                    <img v-if="!showArchiveVar" :src="favourite ? filledStar : blankStar" @click.stop="markAsFavourite()" alt="favourite star" class="cursor-pointer ml-6px">
                    <img v-else :src="favourite ? filledStar : blankStar" alt="favourite star" class="ml-6px">

                    <!-- TASK STATUS -->
                    <TaskStatus
                        :id="task._id+'status'"
                        :modelValue="taskStatus"
                        :options="projectStatus"
                        :disabled="showArchiveVar && checkPermission('task.task_list',projectData.isGlobalPermission)!==true || checkPermission('task.task_status',projectData.isGlobalPermission) !== true || showArchiveVar !== false"
                        @select="changeStatus($event)"
                    />

                    <!-- TASK TYPE -->
                    <img v-if="taskType?.taskImage?.includes('http')" :src="taskType?.taskImage" alt="task_type" :title="taskType?.name"  class="task__type-image ml-10px vertical-middle">
                    <WasabiImage 
                        v-else
                        class="ml-10px vertical-middle tasktype__wasabiimg"
                        :data="{url: taskType?.taskImage}"
                    />

                    <div @click="!showArchiveVar ? toggleTaskDetail(task) : ''" class="task_name_wrapper task_Name ml-6px">
                        <!-- TASK NAME -->
                        <span v-if="!editTaskName" class="text-ellipsis d-inline-block edit__taskname" :title="task.TaskName">
                            {{task.TaskName}}
                        </span>
                        <InputText
                            v-else
                            :input-id="'taskRename'+data._id"
                            v-model.trim="taskName"
                            :is-direct-focus="true"
                            :max-length="250"
                            :place-holder="$t('PlaceHolder.Enter_Task_Name')"
                            height="30px"
                            :isOutline="false"
                            @blur="editTaskName = false;"
                            @enter="editTaskName = false, updateTaskName()"
                        />
                        <div class="d-flex align-items-center task-options-image img__parent-task ml-5px p3x-5px" v-if="data?.isParentTask && ((showArchiveVar || searchedTask) ? data?.subtaskArray?.length : data?.subTasks)">
                            <img :src="subTaskImage" alt="subTaskImage" class="mr-2px">
                            {{(showArchiveVar || searchedTask) ? data?.subtaskArray?.length : data?.subTasks}}
                            <div class="count-block ml-5px" v-if="myParentCounts">
                                {{myParentCounts > 99 ? "+99" : myParentCounts}}
                            </div>
                        </div>
                        <!-- TASK OPTIONS -->
                        <div class="align-items-center justify-content-evenly task-options" :class="[{'d-flex':dropVisible, 'd-none' : !dropVisible }]" v-if="!showArchiveVar && !editTaskName && clientWidth > 765">
                            <template v-if="task.isParentTask">
                                <div v-if="checkPermission('task.sub_task_create',projectData.isGlobalPermission) === true" @click.stop="$emit('createTask'), (data.isExpanded ? '' : $emit('toggle'))">
                                    <img :src="addlistCheklistPlus" alt="addlistCheklistPlus" class="task-options-image">
                                </div>
                            </template>
                            <div v-if="checkPermission('task.task_name_edit',projectData.isGlobalPermission) === true" @click.stop="taskName = props.data.TaskName, editTaskName = true">
                                <img :src="editing" alt="editing" class="task-options-image">
                            </div>
                            <!-- Tag List -->
                        </div>
                    </div>
                    <!-- <img :src="clockBlue" alt="clockBlue"> -->
                </div>
            </div>

            <!-- RIGHT SECTION -->
            <div class="new-col2 ignore-drag">
                <div class="common-section task">
                    <!-- CHAT COUNTS -->
                    <span class="chat-main-new position-re task_right" @click.stop="!showArchiveVar ? toggleTaskDetail(task, false, 'comment') : ''">
                        <img :src="chatIcon" alt="chatIcon" :class="{'cursor-pointer': !showArchiveVar}">
                        <div class="position-ab count-block show__count" v-if="myCounts">
                            {{myCounts > 99 ? "+99" : myCounts}}
                        </div>
                    </span>

                    <!-- ASSIGNEE -->
                    <span class="assignee-main-new task_right" v-if="checkPermission('task.task_assignee',projectData.isGlobalPermission) !== null">
                        <Assignee
                            v-if="checkPermission('task.task_assignee',projectData.isGlobalPermission) === true && checkPermission('task.task_list',projectData.isGlobalPermission) == true"
                            :users="task.AssigneeUserId"
                            :options="permittedOptions"
                            :num-of-users="2"
                            imageWidth="30px"
                            :addUser="!showArchiveVar"
                            @selected="changeAssignee(checkApps('MultipleAssignees',projectData) ? 'add' : 'replace', $event)"
                            @removed="changeAssignee('remove', $event)"
                            :isDisplayTeam="true"
                            :multiSelect="checkApps('MultipleAssignees')"
                        />
                        <Assignee
                            v-else
                            :users="task.AssigneeUserId"
                            :options="nonPermittedOptions"
                            :num-of-users="2"
                            imageWidth="30px"
                            :addUser="!showArchiveVar"
                            @selected="changeAssignee(checkApps('MultipleAssignees',projectData) ? 'add' : 'replace', $event)"
                            @removed="changeAssignee('remove', $event)"
                            :isDisplayTeam="true"
                            :multiSelect="checkApps('MultipleAssignees')"
                        />
                    </span>

                    <!-- DUE DATE -->
                    <span class="duedate-new task_right" v-if="checkPermission('task.task_due_date',projectData.isGlobalPermission) !== null">
                        <DueDateCompo
                            id="due-date-task"
                            :displyDate="dueDate? dueDate : ''"
                            :disabledDates="task.dueDateDeadLine"
                            @SelectedDate="($event) => updateDueDate($event)"
                            :autoposition="false"
                            :position="`right`"
                            v-if="!showArchiveVar && checkPermission('task.task_due_date',projectData.isGlobalPermission) === true && checkPermission('task.task_list',projectData.isGlobalPermission) == true && showArchiveVar === false"
                        />
                        <template v-else>
                            <span v-if="task.DueDate">{{convertDateFormat(task.DueDate,'',{showDayName:false})}}</span>
                            <span v-else>No Due Date</span>
                        </template>
                    </span>

                    <!-- CREATED DATE -->
                    <span class="key-new task_right">
                        {{convertDateFormat(task?.createdAt,'',{showDayName: false})}}
                    </span>

                    <!-- TASK PRIORITY -->
                    <span class="priority-new task_right" v-if="checkPermission('task.task_priority',projectData.isGlobalPermission) !== null && checkApps('Priority')">
                        <Priority
                            :priorityVal="task.Task_Priority"
                            @select="updatePriority"
                            :permission="!showArchiveVar && checkPermission('task.task_priority',projectData.isGlobalPermission) === true"
                        />
                    </span>

                    <!-- TASK KEY -->
                    <span class="key-new task_right">
                        {{task.TaskKey}}
                    </span>
                </div>
            </div>
        </div>
        <ConfirmationSidebar
            v-model="showSidebar"
            :title="`${archive ? $t('Projects.archive') : $t('Projects.delete')}`"
            :message="archive ? $t('conformationmsg.archive') : $t('conformationmsg/delete')"
            :confirmationString="`${archive ? 'archive' : 'delete'}`"
            :acceptButtonClass="archive ? 'btn-primary': 'btn-danger'"
            :acceptButton="`${archive ? $t('Projects.archive') : $t('Projects.delete')}`"
            @confirm="updateTask(), showSidebar = false"
        />
        <ConvertToSubTaskSidebar v-if="openConvertSubTaskSidebar === true" :closeSideBar="openConvertSubTaskSidebar"  @isConvertSubtaskOPen="(val) => {sidebarOPen(val)}" :isMoveTask="openMoveSidebar" :openMoveSubTask="openMoveSubTask" :isMergeTask="openMergeTask" :isDuplicate="duplicateTaskSidebar" :task="task" :isConvertTask="openConvertToTask"/>
        <ConvertToList v-if="converrtToListSidebar === true" :openSidebar="converrtToListSidebar" @closeSidebar="(val) => {converrtToListSidebar = val}" :task="task" />
    </div>
</template>

<script setup>
// PACKAGES
import { ref, watch, defineProps, inject, defineEmits, defineComponent, computed, onMounted } from "vue"

// COMPONENTS
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import InputText from "@/components/atom/InputText/InputText.vue"
import Priority from "@/components/molecules/PriorityCompo/PriorityComp.vue"
import TaskStatus from "@/components/atom/TaskStatus/TaskStatus.vue"
import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import ConvertToSubTaskSidebar from '@/components/molecules/ConvertToSubTaskSidebar/ConvertToSubTaskSidebar.vue';
import ConvertToList from '@/components/molecules/ConvertToList/ConvertToList.vue';
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";

// UTILS
import taskClass from "@/utils/TaskOperations";
import { useConvertDate, useCustomComposable, useGetterFunctions } from "@/composable";
import { useStore } from "vuex";
import { useToast } from "vue-toast-notification"
import { useUpdateTasks } from "@/views/Projects/helper"
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const dropVisible = ref(false)
const clientWidth = inject('$clientWidth');
const projectData = inject("selectedProject");
const userId = inject('$userId');
const {getUser} = useGetterFunctions();
const {getters} = useStore();
const companyId = inject("$companyId");
const searchedTask = inject('searchedTask');
const {convertDateFormat} = useConvertDate();
const {checkPermission, checkApps} = useCustomComposable();
const showArchiveVar = inject("showArchived");
const $toast = useToast()
const openConvertSubTaskSidebar = ref(false);
const converrtToListSidebar = ref(false);
const openMoveSubTask = ref(false);
const openMoveSidebar = ref(false);
const openMergeTask = ref(false);
const duplicateTaskSidebar = ref(false);
const {updateTaskByGroup} = useUpdateTasks();

// IMAGES
const dragIcon = require("@/assets/images/svg/move_table_icon.svg");
const triangleBlack = require("@/assets/images/svg/triangleBlack.svg");
const inventoryIcon = require("@/assets/images/inventory_2.png");
const deleteIcon = require("@/assets/images/DeleteIcon.png");
const filledStar = require("@/assets/images/svg/start10.svg");
const blankStar = require("@/assets/images/svg/blankStar.svg");
const addlistCheklistPlus = require("@/assets/images/svg/addlistCheklistPlus.svg");
const editing = require("@/assets/images/editing.png");
const subTaskImage = require("@/assets/images/subtask2.png");
const pointer = require("@/assets/images/svg/pointer.svg");
const extendedPointer = require("@/assets/images/svg/pointer_extended.svg");
const chatIcon = require("@/assets/images/svg/ChatIcon.svg");
// const clockBlue = require("@/assets/images/svg/clock_timer_svg.svg");

// EMITS
const emits = defineEmits(["toggle", "createTask"]);

// COMPONENT
defineComponent({
    name: "Task-Component",

    components: {
        Assignee,
        // InputText,
        Priority,
        TaskStatus,
        DueDateCompo,
        ConfirmationSidebar
    }
})

const props = defineProps({
    data: {
        type: Object,
        default: null
    },
    lastChild: {
        type: Boolean,
        default: false
    },
    parentAssignee: {
        type: Array,
        default: () => []
    }
})

const showSidebar = ref(false);
const archive = ref(false);


const companyUsers = computed(() => getters["settings/companyUsers"]?.map((x) => x.userId))

const companyOwner = computed(() => {
    return getters["settings/companyOwnerDetail"];
})
const sideScrollWidth = ref(769);
const task = ref(props.data);
const toggleTaskDetail = inject('toggleTaskDetail')
const statusSearch = ref("");
const taskName = ref(props.data.TaskName);
const editTaskName = ref(false);
const openConvertToTask = ref(false)
const assigneeInProgress = ref({});

const dueDate = computed(() => props.data.DueDate)

const projectStatus = computed(() => {
    return projectData.value.taskStatusData.filter((x) => x.name?.toLowerCase().includes(statusSearch.value.toLowerCase()))
})

const favourite = computed(() => {
    return props.data.favouriteTasks && props.data.favouriteTasks.length && props.data.favouriteTasks.filter((x) => userId.value && x === userId.value).length;
})

const taskStatus = computed(() => {
    return projectData.value.taskStatusData.find((x) => x.key === task.value.statusKey)
})
const taskType = computed(() => {
    return projectData.value.taskTypeCounts.find((x) => x.key === task.value.TaskTypeKey)
})

const sprintData = computed(() => {
    let sprintData = false;
    if (projectData.value && props.data) {
        sprintData = props.data.folderObjId ? projectData.value?.sprintsfolders?.[props.data.folderObjId]?.sprintsObj?.[props.data.sprintId] : projectData.value?.sprintsObj?.[props.data.sprintId]
    }

    return sprintData || null;
})
const permittedOptions = computed(() => {
    let users = [];
    if(sprintData.value) {
        if(props.data.isParentTask) {
            if(sprintData.value?.private) {
                users = sprintData.value?.AssigneeUserId || [];
            } else {
                if(projectData.value?.isPrivateSpace) {
                    users = projectData.value?.AssigneeUserId || [];
                } else {
                    users = companyUsers.value;
                }
            }
        } else {
            if(sprintData.value?.private) {
                users = props.parentAssignee.filter((x) => sprintData.value?.AssigneeUserId?.includes(x))
            } else {
                users = props.parentAssignee
            }
        }
    }

    if(projectData.value?.isPrivateSpace) {
        users = users.filter((x) => projectData.value?.AssigneeUserId.includes(x));
        return Array.from(new Set([...users, ...(props.data?.AssigneeUserId || [])]));
    } else {
        return users;
    }
})
const nonPermittedOptions = computed(() => {
    let users = [];
    if(sprintData.value) {
        if(props.data.isParentTask) {
            if(sprintData.value?.private) {
                users = (sprintData.value?.AssigneeUserId || []).filter((x) => x === userId.value);
            } else {
                if(projectData.value?.isPrivateSpace) {
                    users = (projectData.value?.AssigneeUserId || []).filter((x) => x === userId.value);
                } else {
                    users = [userId.value];
                }
            }
        } else {
            users = (props.parentAssignee || [])?.filter((x) => x === userId.value)
            if(sprintData.value?.private) {
                users = users.filter((x) => sprintData.value?.AssigneeUserId?.includes(x))
            }
        }
    }
    if(projectData.value?.isPrivateSpace) {
        users = users.filter((x) => projectData.value?.AssigneeUserId.includes(x));
        return users;
    } else {
        return users;
    }
})

watch(() => props.data, (newVal, oldVal) => {
    if(JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        task.value = newVal;
    }
})

const taskCollapsed = inject("taskCollapsed");
onMounted(() => {
    if(!taskCollapsed.value) {
        emits("toggle");
    }
})

function getUserData() {
    const user = getUser(userId.value);
    const userData = {
        id: user.id,
        Employee_Name: user.Employee_Name,
        companyOwnerId: companyOwner.value.userId,
    }

    return userData;
}

function updateTask(value = null) {
    const deletedStatusKey = value !== null ? value : archive.value ? 2 : 1;
    const userData = getUserData();
    const project = {
        _id: projectData.value._id,
        CompanyId: projectData.value.CompanyId,
        lastTaskId: projectData.value.lastTaskId,
        ProjectName: projectData.value.ProjectName,
        ProjectCode: projectData.value.ProjectCode
    }
    taskClass.updateArchiveDelete({
        companyId: companyId.value,
        projectData: project,
        sprintId: task.value.sprintId,
        task: task.value,
        folderId : task.value.folderObjId ? task.value.folderObjId : '',
        userData,
        deletedStatusKey,
    })
    .then((res) => {
        if(res.status) {
            $toast.success(t(`Toast.Task ${value !== null ? 'restored' : archive.value ? 'archived' : 'deleted'} successfully`), { position: "top-right" })
        }
    })
    .catch((err) => {
        console.error(err);
    })
}

// UPDATE TASK NAME
function updateTaskName() {
    if(taskName.value.trim().length < 3 || taskName.value.trim().length > 250) return;

    const userData = getUserData();

    const firebaseObj = {
        'TaskName': taskName.value
    }
    let obj = {
        'previousTaskName': props.data.TaskName,
        'userName' : userData.Employee_Name
    }
    const project = {
        _id: projectData.value._id,
        CompanyId: projectData.value.CompanyId,
        lastTaskId: projectData.value.lastTaskId,
        ProjectName: projectData.value.ProjectName,
        ProjectCode: projectData.value.ProjectCode
    }

    taskClass.updateTaskName({firebaseObj, projectData: project, taskData: props.data, obj, userData})
    .then(() => {
        $toast.success(t(`Toast.Task_name_updated_successfully`), {position: "top-right"})
    })
    .catch((err) => {
        console.error(err);
    })
}

// CHANGE STATUS
function changeStatus(status) {
    const statusIndex = projectData.value.taskStatusData.findIndex((x) => x.key === props.data.statusKey);
    if(statusIndex === -1) return;
    updateTaskByGroup(props.data, status, 0);
}

// MARK FAVOURITE
function markAsFavourite() {
    taskClass.markAsFavourite({
        companyId: projectData.value.CompanyId,
        projectId: projectData.value._id,
        sprintId: props.data.sprintId,
        taskData: props.data,
        userId: userId.value,
    })
    .then((res) => {
        if(res.status === 200){
            $toast.success(res.statusText, {position: "top-right"});
        }else{
            $toast.error(t('Toast.something_went_wrong'), { position: 'top-right' });
        }
    })
    .catch((error) => {
        console.error("ERROR in markAsFavourite: ", error);
        $toast.error(t('Toast.something_went_wrong'), { position: 'top-right' });
    })
}

// CHANGE ASSIGNEE
function changeAssignee(type, value) {
    if(!value?.id) return;
    if(assigneeInProgress.value[value?.id] && assigneeInProgress.value[value?.id] === type) return;
    assigneeInProgress.value[value?.id] = type;

    const userData = getUserData();

    let operation = ""

    if(type === "add") {
        operation = "assigneeAdd"
    } else if(type === 'remove') {
        operation = "assigneRemove"
    } else if(type === 'replace') {
        operation = "replace"
    }

    let updateObject = {
        AssigneeUserId : value.id
    }

    const project = {
        _id: projectData.value._id,
        CompanyId: projectData.value.CompanyId,
        lastTaskId: projectData.value.lastTaskId,
        ProjectName: projectData.value.ProjectName,
        ProjectCode: projectData.value.ProjectCode
    }

    taskClass.updateAssignee({
        firebaseObj: updateObject,
        projectData: project,
        taskData: props.data,
        employeeName: getUser(value.id).Employee_Name,
        type: operation,
        userData
    })
    .then(() => {
        delete assigneeInProgress.value[value?.id];
        $toast.success(t(`Toast.Assignee ${type === "add" || type === "replace" ? 'added' : 'removed'} successfully`), {position: "top-right"})
    })
    .catch((error) => {
        delete assigneeInProgress.value[value?.id];
        console.error("ERROR in changeAssignee: ", error);
    })
}

// CHANGE DUE DATE
const updateDueDate = (event) => {
    try {
        if(!event?.dateVal) return;
        updateTaskByGroup(props.data, {seconds: new Date(event.dateVal).getTime()/1000}, 3);
    } catch (error) {
        console.error("ERROR in updateDueDate: ", error);
    }
}

// CHANGE PRIORITY
function updatePriority(val = null) {
    if(!val) return;
    updateTaskByGroup(props.data, val, 2);
}

const myCounts = computed(() => {
    let total = 0;

    if(getters["users/myCounts"]?.data?.[`task_${projectData.value._id}_${task.value.sprintId}_${task.value._id}_comments`]) {
        total += getters["users/myCounts"]?.data?.[`task_${projectData.value._id}_${task.value.sprintId}_${task.value._id}_comments`] || 0
    }

    return total;
})
const myParentCounts = computed(() => {
    let total = 0;

    if(getters["users/myCounts"]?.data?.[`parentTask_${projectData.value._id}_${task.value.sprintId}_${task.value._id}_comments`]) {
        total += getters["users/myCounts"]?.data?.[`parentTask_${projectData.value._id}_${task.value.sprintId}_${task.value._id}_comments`] || 0
    }

    return total;
})
const sidebarOPen = (val) => {
    openConvertSubTaskSidebar.value = val;
    openMoveSubTask.value = false;
    openMoveSidebar.value = false;
    duplicateTaskSidebar.value = false;
    openConvertToTask.value = false;
}
</script>

<style src="./style.css">

</style>