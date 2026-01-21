<template>
    <div>
        <div class="new-row list-group-item" id="singletaskdisply">
            <!-- LEFT SECTION -->
            <div class="new-col1" :style="{ border: (clientWidth > sideScrollWidth ? '0px' : '')}">
                <div class="common-section task ignore-drag" :style="`${task.isParentTask === false ? 'padding-left: 12px;' : ''}`">
                    <img :src="dragIcon" alt="dragIcon" v-if="!showArchiveVar" class="draggable_icon cursor-all-scroll">
                    <div class="parent__tasksubarray-wrapper position-ab">
                        <template v-if="(task.subTasks && task.isParentTask) || (searchedTask && task?.subtaskArray?.length)">
                            <img id="tasktoggle_driver" class="cursor-pointer parent__task-image" v-if="(task.subTasks && task.isParentTask) || (searchedTask && task?.subtaskArray?.length)" :src="triangleBlack" alt="triangle" :style="`transform: rotateZ(${data.isExpanded ? '90' : '0'}deg)`" @click="$emit('toggle',true)">
                        </template>
                        <template v-else>
                            <img class="parent__task-image" v-if="(task.isParentTask) || (searchedTask && task?.subtaskArray?.length)" :src="triangleBlack" alt="triangle" :style="`opacity: 0.1;`" @click="$emit('toggle',true)">
                        </template>
                    </div>

                    <img v-if="!data.isParentTask" :src="lastChild ? pointer : extendedPointer" alt="" class="align-self-baseline parent__task-lastchild parent__task-image">

                    <!-- INVENTORY -->
                    <img v-if="task.deletedStatusKey === 2" :src="inventoryIcon" alt="inventory" class="ml-5px" />
                    <img v-if="task.deletedStatusKey === 1" :src="deleteIcon" alt="delete" class="ml-5px">

                    <!-- TASK STATUS -->
                    <template v-if="clientWidth > 768">
                        <TaskStatus
                            :id="task._id+'status'"
                            :modelValue="taskStatus"
                            :options="projectStatus"
                            :disabled="showArchiveVar && checkPermission('task.task_list',projectData.isGlobalPermission)!==true || checkPermission('task.task_status',projectData.isGlobalPermission) !== true || showArchiveVar !== false"
                            @select="changeStatus($event)"
                        />
                    </template>

                    <!-- TASK TYPE -->
                    <template v-if="clientWidth > 768">
                        <ProjectTaskType
                            :id="task._id+'type'"
                            :modelValue="taskType"
                            :options="projectTaskType"
                            :disabled="showArchiveVar && checkPermission('task.task_list',projectData.isGlobalPermission)!==true || checkPermission('task.task_type',projectData.isGlobalPermission) !== true || showArchiveVar !== false"
                            @select="changeTaskType($event)"
                            :imgClasses="`ml-10px`"
                        />
                    </template>

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
                        <!-- Tagchips -->
                        <template v-if="checkApps('tags') && clientWidth > 768">
                            <div v-for="(item, index) in tagChipArray" :key="index" @click.stop="">
                                <div v-if="(index < chipCount)" class="tagList">
                                    <TagChip  :data="item" :isBorder="false"  :ids="ids" :tagsArray="projectData.tagsArray" :prjectGlobalPermission='projectData?.isGlobalPermission' :taskId="task._id" :sprintId="task.sprintId" :taskName="task.TaskName"/>
                                </div>
                                <div v-if="index == chipCount" class="tagcount" @click="openDropDwon()"> +{{tagChipArray.length - chipCount}} </div>
                            </div>
                            <div v-if="(task.tagsArray && task.tagsArray.length > chipCount ) && checkPermission('task.task_tag',projectData?.isGlobalPermission) !== null">
                                <CreateTagPopup ref="openDrop"  :task="data" @send:tagChipArray="(val)=>tagChipArray = val" @send:ids="(val)=>ids = val" :project="projectData" :chipCount="chipCount" :isTaskList="true" />
                            </div>
                        </template>
                        <template v-if="clientWidth > 768">
                            <div class="d-flex align-items-center task-options-image img__parent-task ml-5px p3x-5px" v-if="data?.isParentTask && ((showArchiveVar || searchedTask) ? data?.subtaskArray?.length : data?.subTasks)" :style="`min-width: ${myParentCounts ? '64px' : ''}`">
                                <img :src="subTaskImage" alt="subTaskImage" class="mr-2px">
                                {{(showArchiveVar || searchedTask) ? data?.subtaskArray?.length : data?.subTasks < 0 ? 0 : data?.subTasks}}
                                <div class="count-block ml-5px" v-if="myParentCounts">
                                    {{myParentCounts > 99 ? "+99" : myParentCounts}}
                                </div>
                            </div>
                        </template>
                        <!-- TASK OPTIONS -->
                        <div class="align-items-center justify-content-evenly task-options" :class="[{'d-flex':dropVisible, 'd-none' : !dropVisible }]" v-if="!showArchiveVar && !editTaskName && clientWidth > 768">
                            <template v-if="task.isParentTask">
                                <div v-if="checkPermission('task.sub_task_create',projectData.isGlobalPermission) === true" @click.stop="emit('createTask'), (data.isExpanded ? '' : emit('toggle'))">
                                    <img :src="addlistCheklistPlus" alt="addlistCheklistPlus" class="task-options-image">
                                </div>
                                <div>
                                    <img :src="addlistChecklist" alt="addlistChecklist" class="task-options-image">
                                </div>
                            </template>
                            <div v-if="checkPermission('task.task_name_edit',projectData.isGlobalPermission) === true" @click.stop="taskName = props.data.TaskName, editTaskName = true">
                                <img :src="editing" alt="editing" class="task-options-image">
                            </div>
                            <div v-if="(!task?.tagsArray || (task.tagsArray && task.tagsArray.length < 3 )) && checkPermission('task.task_tag',projectData?.isGlobalPermission) === true">
                                <CreateTagPopup ref="openDrop" :task="data" @send:dropvisible="(val) => dropVisible = val" @send:tagChipArray="(val)=>tagChipArray = val" @send:ids="(val)=>ids = val" :project="projectData" :chipCount="chipCount" :isTaskList="true" />
                            </div>
                            <!-- Tag List -->
                        </div>
                    </div>
                    <!-- <img :src="clockBlue" alt="clockBlue"> -->
                    <div id="modelListComponent" class="groupdFileOption sticky_options" v-if="!projectData?.deletedStatusKey && clientWidth <= 768">
                        <div class="d-flex align-items-center task-options-image img__parent-task ml-5px p3x-5px" v-if="data?.isParentTask && ((showArchiveVar || searchedTask) ? data?.subtaskArray?.length : data?.subTasks)" :style="`min-width: ${myParentCounts ? '64px' : ''}`">
                            <img :src="subTaskImage" alt="subTaskImage" class="mr-2px">
                            {{(showArchiveVar || searchedTask) ? data?.subtaskArray?.length : data?.subTasks < 0 ? 0 : data?.subTasks}}
                            <div class="count-block ml-5px" v-if="myParentCounts">
                                {{myParentCounts > 99 ? "+99" : myParentCounts}}
                            </div>
                        </div>
                        <DropDown :title="task.TaskName" v-if="showArchiveVar ? task.deletedStatusKey === 2 : task.deletedStatusKey === 0">
                            <template #button>
                                <img :ref="task._id+'options'" :src="horizontalDots" alt="horizontalDots" id="taskquickmenudriver">
                            </template>
    
                            <template #options>
                                <div id="taskquickmenu_driver">
                                    <DropDownOption @click="$refs[task._id+`options`].click(),copyTaskLink()" v-if="!showArchiveVar">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="linkIcon" alt="inventoryIcon">
                                            <span>{{$t('ProjectDetails.copy_task_link')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),copyTaskKey()" v-if="!showArchiveVar">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="splitScreen" alt="inventoryIcon">
                                            <span>{{$t('ProjectDetails.copy_task_key')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="(task.queueListArray == undefined || (task.queueListArray && task.queueListArray.indexOf(userId) == -1)) && (task.AssigneeUserId && task.AssigneeUserId.indexOf(userId) !== -1) && !showArchiveVar && checkPermission('task.queue_list',projectData.isGlobalPermission) == true" @click="$refs[task._id+`options`].click(),addToQueue('add')">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="cancelIcon" alt="addIcon">
                                            <span>{{$t('ProjectDetails.add_que_list')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="(task.queueListArray && task.queueListArray.indexOf(userId) !== -1) && (task.AssigneeUserId && task.AssigneeUserId.indexOf(userId) !== -1) && !showArchiveVar && checkPermission('task.queue_list',projectData.isGlobalPermission) == true" @click="$refs[task._id+`options`].click(),addToQueue('remove')">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="cancelIcon" alt="addIcon">
                                            <span>{{$t('ProjectDetails.remove_from_queue_list')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="(task.deletedStatusKey === undefined || task.deletedStatusKey === 0) && !showArchiveVar && checkPermission('task.task_archive',projectData.isGlobalPermission) == true" @click="$refs[task._id+`options`].click(), showSidebar = true, archive = true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="inventoryIcon" alt="inventoryIcon">
                                            <span>{{$t('Projects.archive')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="task.deletedStatusKey === 2" @click="$refs[task._id+`options`].click(), updateTask(0)">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="inventoryIcon" alt="restoreInventoryIcon">
                                            <span>{{$t('Projects.restore')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(), showSidebar = true, archive = false" v-if="checkPermission('task.task_delete',projectData.isGlobalPermission) == true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="deleteIcon" alt="deleteIcon">
                                            <span>{{$t('Projects.delete')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),convertToSubTask()" v-if="checkPermission('task.sub_task_create',projectData.isGlobalPermission) === true && !showArchiveVar && task.isParentTask && checkPermission('task.task_convert_to_subtask',projectData.isGlobalPermission) === true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="subTaskIcon" alt="deleteIcon">
                                            <span>{{$t('ProjectDetails.convert_subtask')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),convertToList()" v-if="checkPermission('project.project_sprint_create',projectData.isGlobalPermission) === true && !showArchiveVar && checkPermission('task.task_convert_to_list',projectData.isGlobalPermission) === true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="combinedIcon" />
                                            <span>{{$t('ProjectDetails.convert_list')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),duplicateTask()" v-if="!showArchiveVar && checkPermission('task.task_duplicate',projectData.isGlobalPermission) === true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="copyIcon" class="copyIcon"/>
                                            <span>{{$t('Projects.duplicate')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),moveTask()" v-if="!showArchiveVar && checkPermission('task.task_move',projectData.isGlobalPermission) == true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="moveIcon" />
                                            <span>{{$t('ProjectDetails.move')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),mergeTask()" v-if="!showArchiveVar && checkPermission('task.task_merge',projectData.isGlobalPermission) == true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="mergeIcon" />
                                            <span>{{$t('ProjectDetails.merge')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),convertToTask()" v-if="task.isParentTask === false && checkPermission('task.task_create',projectData.isGlobalPermission) === true && checkPermission('task.convert_to_task',projectData.isGlobalPermission) === true && !showArchiveVar">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="mergeIcon" />
                                            <span>{{$t('ProjectDetails.convert_task')}}</span>
                                        </div>
                                    </DropDownOption>
                                </div>
                            </template>
                        </DropDown>
                    </div>
                </div>
            </div>

            <!-- RIGHT SECTION -->
            <div class="new-col2 ignore-drag" v-if="clientWidth > 768">
                <div class="common-section task">
                    <!-- CHAT COUNTS -->
                    <span v-if="projectData.viewColumn?.find((x)=> x.key === 'commentCounts')?.show" class="chat-main-new position-re task_right" @click.stop="!showArchiveVar ? changeRoute() : ''">
                        <img :src="chatIcon" alt="chatIcon" :class="{'cursor-pointer': !showArchiveVar}">
                        <div class="position-ab count-block show__count" v-if="myCounts">
                            {{myCounts > 99 ? "+99" : myCounts}}
                        </div>
                    </span>

                    <!-- ASSIGNEE -->
                    <span class="assignee-main-new task_right" v-if="checkPermission('task.task_assignee',projectData.isGlobalPermission) !== null && projectData.viewColumn?.find((x)=> x.key === 'AssigneeUserId')?.show">
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
                    <span class="duedate-new task_right" v-if="checkPermission('task.task_due_date',projectData.isGlobalPermission) !== null && projectData.viewColumn?.find((x)=> x.key === 'DueDate')?.show">
                        <DueDateCompo
                            id="due-date-task"
                            :overdue="true"
                            :displyDate="dueDate? dueDate : ''"
                            :disabledDates="task.dueDateDeadLine"
                            @SelectedDate="($event) => updateDueDate($event)"
                            :position="`right`"
                            v-if="!showArchiveVar && checkPermission('task.task_due_date',projectData.isGlobalPermission) === true && checkPermission('task.task_list',projectData.isGlobalPermission) == true && showArchiveVar === false"
                        />
                        <template v-else>
                            <span v-if="task.DueDate">{{convertDateFormat(task.DueDate,'',{showDayName:false})}}</span>
                            <span v-else>{{$t('ProjectDetails.no_due_date')}}</span>
                        </template>
                    </span>

                    <!-- TASK PRIORITY -->
                    <span class="priority-new task_right" v-if="checkPermission('task.task_priority',projectData.isGlobalPermission) !== null && checkApps('Priority') && projectData.viewColumn?.find((x)=> x.key === 'Task_Priority')?.show">
                        <Priority
                            :priorityVal="task.Task_Priority"
                            @select="updatePriority"
                            :permission="!showArchiveVar && checkPermission('task.task_priority',projectData.isGlobalPermission) === true"
                        />
                    </span>

                    <!-- TASK KEY -->
                    <span class="key-new task_right" v-if="projectData.viewColumn?.find((x)=> x.key === 'TaskKey')?.show">
                        {{task.TaskKey}}
                    </span>
                    
                    <!-- Created Date -->
                    <span class="key-new task_right" v-if="projectData.viewColumn?.find((x)=> x.key === 'created_date')?.show">
                        {{convertDateFormat(task.createdAt,'',{showDayName: false})}}
                    </span>

                    <!-- Created By -->
                    <span class="pointer-event-none task_right" v-if="projectData?.viewColumn?.find((x)=> x.key === 'created_by')?.show">
                        <Assignee
                            :users="[task?.Task_Leader]"
                            :num-of-users="1"
                            imageWidth="30px"
                            :addUser="false"
                        />
                    </span>
                    <template v-if="projectData?.viewColumn && projectData?.viewColumn.length && isCustomFields()">
                        <CustomFieldListViewColumnComponent 
                            :projectData="projectData"
                            :task="task"
                        />
                    </template>
                    <!-- OPTIONS -->
                    <div id="modelListComponent" class="groupdFileOption sticky_options" v-if="!projectData?.deletedStatusKey">
                        <DropDown :title="task.TaskName" v-if="showArchiveVar ? task.deletedStatusKey === 2 : task.deletedStatusKey === 0">
                            <template #button>
                                <img :ref="task._id+'options'" :src="horizontalDots" alt="horizontalDots" id="taskquickmenudriver">
                            </template>

                            <template #options>
                                <div id="taskquickmenu_driver">
                                    <DropDownOption @click="$refs[task._id+`options`].click(),copyTaskLink()" v-if="!showArchiveVar">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="linkIcon" alt="inventoryIcon">
                                            <span>{{$t('ProjectDetails.copy_task_link')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),copyTaskKey()" v-if="!showArchiveVar">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="splitScreen" alt="inventoryIcon">
                                            <span>{{$t('ProjectDetails.copy_task_key')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="(task.queueListArray == undefined || (task.queueListArray && task.queueListArray.indexOf(userId) == -1)) && (task.AssigneeUserId && task.AssigneeUserId.indexOf(userId) !== -1) && !showArchiveVar && checkPermission('task.queue_list',projectData.isGlobalPermission) == true" @click="$refs[task._id+`options`].click(),addToQueue('add')">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="cancelIcon" alt="addIcon">
                                            <span>{{$t('ProjectDetails.add_que_list')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="(task.queueListArray && task.queueListArray.indexOf(userId) !== -1) && (task.AssigneeUserId && task.AssigneeUserId.indexOf(userId) !== -1) && !showArchiveVar && checkPermission('task.queue_list',projectData.isGlobalPermission) == true" @click="$refs[task._id+`options`].click(),addToQueue('remove')">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="cancelIcon" alt="addIcon">
                                            <span>{{$t('ProjectDetails.remove_from_queue_list')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="(task.deletedStatusKey === undefined || task.deletedStatusKey === 0) && !showArchiveVar && checkPermission('task.task_archive',projectData.isGlobalPermission) == true" @click="$refs[task._id+`options`].click(), showSidebar = true, archive = true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="inventoryIcon" alt="inventoryIcon">
                                            <span>{{$t('Projects.archive')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption v-if="task.deletedStatusKey === 2" @click="$refs[task._id+`options`].click(), updateTask(0)">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="inventoryIcon" alt="restoreInventoryIcon">
                                            <span>{{$t('Projects.restore')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(), showSidebar = true, archive = false" v-if="checkPermission('task.task_delete',projectData.isGlobalPermission) == true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="deleteIcon" alt="deleteIcon">
                                            <span>{{$t('Projects.delete')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),convertToSubTask()" v-if="checkPermission('task.sub_task_create',projectData.isGlobalPermission) === true && !showArchiveVar && task.isParentTask && checkPermission('task.task_convert_to_subtask',projectData.isGlobalPermission) === true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="subTaskIcon" alt="deleteIcon">
                                            <span>{{$t('ProjectDetails.convert_subtask')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),convertToList()" v-if="checkPermission('project.project_sprint_create',projectData.isGlobalPermission) === true && !showArchiveVar && checkPermission('task.task_convert_to_list',projectData.isGlobalPermission) === true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="combinedIcon" />
                                            <span>{{$t('ProjectDetails.convert_list')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),duplicateTask()" v-if="!showArchiveVar && checkPermission('task.task_duplicate',projectData.isGlobalPermission) === true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="copyIcon" class="copyIcon"/>
                                            <span>{{$t('Projects.duplicate')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),moveTask()" v-if="!showArchiveVar && checkPermission('task.task_move',projectData.isGlobalPermission) == true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="moveIcon" />
                                            <span>{{$t('ProjectDetails.move')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),mergeTask()" v-if="!showArchiveVar && checkPermission('task.task_merge',projectData.isGlobalPermission) == true">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="mergeIcon" />
                                            <span>{{$t('ProjectDetails.merge')}}</span>
                                        </div>
                                    </DropDownOption>
                                    <DropDownOption @click="$refs[task._id+`options`].click(),convertToTask()" v-if="task.isParentTask === false && checkPermission('task.task_create',projectData.isGlobalPermission) === true && checkPermission('task.convert_to_task',projectData.isGlobalPermission) === true && !showArchiveVar">
                                        <div class="d-flex align-items-center task_desc_icon">
                                            <img :src="mergeIcon" />
                                            <span>{{$t('ProjectDetails.convert_task')}}</span>
                                        </div>
                                    </DropDownOption>
                                </div>
                            </template>
                        </DropDown>
                    </div>
                </div>
            </div>
        </div>
        <ConfirmationSidebar
            v-model="showSidebar"
            :title="`${archive ? $t('Projects.archive') : $t('Projects.delete')}`"
            :message="archive ? $t('conformationmsg.archive') : $t('conformationmsg.delete')"
            :confirmationString="`${archive ? 'archive' : 'delete'}`"
            :acceptButtonClass="archive ? 'btn-primary': 'btn-danger'"
            :acceptButton="`${archive ? $t('Projects.archive') : $t('Projects.delete')}`"
            @confirm="updateTask(), showSidebar = false"
        />
        <ConvertToSubTaskSidebar v-if="openConvertSubTaskSidebar === true" :closeSideBar="openConvertSubTaskSidebar"  
            @isConvertSubtaskOPen="(val) => {sidebarOPen(val)}" :isMoveTask="openMoveSidebar" :openMoveSubTask="openMoveSubTask" 
            :isMergeTask="openMergeTask" :isDuplicate="duplicateTaskSidebar" :task="task" :isConvertTask="openConvertToTask" :isOpenSubTask="openSubTaskSideabr" :item="item"/>
        <ConvertToList v-if="converrtToListSidebar === true" :openSidebar="converrtToListSidebar" @closeSidebar="(val) => {converrtToListSidebar = val}" :task="task" />
    </div>
</template>

<script setup>
// PACKAGES
import { ref, watch, defineProps, inject, defineEmits, defineComponent, computed, onMounted } from "vue"

// COMPONENTS
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import Assignee from "@/components/molecules/Assignee/Assignee.vue"
import InputText from "@/components/atom/InputText/InputText.vue"
import Priority from "@/components/molecules/PriorityCompo/PriorityComp.vue"
import TaskStatus from "@/components/atom/TaskStatus/TaskStatus.vue"
import ProjectTaskType from "@/components/atom/TaskTypeSelection/TaskTypeSelection.vue"
import DueDateCompo from '@/components/molecules/DueDateCompo/DueDateCompo.vue';
import ConfirmationSidebar from "@/components/molecules/ConfirmationSidebar/ConfirmationSidebar.vue"
import CreateTagPopup from "@/components/molecules/TagList/CreateTagPopup.vue";
import TagChip from '@/components/atom/TagChip/TagChip.vue';
import ConvertToSubTaskSidebar from '@/components/molecules/ConvertToSubTaskSidebar/ConvertToSubTaskSidebar.vue';
import ConvertToList from '@/components/molecules/ConvertToList/ConvertToList.vue';
// UTILS
import taskClass from "@/utils/TaskOperations";
import { useConvertDate, useCustomComposable, useGetterFunctions } from "@/composable";
import { useStore } from "vuex";
import { useToast } from "vue-toast-notification"
import { useRouter, useRoute } from "vue-router"
import { useUpdateTasks } from "@/views/Projects/helper"
import {customField} from '../../../plugins/customFieldView/helper.js';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const {isCustomFields} = customField();
const dropVisible = ref(false)
const clientWidth = inject('$clientWidth');
const projectRef = inject("selectedProject");
const userId = inject('$userId');
const {getUser} = useGetterFunctions();
const {getters,commit} = useStore();
const companyId = inject("$companyId");
const searchedTask = inject('searchedTask');
const {convertDateFormat} = useConvertDate();
const {checkPermission, checkApps} = useCustomComposable();
const showArchiveVar = inject("showArchived");
const $toast = useToast()
const router = useRouter()
const tagChipArray = ref()
const ids = ref()
const openConvertSubTaskSidebar = ref(false);
const converrtToListSidebar = ref(false);
const openMoveSubTask = ref(false);
const openMoveSidebar = ref(false);
const openMergeTask = ref(false);
const duplicateTaskSidebar = ref(false);
const route = useRoute();
const chipCount = ref(2)
const openSubTaskSideabr = ref(false);
const {updateTaskByGroup} = useUpdateTasks();

// IMAGES
const dragIcon = require("@/assets/images/svg/move_table_icon.svg");
const triangleBlack = require("@/assets/images/svg/triangleBlack.svg");
const horizontalDots = require("@/assets/images/svg/horizontalDots.svg");
const inventoryIcon = require("@/assets/images/inventory_2.png");
const deleteIcon = require("@/assets/images/DeleteIcon.png");
const addlistCheklistPlus = require("@/assets/images/svg/addlistCheklistPlus.svg");
const addlistChecklist = require("@/assets/images/svg/addlistChecklist.svg");
const editing = require("@/assets/images/editing.png");
const subTaskImage = require("@/assets/images/png/subTaskIcon.png");
const pointer = require("@/assets/images/svg/pointer.svg");
const extendedPointer = require("@/assets/images/svg/pointer_extended.svg");
const chatIcon = require("@/assets/images/svg/ChatIcon.svg");
const linkIcon = require("@/assets/images/png/link.png");
const splitScreen = require("@/assets/images/png/splitscreen.png");
const subTaskIcon = require("@/assets/images/png/subTaskIcon.png");
const moveIcon = require("@/assets/images/png/moveIcon.png");
const mergeIcon = require("@/assets/images/png/mergeIcon.png");
const combinedIcon = require("@/assets/images/png/Combined_shape.png");
const copyIcon = require("@/assets/images/copy.png");
const cancelIcon = require("@/assets/images/svg/arrow_circle_up.svg");
// const clockBlue = require("@/assets/images/svg/clock_timer_svg.svg");

// EMITS
const emit = defineEmits(["toggle", "createTask"]);

// COMPONENT
defineComponent({
    name: "Task-Component",

    components: {
        DropDown,
        DropDownOption,
        Assignee,
        // InputText,
        Priority,
        TaskStatus,
        DueDateCompo,
        ConfirmationSidebar,
        ProjectTaskType
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
    },
    item: {
        type: Object,
        default: () => {}
    },
    projectObject: {
        type: Object,
        default: () => {}
    }
})

const showSidebar = ref(false);
const archive = ref(false);
const openDrop = ref()

const openDropDwon = () => {
    if(checkPermission('task.task_tag',projectData.value?.isGlobalPermission) == true) {
        openDrop.value.sendMethod()
    }
}

const customFieldList = computed(() => (getters['settings/finalCustomFields'] && getters['settings/finalCustomFields'].length) ? JSON.parse(JSON.stringify(getters['settings/finalCustomFields'])) : []);

const companyUsers = computed(() => getters["settings/companyUsers"]?.map((x) => x.userId))

const projectData = computed(() => {
    if(props.projectObject) {
        return props.projectObject;
    } else {
        return projectRef.value;
    }
})

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
const projectTaskType = computed(() => {
    return projectData.value.taskTypeCounts;
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
        manageCustomField(customFieldList.value);
    }
});

watch(() => projectData.value?.viewColumn?.length, (newVal, oldVal) => {
    if(JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        manageCustomField(customFieldList.value);
    }
});
watch(() => getters['settings/finalCustomFields'], (newVal) => {
    manageCustomField(newVal);
},{deep:true});

//onMounted

const taskCollapsed = inject("taskCollapsed");
onMounted(() => {
    if(taskCollapsed.value !== undefined && !taskCollapsed.value) {
        emit("toggle");
    }
    manageCustomField(customFieldList.value);
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

function changeRoute() {
    const paramsObj = {
        cid: companyId.value,
        id: projectData.value._id,
        sprintId: task.value.sprintId,
        taskId: task.value._id
    }

    if(task.value.folderObjId) {
        paramsObj.folderId = task.value.folderObjId;
    }
    router.push({
        name: task.value.folderObjId? 'ProjectFolderSprintTask' : 'ProjectSprintTask',
        params: paramsObj,
        query: {...route.query, detailTab: "comment"}
    })
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
        let sprint = {};
        if(task.value.folderObjId){
            sprint = projectData.value.sprintsfolders[task.value.folderObjId].sprintsObj[task.value.sprintId];
        }
        else{
            sprint = projectData.value.sprintsObj[task.value.sprintId];
        }
        sprint.tasks = sprint.tasks - (task.value.isParentTask ? ((task.value.subTasks || 0) + 1) : 1)
        commit("projectData/mutateSprints",{op:'modified',data:{...sprint}});
        if(res.status) {
            $toast.success(t(`Toast.Task_${value !== null ? 'restored' : archive.value ? 'archived' : 'deleted'}_successfully`), { position: "top-right" })
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
function changeTaskType(status) {
    const statusIndex = projectData.value.taskTypeCounts.findIndex((x) => x.key === props.data.TaskTypeKey);
    if(statusIndex === -1) return;
    updateTaskByGroup(props.data, status, 4);
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
        if(operation === "assigneRemove"){
           let index = task.value.AssigneeUserId.findIndex((x) => x === value.id);
            task.value.AssigneeUserId.splice(index,1);
            commit("projectData/mutateSearchTask", {op:"modified", data: [task.value]});
        }
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

// COPY TASK LINK
const copyTaskLink = () => {
 let path;
        let navigation = window.location.href;
        let modifiedUrl;
        let newnavigation = navigation.replace(/\?tab.*$/, '');

        if (route.name === "Project") {
        if (task.value.folderObjId) {
            modifiedUrl = newnavigation.slice(0, -2);
            path = `${modifiedUrl}/fs/${task.value.folderObjId}/${task.value.sprintId}/${task.value._id}`;
        } else {
            modifiedUrl = newnavigation.slice(0, -2);
            path = `${modifiedUrl}/s/${task.value.sprintId}/${task.value._id}`;
        }
        }
        if (route.name === "ProjectSprint" || route.name === "ProjectFolderSprint") {
            path = `${newnavigation}/${task.value._id}`;
        }
        if (route.name === "ProjectFolder") {
            modifiedUrl = newnavigation.replace(/\/f(.*)/, '');
            path = `${modifiedUrl}/fs/${task.value.folderObjId}/${task.value.sprintId}/${task.value._id}`;
        }
        
        const tabParamIndex = navigation.indexOf('?tab');
        if (tabParamIndex !== -1) {
            const tabParam = navigation.slice(tabParamIndex);
            path += tabParam;
        }

        navigator.clipboard.writeText(path);
        $toast.success(t("Toast.Link_is_Copied_to_clipboard"), { position: 'top-right' });
}
// COPY TASK KEY
const copyTaskKey = () => {
    navigator.clipboard.writeText(task.value.TaskKey);
    $toast.success(t("Toast.Task_Key_is_Copied_to_clipboard"),{position: 'top-right'});
}
const convertToSubTask = () => {
    openConvertSubTaskSidebar.value = true;
    openSubTaskSideabr.value = true;
}
const sidebarOPen = (val) => {
    openConvertSubTaskSidebar.value = val;
    openMoveSubTask.value = false;
    openMoveSidebar.value = false;
    duplicateTaskSidebar.value = false;
    openConvertToTask.value = false;
    openMergeTask.value = false;
    converrtToListSidebar.value = false;
    openSubTaskSideabr.value = false;
}
const convertToList = () => {
    converrtToListSidebar.value = true;
}
const moveTask = () => {
    if(props.data.isParentTask === true){
        openMoveSidebar.value = true;
    }else if(props.data.isParentTask === false){
        openMoveSubTask.value = true;
    }
    openConvertSubTaskSidebar.value = true;
}
const mergeTask= () => {
    openConvertSubTaskSidebar.value = true;
    openMergeTask.value = true;
}
const duplicateTask = () => {
    openConvertSubTaskSidebar.value = true;
    duplicateTaskSidebar.value = true;
}

const convertToTask = () => {
    openConvertToTask.value = true;
    openConvertSubTaskSidebar.value = true;
}
const addToQueue = (action) => {
    try {
        taskClass.updateQueueList({CompanyId:projectData.value.CompanyId, projectId:projectData.value._id, sprintId:props.data.sprintId, taskId:props.data._id,userId:userId.value,actionType:action, queueListArray: props.data.queueListArray})
            .then(() => {
                $toast.success(t(`Toast.Queue list ${action == 'add' ? 'added' : 'removed'} successfully`),{position: 'top-right'});
            })
            .catch((error) => {
                console.error("ERROR in update addToQueue: ", error);
                $toast.error(t('Toast.Queue_list_not_updated'),{position: 'top-right'});
            })
    } catch (error) {
        console.error("ERROR in update addToQueue: ", error);
    }
};


const manageCustomField = (data) => {
    if (!(data && data.length)) {
        return;
    }
    if(projectData.value?.viewColumn && projectData.value?.viewColumn.length){
        let count = 0;
        let countFunction = (element) => {
            if(count >= projectData.value?.viewColumn.length){
                return;
            }else{
                let checkCustom = customFieldList.value.find((x)=> (x._id === element.key) && (x?.isDelete) && (x?.type === 'task') && (x?.global || x?.projectId.includes(task?.value?.ProjectID)));
                if (checkCustom && Object.keys(checkCustom).length) {
                    if(task.value.customField?.[element.key]){
                        if(checkCustom.fieldType === 'phone'){
                            task.value.customField[element.key] = {
                                ...checkCustom,
                                taskId:task.value._id,
                                fieldValue:task.value.customField[element.key].fieldValue,
                                fieldCode:task.value.customField[element.key].fieldCode,
                                fieldFlag:task.value.customField[element.key].fieldFlag,
                                fieldPattern:task.value.customField[element.key].fieldPattern
                            }
                        }else{
                            task.value.customField[element.key] = {
                                ...checkCustom,
                                taskId:task.value._id,
                                fieldValue:task.value.customField[element.key].fieldValue
                            }
                        }
                        count ++;
                        countFunction(projectData.value.viewColumn[count]);
                    }else{
                        delete checkCustom?.fieldPattern;
                        delete checkCustom?.fieldValue;
                        delete checkCustom?.fieldCode;
                        delete checkCustom?.fieldFlag;
                        checkCustom.taskId = task.value._id;
                        let newObject = {
                            [element.key]:checkCustom
                        };
                        task.value.customField = {
                            ...task.value.customField,
                            ...newObject
                        }
                        count ++;
                        countFunction(projectData.value.viewColumn[count]);
                    }
                }else{
                    count ++;
                    countFunction(projectData.value.viewColumn[count]);
                }
            }
        }
        countFunction(projectData.value.viewColumn[count])
    }
};
</script>

<style src="./style.css">
    
</style>