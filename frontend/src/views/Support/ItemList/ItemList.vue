<template>
    <Transition>
        <div v-if="groupType === 1 ? ((searchedTask ? filteredTasksGetter.length : items?.length) || !item?.users?.length) : (!searchedTask || filteredTasksGetter.length)" class="item_wrapper" @scroll="checkScroll">
            <div class="new-row item_head">
                <div class="new-col1" :style="`${clientWidth > sideScrollWidth ? 'border:0px' : ''};`">
                    <div class="common-section head" @click="() => {$emit('toggle', item); $forceUpdate();}">
                        <template v-if="groupType === 1">
                            <img src="@/assets/images/svg/triangleBlack.svg" alt="traingle" :style="`margin-right: 5px; transform: rotateZ(${item.isExpanded ? 90 : 0}deg)`">
                            <div class="cursor-default position-re d-flex align-items-center ml-8px assignee__wrapper" v-if="item.value?.length">
                                <Assignee
                                    :users="item.value.split('_')"
                                    :num-of-users="3"
                                    imageWidth="30px"
                                    :addUser="false"
                                    class="mr-5px"
                                />
                                <h5 v-if="clientWidth > 767" class="text-ellipse item-title font-size-14" :style="`color: ${item.textColor ? item.textColor : '#3a3a3a'}; background-color: ${item.backColor ? item.backColor : 'transparent'};`">
                                    <span v-for="(user, userIndex) in item.users" :key="userIndex">
                                        {{userIndex !== 0 ? ", " : "" }}{{user.Employee_Name}}
                                    </span>
                                </h5>
                            </div>
                            <div class="position-re d-flex align-items-center" v-else>
                                <img src="@/assets/images/Assign.png" alt="unassigned"/>
                                <h5 class="text-ellipse item-title" :style="`color: ${item.textColor ? item.textColor : '#818181'}; background-color: ${item.backColor ? item.backColor : 'transparent'}; margin-left: 5px;`">{{$t('general.unassigned')}}</h5>
                            </div>
                            <!-- <span>{{getTaskCount(item)}} Tasks</span> -->
                            <span class="font-size-14 ml-6px dark-gray">{{searchedTask ? filteredTasksGetter.length : tasksFound}} {{$t('Projects.tasks')}}</span>
                        </template>
                        <template v-else>
                            <img src="@/assets/images/svg/triangleBlack.svg" alt="traingle" class="mr-5px" :style="`transform: rotateZ(${item.isExpanded ? 90 : 0}deg); width: 6px;`">
                            <span class="text-ellipse status-sprint font-weight-500" :style="`color: ${item.textColor ? item.textColor : ''}; background-color: ${item.bgColor ? item.bgColor : 'transparent'}`">
                                <WasabiImage v-if="item.image" :data="{url: item.image, title: item.name}" class="mr-5px"/>
                                {{item.name}}
                            </span>
                            <!-- <span>{{getTaskCount(item)}} Tasks</span> -->
                            <span class="dark-gray font-size-13 font-weight-400 ml-6px tasks__title">{{searchedTask ? filteredTasksGetter.length : tasksFound}} {{$t('Projects.tasks')}}</span>
                        </template>
                    </div>
                </div>
                <div class="new-col2">
                    <div class="common-section head">
                        <draggable v-model="headers" :disabled="true" class="span_wrapper" tag="div" @update:modelValue="updateItem($event)" @change="updateItem($event)" item-key="TaskName" :group="`itemheader_${props.sprintId}_${item._id}}`">
                            <template #item="{element: head}">
                                <span
                                    class="task_right dark-gray font-weight-500 font-size-12"
                                    :class="{'item-head-draggable-div' : false}"
                                    v-if="(head.funcPermission ? checkPermission(head.funcPermission,projectData.isGlobalPermission) !== null : true ) && (head.appPermission ? checkApps(head.appPermission) : true )"
                                >
                                    {{ head.label }}
                                </span>
                            </template>
                        </draggable>
                        <!-- <span class="chat-main-new">Chat</span>
                        <span class="assignee-main-new" >Assignee</span>
                        <span class="duedate-new" >Due Date</span>
                        <span class="priority-new">Priority</span>
                        <span class="key-new">Key</span> -->
                        <span class="task_right" v-if="!projectData?.deletedStatusKey && $route.name!== 'Support'"></span>
                    </div>
                </div>
            </div>
            <div v-if="item.isExpanded">
                <draggable
                    handle=".draggable_icon"
                    :class="{'isDisabled': item.isDisabled}"
                    :clone="clone"
                    :move="checkMove"
                    :list="(!searchedTask ? items : filteredTasksGetter)"
                    tag="div"
                    @change="draggedTaskId = '',updateItem('task',$event, item)"
                    item-key="TaskName"
                    :group="{name: 'task'}"
                    :sortable="false"
                >
                    <template #item="{ element: task }">
                        <div @dragend="dragEnd" @dragstart="dragStart" @dragover="changeExpanded($event, task, true)">
                            <Task
                                :data="task"
                                :key="task._id"
                                @toggle="toggleTask(task)"
                                @createTask="createTask = task._id"
                                class="Task main-task"
                                v-if="(showArchived ? true : !task.deletedStatusKey)"
                            />
                            <CreateTask
                                v-if="createTask === task._id"
                                :sprint="{...task.sprintArray, id: task.sprintId, folderId: task.folderObjId}"
                                :taskId="task._id"
                                :assigneeOptions="task.AssigneeUserId"
                                @cancel="createTask = ''"
                                class="create__task-id"
                                :groupBy="groupType"
                            />

                            <div class="subtask-wrapper" @scroll="checkSubTaskScroll($event, task)">
                                <template v-if="task.isExpanded && (showArchived ? task.deletedStatusKey !== 2 : true)">
                                    <!--  -->
                                    <draggable 
                                        :list="task?.subtaskArray"
                                        tag="div"
                                        :move="checkMove"
                                        @change="draggedTaskId = '',updateItem('subTask', $event, task)"
                                        item-key="TaskName"
                                        :group="{name: 'task'}"
                                        class="subTaskAddRemove"
                                        :class="{'SubTaskAdd':task.isExpanded, 'SubTaskAddRemove':!task.isExpanded}"
                                        :sortable="false"
                                    >
                                        <template #item="{ element: subTask, index }">
                                            <div @dragend="dragEnd">
                                                <Task
                                                    :data="subTask"
                                                    :key="subTask._id"
                                                    :lastChild="(task.subtaskArray.length - 1) === index"
                                                    :parentAssignee="task.AssigneeUserId"
                                                    @toggle="toggleTask(subTask)"
                                                    @createTask="createTask = subTask._id"
                                                    class="Task sub-task"
                                                />
                                            </div>
                                        </template>
                                    </draggable>
                                    <div :id="`listItem_${sprintId}_${item.key}_${task._id}`" class="table__list-id w-100"></div>
                                </template>
                            </div>
                        </div>
                    </template>
                </draggable>
                <div :id="`listItem_${sprintId}_${item.key}`" class="table__list-id w-100"></div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
