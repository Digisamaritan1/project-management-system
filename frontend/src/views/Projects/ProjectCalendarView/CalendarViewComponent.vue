<template>
    <div class='calendar__view-section'>
        <div class='calendar__view-wrapper' v-if="isDone">
            <FullCalendar
                class='demo-app-calendar'
                :options='calendarOptions'
            >
                <template v-slot:eventContent='arg'>
                    <span class="leftBorder calendar__view-leftborder" :style="{'border-left': `3px solid ${arg.event.extendedProps.borderLeftColor}!important`}"></span>
                    <img class="task_image" v-if="!arg.event.extendedProps.isParent" :src="subTask"/>&nbsp;
                    <span class="calender-view-task-title">{{ arg.event.title }}</span>
                </template>
            </FullCalendar>
        </div>
        <div v-else>
            <SpinnerComp :is-spinner="!isDone" />
        </div>
    </div>
</template>

<script setup>
    // PACKAGES
    import { computed, defineComponent, ref, inject, defineEmits, defineProps, watch, onMounted, watchEffect, onBeforeUnmount } from 'vue';
    import { useStore } from 'vuex';
    import FullCalendar from '@fullcalendar/vue3';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import interactionPlugin from '@fullcalendar/interaction';
    import subTask from '@/assets/images/png/subtaskShapeBlue.png';
    // import * as helper from '@/views/Timesheet/helper';
    import SpinnerComp from '@/components/atom/SpinnerComp/SpinnerComp.vue';
    import taskClass from "@/utils/TaskOperations";
    import { taskDueDateAdd, taskDueDateChange, taskStartAndDueDateChange, taskStartAndDueDateAdd } from '@/utils/NotificationTemplate';
    import { useGetterFunctions, useMoment, useCustomComposable } from '@/composable';
    import * as env from '@/config/env';
    import { useToast } from 'vue-toast-notification';
    import { apiRequest } from '../../../services';
    import { useI18n } from "vue-i18n";
    const { t } = useI18n();
    const $toast = useToast();
    const { getters } = useStore();
    const companyOwner = computed(() => {
        return getters["settings/companyOwnerDetail"];
    });
    const toggleTaskDetail = inject("toggleTaskDetail");
    const { changeDateFormate } = useMoment();
    const { getUser } = useGetterFunctions();
    const { checkPermission } = useCustomComposable();
    let debounceTimeout;
    const emits = defineEmits(["openTaskModel"]);
    defineComponent({
        name: "CalendarViewComponent",

        components: {
        }
    })
    const companyId = inject('$companyId');
    const dateFormat = inject('$dateFormat');
    const searchedTask = inject('searchedTask');
    const taskDetailOpenObject = ref({});
    const isDone = ref(true);
    const isOpenModel = ref(false);
    const props = defineProps({
        sprint: Object,
        projectData: {
            type: Object,
        },
        calendarDate: {
            type: [String,Number]
        },
        newTaskData: {
            type: Object
        },
        taskSearch: {
            type: String
        }
    })
    const sData = ref(props.sprint);
    const projectData = ref(props.projectData);
    const formatDate = (date) =>  {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
    }

    const handleEventClick = (clickInfo) => {
        taskDetailOpenObject.value = {};
        taskDetailOpenObject.value.CompanyId = companyId.value;
        taskDetailOpenObject.value.ProjectID = clickInfo.event.extendedProps.projectId;
        taskDetailOpenObject.value.sprintId = clickInfo.event.extendedProps.sprintId;
        taskDetailOpenObject.value.id = clickInfo.event.id;
        const {sprintArray, sprintId, folderObjId} = clickInfo.event.extendedProps;
        toggleTaskDetail({
            ProjectID: clickInfo.event.extendedProps.projectId,
            sprintArray: {...sprintArray, id: sprintId, folderId: folderObjId || ""},
            sprintId,
            _id: clickInfo.event.id
        })
    }

    const currentEvents = ref([]);
    const handleEvents = (events) => {
        currentEvents.value = events
    }

    const handleEventsSelect = (events) => {
        isOpenModel.value = true;
        // modalStartDate.value = events.start;
        const endDate = events.end;
        // modalEndDate.value = new Date(endDate.setDate(endDate.getDate() - 1));
        emits('openTaskModel', {
            modalStartDate: events.start,
            modalEndDate: new Date(endDate.setDate(endDate.getDate() - 1))
        });
    };

    const handleEventsChange = (events) => {
        let isUpdate = false;
        if (events.event.startStr !== events.oldEvent.startStr) {
            isUpdate = true;
            // updateStartDate(events);
        }
        if (events.event.endStr !== events.oldEvent.endStr) {
            if (isUpdate) {
                isUpdate = true;
                updateDueDate(events, false);
                return;
            }
            updateDueDate(events, true);
            isUpdate = false;
        }
    }
    const calendarOptions = ref({
        plugins: [
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin // needed for dateClick
        ],
        headerToolbar: false,
        initialView: 'dayGridMonth',
        initialDate: formatDate(new Date().getTime()),
        events: [], // alternatively, use the `events` setting to fetch from a feed
        editable: (checkPermission('task.task_due_date',projectData.value?.isGlobalPermission) == true && checkPermission('task.task_start_date',projectData.value?.isGlobalPermission) == true) ? true : false,
        selectable: (checkPermission('task.task_due_date',projectData.value?.isGlobalPermission) == true && checkPermission('task.task_start_date',projectData.value?.isGlobalPermission) == true) ? true : false,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        eventClick: handleEventClick,
        eventsSet: handleEvents,
        eventChange: handleEventsChange,
        select: handleEventsSelect
        /* you can update a remote database when these fire:
        eventAdd: handleEventsSelect
        eventRemove:
        */
    });

    watch([() => props.calendarDate], (data) => {
        isDone.value = false;
        if (data && data.length) {
            const selectedDate = data[0];
            if (selectedDate) {
                calendarOptions.value.initialDate = formatDate(selectedDate)
                setTimeout(() => {
                    isDone.value = true;
                })
            } else {
                calendarOptions.value.initialDate = formatDate(selectedDate)
                setTimeout(() => {
                    isDone.value = true;
                })
            }
        } else {
            setTimeout(() => {
                isDone.value = true;
            })
        }
    })

    watch([() => props.newTaskData], (data) => {
        taskSubmit(JSON.parse(JSON.stringify(data[0])));
    });

    const filteredTasksGetter = computed(() => {
        if(getters['projectData/searchedTasks']?.length && sData.value.id) {
                return getters['projectData/searchedTasks'].filter((x) => x.sprintId === sData.value.id);
        } else {
            return [];
        }
    });

    const manageSearchData = (mdata) => {
        if(searchedTask.value) {
            const project = JSON.parse(JSON.stringify(projectData.value));
            let allTasks = [];
            mdata.forEach((task) => {
                allTasks = [...allTasks, task]
                if(task.subtaskArray?.length) {
                    allTasks = [...allTasks, ...task.subtaskArray]
                }
            })
            allTasks = allTasks.filter((x) => {
                let valid = true;
                if(x?.startDate === 0 && x?.DueDate === 0) {
                    valid = false;
                }
                return valid;
            })
            allTasks = allTasks.map((data) => {
                if (!data.DueDate || data.DueDate === 0) {
                    data.isStartDate = true;
                    data.DueDate = data.startDate;
                }
                if (!data.startDate || data.startDate === 0) {
                    data.isStartDate = false;
                    data.startDate = data.DueDate;
                }
                const bgColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === data.statusKey).bgColor : 'red';
                const textColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === data.statusKey).textColor : 'white';
                // data.dueDateDeadLine = data?.dueDateDeadLine.map((x) => JSON.stringify({date: x?.date?.seconds ? x.date.seconds : ""}));
                let obj = {
                    allDay: true,
                    id: data._id,
                    title: data.TaskName,
                    start: formatDate(data.startDate),
                    end: formatDate(new Date(data.DueDate).getTime()+86400000),
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    textColor: 'black',
                    borderLeftColor: textColor,
                    isParent: data.isParentTask ? data.isParentTask : false,
                    dueDateDeadLine: data?.dueDateDeadLine ? data.dueDateDeadLine : [],
                    projectId: data?.ProjectID ? data.ProjectID : "",
                    sprintId: data?.sprintId ? data.sprintId : "",
                    taskLeader: data?.Task_Leader ? data.Task_Leader : "",
                    sprintArray: data?.sprintArray ? data.sprintArray : {},
                    isStartDate: data.isStartDate
                }
                return obj;
            })
            calendarOptions.value.events = JSON.parse(JSON.stringify(allTasks));
        }
    }

    watch(filteredTasksGetter, (mdata) => {
        manageSearchData(mdata)
    });

    watchEffect(() => {
        const {data: taskData, pid, sprintId} = JSON.parse(JSON.stringify(getters['projectData/mongoUpdatedTask']));
        if(pid === projectData.value._id && sprintId === props.sprint.id) {
            const project = JSON.parse(JSON.stringify(projectData.value));
            const calendarData = calendarOptions.value.events;
            let isNewTask = true;
            for (let i = 0; i < calendarData.length; i++) {
                const task = calendarData[i];
                if (task.id === taskData._id) {
                    isNewTask = false;
                    if (!taskData.DueDate || taskData.DueDate === 0) {
                        taskData.isStartDate = true;
                        taskData.DueDate = taskData.startDate;
                    }
                    if (!taskData.startDate || taskData.startDate === 0) {
                        taskData.isStartDate = false;
                        taskData.startDate = taskData.DueDate;
                    }
                    const bgColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === taskData.statusKey).bgColor : 'red';
                    const textColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === taskData.statusKey).textColor : 'white';
                    // taskData.dueDateDeadLine = taskData?.dueDateDeadLine.map((x) => JSON.stringify({date: x?.date?.seconds ? x.date.seconds : ""}));
                    task.title = taskData.TaskName;
                    task.start = formatDate(taskData.startDate);
                    task.end = formatDate(new Date(taskData.DueDate).getTime()+86400000);
                    task.backgroundColor = bgColor;
                    task.borderColor = bgColor;
                    task.textColor = 'black';
                    task.borderLeftColor = textColor;
                    task.dueDateDeadLine = taskData?.dueDateDeadLine ? taskData.dueDateDeadLine : [],
                    task.taskLeader = taskData?.Task_Leader ? taskData.Task_Leader : "";
                    task.isStartDate = taskData.isStartDate;
                    break;
                }
                isNewTask = true;
            }
            if (isNewTask && (taskData.DueDate || taskData.startDate)) {
                if ((!taskData.startDate || taskData?.startDate === 0) && (!taskData.DueDate || taskData?.DueDate === 0)) {
                    return;
                }
                const bgColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === taskData.statusKey).bgColor : 'red';
                const textColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === taskData.statusKey).textColor : 'white';
                if (!taskData.DueDate || taskData.DueDate === 0) {
                    taskData.isStartDate = true;
                    taskData.DueDate = taskData.startDate;
                }
                if (!taskData.startDate || taskData.startDate === 0) {
                    taskData.isStartDate = false;
                    taskData.startDate = taskData.DueDate;
                }
                // taskData.dueDateDeadLine = taskData?.dueDateDeadLine.map((x) => JSON.stringify({date: x?.date?.seconds ? x.date.seconds : ""}));
                calendarData.push({
                    allDay: true,
                    id: taskData._id,
                    title: taskData.TaskName,
                    start: formatDate(taskData.startDate),
                    end: formatDate(new Date(taskData.DueDate).getTime()+86400000),
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    textColor: 'black',
                    borderLeftColor: textColor,
                    isParent: taskData.isParentTask ? taskData.isParentTask : false,
                    dueDateDeadLine: taskData?.dueDateDeadLine ? taskData.dueDateDeadLine : [],
                    projectId: taskData?.ProjectID ? taskData.ProjectID : "",
                    sprintId: taskData?.sprintId ? taskData.sprintId : "",
                    taskLeader: taskData?.Task_Leader ? taskData.Task_Leader : "",
                    sprintArray: taskData?.sprintArray ? taskData.sprintArray : {},
                    isStartDate: taskData.isStartDate
                });
                calendarOptions.value.events = calendarData;
            }
        }
    })

    watch(props.sprint, (newVal) => {
        sData.value = newVal;
    })
    watch(searchedTask, (data) => {
        if (data) {
            calendarOptions.value.selectable = false;
        } else {
            calendarOptions.value.selectable = true;
            getTaskData();
        }
    })

    const taskSubmit = (data) => {
        const tmpArray = JSON.parse(JSON.stringify(calendarOptions.value)).events;
        const finalArray = [...tmpArray]
        const project = JSON.parse(JSON.stringify(projectData.value));
        data.statusKey = data?.statusKey ? data.statusKey : 1;
        const bgColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === data.statusKey).bgColor : 'red';
        const textColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === data.statusKey).textColor : 'white';
        finalArray.push({
            allDay: true,
            id: data._id,
            title: data.TaskName,
            start: formatDate(new Date(data.startDate).getTime()),
            end: formatDate((new Date(data.DueDate).getTime())+86400000),
            backgroundColor: bgColor,
            borderColor: bgColor,
            textColor: 'black',
            borderLeftColor: textColor,
            isParent: data.isParentTask ? data.isParentTask : false,
            dueDateDeadLine: data?.dueDateDeadLine ? data.dueDateDeadLine : [],
            projectId: data?.ProjectID ? data.ProjectID : "",
            sprintId: data?.sprintId ? data.sprintId : "",
            taskLeader: data?.Task_Leader ? data.Task_Leader : "",
            sprintArray: data?.sprintArray ? data.sprintArray : {},
            isStartDate: true
        })
        calendarOptions.value.events = finalArray;
        isOpenModel.value = false;
    }

    function getUserData(id) {
        const user = getUser(id);
        return {
            id: user.id,
            Employee_Name: user.Employee_Name,
            companyOwnerId: companyOwner.value.userId,
        };
    }

    const updateDueDate = (event, key) => {
        try {
            const extendedProps = event.event.extendedProps;
            const endDate = event.event.end;
            const id = event.event.id;
            const projectId = event.event.extendedProps.projectId;
            const sprintId = event.event.extendedProps.sprintId;
            const taskName = event.event.title;
            const taskLeader = event.event.extendedProps.taskLeader;
            const sprintArray = event.event.extendedProps.sprintArray;
            const userData = getUserData(taskLeader);
            let newdueDateDeadLine = [];
            if(extendedProps.dueDateDeadLine.length > 0) {
                extendedProps.dueDateDeadLine.forEach((date) => {
                    const dateConvert = date;
                    newdueDateDeadLine.push({ date: new Date(dateConvert.date) })
                })
                newdueDateDeadLine.push({ date: new Date(endDate.setDate(endDate.getDate() - 1))});
            } else {
                newdueDateDeadLine.push({ date: new Date(endDate.setDate(endDate.getDate() - 1))});
            }

            const updateobj = {
                DueDate: new Date(endDate),
                dueDateDeadLine: newdueDateDeadLine
            }
            const typesenseObj = {
                DueDate: new Date(endDate).getTime()/1000,
                dueDateDeadLine: newdueDateDeadLine.map((x) => JSON.stringify(x))
            }
            let notificationObj = {
                key: "task_due_date",
                projectId: projectId,
                taskId: id,
                sprintId: sprintId
            }
            let obj = {
                'ProjectName': projectData.value.ProjectName,
                'TaskName': taskName,
            }
            if(extendedProps.dueDateDeadLine.length > 0 ) {
                const lastRecord = extendedProps.dueDateDeadLine[extendedProps.dueDateDeadLine.length - 1];
                const dateConvert = lastRecord;
                obj.previousDate = changeDateFormate(new Date(dateConvert.date))
                obj.changedDate = changeDateFormate(endDate.setDate(endDate.getDate() - 1))
                notificationObj.message = taskDueDateChange(obj);
                if (!key) {
                    notificationObj.message = taskStartAndDueDateChange(obj)
                }
            } else  {
                obj.lastDate = changeDateFormate(endDate.setDate(endDate.getDate() - 1))
                notificationObj.message = taskDueDateAdd(obj);
                if (!key) {
                    notificationObj.message = taskStartAndDueDateAdd(obj);
                }
            }
            const finalprojectData = {
                _id: projectData.value._id,
                CompanyId: projectData.value.CompanyId,
                lastTaskId: projectData.value.lastTaskId,
                ProjectName: projectData.value.ProjectName,
                ProjectCode: projectData.value.ProjectCode
            }
            let updateObj = {
                commonDateFormatString: dateFormat.value,
                firebaseObj: updateobj,
                typesenseObj: typesenseObj,
                project: finalprojectData,
                task: {
                    sprintId: sprintId,
                    _id: id,
                    sprintArray: sprintArray
                },
                obj: notificationObj,
                userData
            }
            if (!key) {
                updateObj.isUpdateTask = false;
            }
            if (!key) {
                let newFirebaseObj = {
                    ...updateObj.firebaseObj,
                    startDate: event.event.start
                }
                const startAndDueDateObj = {
                    action: "updateStartDateAndDueDate",
                    commonDateFormatString: dateFormat.value,
                    userData: updateObj.userData,
                    notificationObj: updateObj.obj,
                    firebaseObj: newFirebaseObj,
                    task: updateObj.task,
                    project: updateObj.project
                }
                // updateStartDate(event)
                apiRequest("patch", env.V2_TASKS, startAndDueDateObj)
                .then(() => {
                    $toast.success(t('Toast.Start_and_Due_date_updated_successfully'),{position: 'top-right'});
                })
                .catch((error) => {
                    $toast.error(t('Toast.Start_an_Due_date_not_updated'),{position: 'top-right'});
                    console.error(error);
                });
                return;
            }
            taskClass.updateDueDate(updateObj).then(() => {
                $toast.success(t('Toast.Due_date_updated_successfully'),{position: 'top-right'});
            }).catch((error) => {
                console.error("ERROR in updateDueDate: ", error);
                $toast.error(t('Toast.Due_date_not_updated'),{position: 'top-right'});
            })
        } catch (error) {
            console.error("ERROR in updateDueDate: ", error);
            $toast.error(t('Toast.Due_date_not_updated'),{position: 'top-right'});
        }
    }

    

    const getTaskData = (isTabRevisit = false) => {
        if (props.calendarDate) {
            calendarOptions.value.initialDate = formatDate(props.calendarDate)
            isDone.value = false;
        }
        try {
            const project = JSON.parse(JSON.stringify(projectData.value));
            const findQuery = [
                {
                    "$match": {
                        objId:{
                            ProjectID:project._id,
                            sprintId: props.sprint._id
                        },
                        deletedStatusKey: 0,
                        ...(isTabRevisit && { updatedAt: { $gte: new Date(sessionStorage.getItem('tableaveTime') - 60000) } })
                    }
                }
            ];
            apiRequest('post',`${env.TASK}/find`,{findQuery: findQuery}).then((data) => {
                if (data.status === 200 && data.data.length) {
                    let taskData = [...data.data];
                    // If  not due date and start date that time remove record
                    for (var i = taskData.length; i--;) {
                        if ((!taskData[i].DueDate || taskData[i].DueDate === 0) && (!taskData[i].startDate || taskData[i].startDate === 0)) {
                            taskData.splice(i, 1);
                        }
                    }

                    // If not due date that time consider due date is start date
                    taskData = taskData.map((x) => {
                        if (!x.DueDate || x.DueDate === 0) {
                            x.isStartDate = true;
                            x.DueDate = x.startDate;
                        }
                        if (!x.startDate || x.startDate === 0) {
                            x.isStartDate = false;
                            x.startDate = x.DueDate;
                        }
                        return x;
                    });

                    let finalArray = [];
                    
                    if (taskData && taskData.length) {
                        for (let i = 0; i < taskData.length; i += 1) {
                            taskData[i].statusKey = taskData[i]?.statusKey ? taskData[i].statusKey : 1;
                            const bgColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === taskData[i].statusKey).bgColor : 'red';
                            const textColor = project.taskStatusData && project.taskStatusData.length ? project.taskStatusData.find((x) => x.key === taskData[i].statusKey).textColor : 'white';
                            finalArray.push({
                                allDay: true,
                                id: taskData[i]._id,
                                title: taskData[i].TaskName,
                                start: formatDate(taskData[i].startDate),
                                end: formatDate(new Date(taskData[i].DueDate).getTime()+86400000),
                                backgroundColor: bgColor,
                                borderColor: bgColor,
                                textColor: 'black',
                                borderLeftColor: textColor,
                                isParent: taskData[i].isParentTask ? taskData[i].isParentTask : false,
                                dueDateDeadLine: taskData[i]?.dueDateDeadLine ? taskData[i].dueDateDeadLine : [],
                                projectId: taskData[i]?.ProjectID ? taskData[i].ProjectID : "",
                                sprintId: taskData[i]?.sprintId ? taskData[i].sprintId : "",
                                taskLeader: taskData[i]?.Task_Leader ? taskData[i].Task_Leader : "",
                                sprintArray: taskData[i]?.sprintArray ? taskData[i].sprintArray : {},
                                isStartDate: taskData[i].isStartDate
                            })
                        }
                    }
                    if (isTabRevisit) {
                        JSON.parse(JSON.stringify(finalArray)).forEach((ele)=>{
                            let index = calendarOptions.value.events.findIndex((x)=> x.id == ele.id);
                            if (index != -1) {
                               calendarOptions.value.events[index] = ele                                 
                            } else {
                                calendarOptions.value.events.push(ele);
                            }
                        })
                    } else {
                        calendarOptions.value.events = finalArray
                    }
                    isDone.value = true;
                } else {
                    isDone.value = true;
                }
            }).catch((error) => {
                isDone.value = true;
                console.error('error', error)
            });
        } catch (error) {
            isDone.value = true;
            console.error(error);
        }
    };

   const visibilityHandler = async () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            if (!document.hidden) {
                getTaskData(true);
            }
        }, 1000);
    };

    onMounted(() => {
        if (!searchedTask.value) {
            getTaskData();
        } else {
            if(getters['projectData/searchedTasks']?.length && props.sprint.id) {
                manageSearchData(getters['projectData/searchedTasks'].filter((x) => x.sprintId === props.sprint.id));
            } else {
                manageSearchData([]);
            }
        }

        // Add the event listener
        document.addEventListener('visibilitychange', visibilityHandler);
    });

    onBeforeUnmount(() => {
        clearTimeout(debounceTimeout);
        document.removeEventListener('visibilitychange', visibilityHandler);
    });
</script>

<style scoped lang='css'>
    .fc .fc-daygrid-day-top {
        flex-direction: row !important;
    }
</style>
<style src="../../../components/organisms/SprinstList/style.css"></style>