// PACKAGES
import { computed, ref, watch, defineProps, unref, onMounted, inject, defineEmits, nextTick } from 'vue';
import { useStore } from 'vuex';
import draggable from 'vuedraggable';
import { useCustomComposable } from '@/composable';
import { taskListHelper, useUpdateTasks } from '../helper';
import taskClass from "@/utils/TaskOperations";

// COMPONENTS
import Task from '../Task/Task.vue';
import WasabiImage from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue";
import CreateTask from "../CreateTask/CreateTask.vue"
import Assignee from "@/components/molecules/Assignee/Assignee.vue"

// UTILS
const userId = inject("$userId")
const {getters,commit} = useStore();
const {getSprintTasks} = taskListHelper();
const {checkPermission, checkApps} = useCustomComposable();
const clientWidth = inject('$clientWidth');
const searchedTask = inject('searchedTask');
const projectData = inject('selectedProject');
const taskCollapsed = inject("taskCollapsed");
const showArchived = inject("showArchived");
const companyId = inject("$companyId");
const {updateTaskByGroup} = useUpdateTasks();

// IMAGES

const props = defineProps({
    item: Object,
    groupType: Number,
    sprintId: String,
    projectId: String,
    commonDateFormatForDate: String,
    project:{
        type:Object,
        default:() => {}
    },
    sprintObject:{
        type:Object,
        default:() => {}
    }
});

defineEmits(["toggle"])

onMounted(() => {
    if(tasksGetter.value && tasksGetter.value.length) {
        items.value =  JSON.parse(JSON.stringify(tasksGetter.value));
    }

    nextTick(() => {
        let options = {
            root: document.querySelector("#list_scroll"),
            rootMargin: "0px",
            threshold: 0.1,
        };
        let obs = new IntersectionObserver((e) => {
            if(e[0] && e[0]?.isIntersecting) {
                if(getters['taskData/tasks']?.[props.projectId]?.[props.sprintId]?.tasks.length) {
                    getSprintTasks({
                        projectId: props.projectId,
                        sprintId: props.sprintId,
                        item: props.item,
                        fetchNew: true,
                        projectData: projectData.value
                    })
                }
            }
        }, options);
        let target = document.querySelector(`#listItem_${props.sprintId}_${props.item.key}`);
        if(obs && target){
            obs.observe(target);
        }
    })
})

const headers = ref([
    {
        label: "Chat",
        key: "commentCounts"
    },
    {
        label: "Assignee",
        key: "AssigneeUserId",
        funcPermission: 'task.task_assignee',
    },
    {
        label: "Due Date",
        key: "DueDate",
        funcPermission: 'task.task_due_date',
    },
    {
        label: "Created Date",
        key: "createdAt"
    },
    {
        label: "Priority",
        key: "Task_Priority",
        funcPermission: 'task.task_priority',
        appPermission: 'Priority'
    },
    {
        label: "Key",
        key: "TaskKey"
    },
])
const searchKey = ref("");
const draggedTaskId = ref("");

const sideScrollWidth= 765;
const taskFields = ref(projectData.value?.taskFields || {});
const filteredTaskFields = ref(Object.values(taskFields.value));

watch(projectData, () => {
    taskFields.value = projectData.value?.taskFields || {}
})

const filterHeaders = ref(headers.value.filter((x) => filteredTaskFields.value.find((y) => y.key === x.key && y.visible)));
watch([headers, filteredTaskFields], ([val]) => {
    filterHeaders.value = val.filter((x) => filteredTaskFields.value.find((y) => y.key === x.key && y.visible));
})

watch([searchKey, taskFields], () => {
    filteredTaskFields.value = Object.values(taskFields.value).filter((x) => x.label.toLowerCase().includes(searchKey.value.toLowerCase()));
})

function checkMove(evt){
    try {
        draggedTaskId.value = evt.draggedContext.element ? evt.draggedContext.element._id : "";
    } catch (error) {
        console.error("ERROR: ", error);
        return;
    }

    if(evt.willInsertAfter) {
        evt.dragged.style.borderBottom = "none";
        evt.dragged.style.borderTop = "1px solid #614add";
    } else {
        evt.dragged.style.borderBottom = "1px solid #614add";
        evt.dragged.style.borderTop = "none";
    }
    return true;
}
function clone(element) {
    return {...element};
}
function dragEnd(e) {
    if (e.target.classList.contains('dragTask')) {
        e.target.classList.remove('dragTask');
    }
    e.target.style.border = "none";
}
function dragStart (e) {
    e.target.classList.add('dragTask');
}
function changeExpanded(e, field) {
    field.subtaskArray = field.subtaskArray && field.subtaskArray.length ? field.subtaskArray : []
    if(!field.isExpanded){
        toggleTask(field);
    }
}
const tasksFound = computed(() => {
    if(getters['taskData/tasks'][props.projectId] && getters['taskData/tasks'][props.projectId][props.sprintId]) {
        const found = JSON.parse(JSON.stringify(getters['taskData/tasks'][props.projectId][props.sprintId]?.found))
        return found?.[`${props.item.searchKey}_${props.item.searchValue}`] || 0
    } else {
        return 0;
    }
})

const tasksGetter = computed(() => {
    if(getters['taskData/tasks'][props.projectId] && getters['taskData/tasks'][props.projectId][props.sprintId]) {
        const store = JSON.parse(JSON.stringify(getters['taskData/tasks'][props.projectId][props.sprintId]))
        let tmp = [];
        if(props.item.searchKey === "DueDate") {
            tmp = store.tasks.filter((x) => {
                return (x.DueDate ? checkCase(props.item.operation, props.item.searchValue, (new Date(x?.[props.item.searchKey]).getTime() / 1000)) : props.item.operation === "non") && !x?.deletedStatusKey
            });
        } else if(props.item.searchKey === "AssigneeUserId") {
            tmp = store.tasks.filter((x) => {
                return x.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === props.item.value && !x?.deletedStatusKey;
            })
        } else {
            tmp = store.tasks.filter((x) => x[props.item.searchKey] === props.item.searchValue && !x?.deletedStatusKey)
        }

        tmp = tmp.map((x) => {
            if(x?.subtaskArray) {
                x.subtaskArray = x.subtaskArray.filter((y) => !y?.deletedStatusKey);
            }
            return x;
        })

        return tmp;
    } else {
        return [];
    }
});
const currentProjectTasks = computed(() => getters['taskData/tasks']);
const filteredTasksGetter = computed(() => {
    if(getters['projectData/searchedTasks']?.length && props.sprintId) {
        if(props.item.searchKey === "DueDate") {
            return getters['projectData/searchedTasks'].filter((x) => {
                return x.sprintId === props.sprintId && x.DueDate?.seconds ? checkCase(props.item.operation, props.item.searchValue, x[props.item.searchKey].seconds) : props.item.operation === "non"
            });
        } else if(props.item.searchKey === "AssigneeUserId") {
            return getters['projectData/searchedTasks'].filter((x) => {
                return x.sprintId === props.sprintId && x.AssigneeUserId.sort((a,b) => a > b ? 1 : -1).join("_") === props.item.value;
            })
        } else {
            return getters['projectData/searchedTasks'].filter((x) => x.sprintId === props.sprintId && x[props.item.searchKey] === props.item.searchValue);
        }
    } else {
        return [];
    }
});

// CHECK DUE DATE FOR GROUP BY
function checkCase(op, todayS, seconds) {
    const dayHrs = 24 * 60 * 60 * 1000;

    switch(op) {
        case "eq":
            return todayS <= seconds && (((todayS * 1000) + dayHrs)/1000) > seconds;

        case "lt":
            return todayS > seconds; // compared second less than todayS

        case "gt":
            return todayS < seconds; // compared second greater than todayS
    }
}

watch([taskCollapsed], ([newVal], [oldVal]) => {
    if(newVal !== oldVal && !searchedTask.value) {
        let tmp = items.value;
        if(newVal === false) {
            tmp.filter((x) => x.isParentTask).forEach((x) => {
                x.isExpanded = true;
                fetchSubTask(x, true);
            })
        } else {
            tmp.filter((x) => x.isParentTask).forEach((x) => {
                x.isExpanded = false;
            })
        }
    }
})

const items = ref([]);
watch(() => unref(tasksGetter), (newVal) => {
    items.value = newVal.map((x) => {
        let index = items.value.findIndex((y) => x._id === y._id);

        if(index !== -1) {
            x.isExpanded = items.value[index].isExpanded;
        }

        return x;
    });
})

const createTask = ref(false);

let subObserver = {};
function toggleTask(task) {
    task.isExpanded = !task.isExpanded;

    if(task.isExpanded) {
        nextTick(() => {
            let options = {
                root: document.querySelector("#list_scroll"),
                rootMargin: "0px",
                threshold: 0.1,
            };
            let obs = new IntersectionObserver((e) => {
                if(e[0] && e[0]?.isIntersecting) {
                    let storeSprintTasks = getters['taskData/tasks']?.[props.projectId]?.[props.sprintId]?.tasks || [];
                    if(storeSprintTasks.length && storeSprintTasks.find((x) => x._id === task._id)) {
                        fetchSubTask(task, true);
                    }
                }
            }, options);

            let target = document.querySelector(`#listItem_${props.sprintId}_${props.item.key}_${task._id}`);

            if(obs && target){
                subObserver[task._id] = obs
                obs.observe(target);
            }
        })
    } else {
        subObserver?.[task._id]?.disconnect();
        subObserver[task._id] = null;
    }

    if(task.isExpanded === true && (!task.subtaskArray || task.subtaskArray.length < 25)) {
        let fetchNew = currentProjectTasks.value?.[props.projectId]?.[props.sprintId].index[`${task._id}_${props.item.searchKey}_${props.item.searchValue}`] === undefined;
        fetchSubTask(task, fetchNew);
    }
}

// DEBOUNCE
const timer = ref(null);
function debouncer(timeout = 1000) {
    return new Promise((resolve) => {
        if(timer.value) {
            clearTimeout(timer.value);
        }
        timer.value = setTimeout(() => {
            resolve();
        }, timeout);
    })
}

function checkScroll(e) {
    debouncer(50)
    .then(() => {
        if(e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight) - 200) {
            getSprintTasks({
                projectId: props.projectId,
                sprintId: props.sprintId,
                item: props.item,
                userId: userId.value,
                fetchNew: true,
                projectData: projectData.value,
            })
        }
    })
    .catch((err) => {
        console.error("error", err);
    })
}
function updateItem(type,e, item) {
    if(
        (e.added && (!e.added.element || !Object.keys(e.added.element).length)) ||
        (e.moved && (!e.moved.element || !Object.keys(e.moved.element).length)) ||
        (e.removed && (!e.removed.element || !Object.keys(e.removed.element).length))
    ){
        return;
    }
    if(e?.added?.element) {
        const pid = JSON.parse(JSON.stringify(props.project))._id
        const snap = '';
        const sprintId = props.sprintObject.id
        const showAllTasks = true;
        const taskObject = JSON.parse(JSON.stringify(e?.added?.element))
        if(type === 'subTask'){
            if(e?.added?.element?.subTasks <= 0 || e?.added?.element?.subTasks === undefined){
                if(e?.added?.element?.ParentTaskId){
                    commit("projectData/mutateUpdateFirebaseTasks",{
                        snap, 
                        op: "modified",
                        pid,
                        sprintId,
                        data: {...taskObject,isParentTask:false,ParentTaskId:e?.added?.element?.ParentTaskId},
                        showAllTasks,
                        updatedFields:{
                            deletedStatusKey:1,
                            updatedAt:new Date(),
                            ParentTaskId: e?.added?.element?.ParentTaskId,
                            isParentTask: false,
                            subTasks:item?.subTasks ? item?.subTasks + 1 : 1
                        },
                        convertSubTaskToTask:true
                    });
                }
                commit("projectData/mutateUpdateFirebaseTasks",{
                    snap, 
                    op: "modified",
                    pid,
                    sprintId,
                    data: {...taskObject,isParentTask:false,ParentTaskId:item._id},
                    showAllTasks,
                    updatedFields:{
                        deletedStatusKey:1,
                        updatedAt:new Date(),
                        ParentTaskId: item._id,
                        isParentTask: false,
                        subTasks:item?.subTasks ? item?.subTasks + 1 : 1
                    },
                    dragDropcheck:true
                });
            }else{
                if(e?.added?.element?.subtaskArray && e?.added?.element?.subtaskArray.length){
                    commit("projectData/mutateUpdateFirebaseTasks",{
                        snap, 
                        op: "modified",
                        pid,
                        sprintId,
                        data: {...e?.added?.element,isParentTask:false,ParentTaskId:item._id},
                        showAllTasks,
                        updatedFields:{
                            deletedStatusKey:1,
                            updatedAt:new Date(),
                            ParentTaskId: item._id,
                            isParentTask: false,
                            subTasks:item?.subTasks ? item?.subTasks + 1 : 0
                        },
                        dragDropcheck:true
                    });
                    e?.added?.element?.subtaskArray.forEach((x)=>{
                        commit("projectData/mutateUpdateFirebaseTasks",{
                            snap, 
                            op: "modified",
                            pid,
                            sprintId,
                            data: {...x,isParentTask:false,ParentTaskId:item._id},
                            showAllTasks,
                            updatedFields:{
                                deletedStatusKey:1,
                                updatedAt:new Date(),
                                ParentTaskId: item._id,
                                isParentTask: false,
                                subTasks:item?.subTasks ? item?.subTasks + 1 : 0
                            },
                            dragDropcheck:true
                        });
                    })
                }
            }

            taskClass.convertToSubTask({
                companyId: companyId.value,
                projectData: {
                    id:pid
                },
                sprintId: item.sprintId,
                selectedTaskId:e?.added?.element._id,
                taskId: item._id,
                oldProject : {
                    id : pid,
                    taskTypeCounts : props.project.taskTypeCounts,
                    taskStatusData : props.project.taskStatusData
                },
                isSubTask : e?.added?.element?.subTasks <= 0 ? false : true
            }).then(()=>{
            }).catch((error) => {
                console.error("ERROR: ", error);
            });
        }else if(type === "task"){
            if(e?.added?.element.isParentTask === false){
                commit("projectData/mutateUpdateFirebaseTasks",{
                    snap, 
                    op: "modified",
                    pid,
                    sprintId,
                    data: {...taskObject,isParentTask:false,ParentTaskId:e?.added?.element?.ParentTaskId},
                    showAllTasks,
                    convertSubTaskToTask:true
                });
                commit("projectData/mutateUpdateFirebaseTasks",{
                    snap, 
                    op: "modified",
                    pid,
                    sprintId,
                    data: {
                        ...taskObject,
                        status:{
                            key:item.key,
                            text:item.name,
                            type:item.type
                        },
                        statusKey:item.key,
                        statusType:item.type,
                        isParentTask:true,
                        ParentTaskId:''
                    },
                    showAllTasks,
                    updatedFields:{
                        deletedStatusKey:1,
                        updatedAt:new Date(),
                        status:{
                            key:item.key,
                            text:item.name,
                            type:item.type
                        },
                        statusKey:item.key,
                        statusType:item.type,
                        ParentTaskId: '',
                        isParentTask: true,
                        sprintArray:props.sprintObject
                    }
                });
                taskClass.convertToTask({
                    companyId: companyId.value,
                    projectData: {
                        id:pid
                    },
                    taskId : e?.added?.element._id,
                    parentTaskId:e?.added?.element.ParentTaskId,
                    sprintObj: props.sprintObject,
                    oldSprintObj :{
                        id:props.sprintObject.id,
                        folderId:null
                    },
                    oldProject: {
                        id : pid,
                        taskTypeCounts : props.project.taskTypeCounts,
                        taskStatusData : props.project.taskStatusData
                    }
                }).then(() => {
                }).catch((error) => {
                    console.error("ERROR: ", error);
                });
            }
            updateTaskByGroup(e.added.element, item, props.groupType)
            .catch((error) => {
                console.error("ERROR: ", error);
            });
        }
        
    }else{
        console.info('NO Event Found');
    }
    // it will needed in future so it is commented
    // else if (e?.moved && e?.moved?.element){
    // }else if(e?.removed && e?.removed?.element) {
    // }
}
function checkSubTaskScroll(e, task) {
    debouncer(50)
    .then(() => {
        if(e.target.scrollTop >= (e.target.scrollHeight - e.target.clientHeight) - 150) {
            fetchSubTask(task, true);
        }
    })
    .catch((err) => {
        console.error("error", err);
    })
}

function fetchSubTask(task, fetchNew = false) {
    getSprintTasks({
        projectId: props.projectId,
        sprintId: props.sprintId,
        item: props.item,
        userId: userId.value,
        fetchNew: fetchNew,
        projectData: projectData.value,
        parentId: task.isParentTask ? task._id : ""
    })
}
</script>

<style>
@import "./style.css";
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.assignee__wrapper{
    max-width: 78%;
}
.table__list-id{
    height: 100px;
    /* margin-top: -100px; */
    position: absolute;
    bottom: 0;
    z-index: -1;
}
.tasks__title{
    line-height:20px !important;
}
.create__task-id{
    margin: 0px 0px 10px 20px !important;
}
</style>