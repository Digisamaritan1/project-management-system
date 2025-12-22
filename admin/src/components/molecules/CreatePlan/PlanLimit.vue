<template>
    <div class="createplan_wrapper">
        <div class="font-size-22">
            Plan Limit
        </div>
        <span v-if="isEdit" class="font-weight-700">Note: Plan limits can affect both new and existing subscriptions. For new subscriptions, the limit applies immediately. For existing subscriptions, the limit will apply when their next payment renews.</span>
        <div class="container">
            <div class="item">
                <label for="Users" class="createPlan_label">
                    Users<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.users.value"
                    placeHolder="Number of Users" type="text" id="Users" tabindex="1"
                    @paste="onlyNumberPaste($event.event)"
                    @keyup="checkErrors({
                            'field': formData.users,
                            'name': formData.users.name,
                            'validations': formData.users.rules,
                            'type': formData.users.type,
                            'event': $event.event
                        })" inputId="refusers"
                        @keypress="onlyNumber($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.users.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Team" class="createPlan_label">
                    Team
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-team" v-model="formData.team"
                            id="teamYes" :value="true">
                        <label for="teamYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-team" v-model="formData.team"
                            id="teamNo" :value="false">
                        <label for="teamNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Project" class="createPlan_label">
                    Project<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.project.value"
                    placeHolder="Number of Project" type="text" id="Project" tabindex="1" @keyup="checkErrors({
                            'field': formData.project,
                            'name': formData.project.name,
                            'validations': formData.project.rules,
                            'type': formData.project.type,
                            'event': $event.event
                        })" inputId="refproject"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.project.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Max Private Project" class="createPlan_label">
                    Max Private Project<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.maxPrivateProject.value"
                    placeHolder="Number of Max Private Project" type="text" id="Max Private Project" tabindex="1" @keyup="checkErrors({
                            'field': formData.maxPrivateProject,
                            'name': formData.maxPrivateProject.name,
                            'validations': formData.maxPrivateProject.rules,
                            'type': formData.maxPrivateProject.type,
                            'event': $event.event
                        })" inputId="refmaxPrivateProject"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.maxPrivateProject.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Max Public Project" class="createPlan_label">
                    Max Public Project<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.maxPublicProject.value"
                    placeHolder="Number of Max Public Project" type="text" id="Max Public Project" tabindex="1" @keyup="checkErrors({
                            'field': formData.maxPublicProject,
                            'name': formData.maxPublicProject.name,
                            'validations': formData.maxPublicProject.rules,
                            'type': formData.maxPublicProject.type,
                            'event': $event.event
                        })" inputId="refmaxPublicProject"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.maxPublicProject.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Sprint Per Project" class="createPlan_label">
                    Sprint Per Project<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.sprintPerProject.value"
                    placeHolder="Number of Sprint Per Project" type="text" id="Sprint" tabindex="1" @keyup="checkErrors({
                            'field': formData.sprintPerProject,
                            'name': formData.sprintPerProject.name,
                            'validations': formData.sprintPerProject.rules,
                            'type': formData.sprintPerProject.type,
                            'event': $event.event
                        })" inputId="refsprintPerProject"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.sprintPerProject.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Max Task Per Sprint" class="createPlan_label">
                    Max Task Per Sprint<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.maxTaskPerSprint.value"
                    placeHolder="Number of Max Task Per Sprint" type="text" id="Sprint" tabindex="1" @keyup="checkErrors({
                            'field': formData.maxTaskPerSprint,
                            'name': formData.maxTaskPerSprint.name,
                            'validations': formData.maxTaskPerSprint.rules,
                            'type': formData.maxTaskPerSprint.type,
                            'event': $event.event
                        })" inputId="refmaxTaskPerSprint"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.maxTaskPerSprint.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Checklist" class="createPlan_label">
                    Checklist
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-taskCheckList" v-model="formData.checkList"
                            id="taskCheckListYes" :value="true">
                        <label for="taskCheckListYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-taskCheckList" v-model="formData.checkList"
                            id="taskCheckListNo" :value="false">
                        <label for="taskCheckListNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="List View" class="createPlan_label">
                    List View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-listView" v-model="formData.listView"
                            id="listViewYes" :value="true">
                        <label for="listViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-listView" v-model="formData.listView"
                            id="listViewNo" :value="false">
                        <label for="listViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Board View" class="createPlan_label">
                    Board View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-boardView" v-model="formData.boardView"
                            id="boardViewYes" :value="true">
                        <label for="boardViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-boardView" v-model="formData.boardView"
                            id="boardViewNo" :value="false">
                        <label for="boardViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Calender View" class="createPlan_label">
                    Calender View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-calenderView" v-model="formData.calenderView"
                            id="calenderViewYes" :value="true">
                        <label for="calenderViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-calenderView" v-model="formData.calenderView"
                            id="calenderViewNo" :value="false">
                        <label for="calenderViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Table View" class="createPlan_label">
                    Table View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-tableView" v-model="formData.tableView"
                            id="tableViewYes" :value="true">
                        <label for="tableViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-tableView" v-model="formData.tableView"
                            id="tableViewNo" :value="false">
                        <label for="tableViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Embade View" class="createPlan_label">
                    Embade View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-embadeVIew" v-model="formData.embadeVIew"
                            id="embadeVIewYes" :value="true">
                        <label for="embadeVIewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-embadeVIew" v-model="formData.embadeVIew"
                            id="embadeVIewNo" :value="false">
                        <label for="embadeVIewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Workload View" class="createPlan_label">
                    Workload View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-workloadView" v-model="formData.workloadView"
                            id="workloadViewYes" :value="true">
                        <label for="workloadViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-workloadView" v-model="formData.workloadView"
                            id="workloadViewNo" :value="false">
                        <label for="workloadViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Project Details View" class="createPlan_label">
                    Project Details View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-projectDetailsView" v-model="formData.projectDetailsView"
                            id="projectDetailsViewYes" :value="true">
                        <label for="projectDetailsViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-projectDetailsView" v-model="formData.projectDetailsView"
                            id="projectDetailsViewNo" :value="false">
                        <label for="projectDetailsViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Activity View" class="createPlan_label">
                    Activity View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-actitvityView" v-model="formData.actitvityView"
                            id="actitvityViewYes" :value="true">
                        <label for="actitvityViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-actitvityView" v-model="formData.actitvityView"
                            id="actitvityViewNo" :value="false">
                        <label for="actitvityViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Comments View" class="createPlan_label">
                    Comments View
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-commentsView" v-model="formData.commentsView"
                            id="commentsViewYes" :value="true">
                        <label for="commentsViewYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-commentsView" v-model="formData.commentsView"
                            id="commentsViewNo" :value="false">
                        <label for="commentsViewNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Advance Filter" class="createPlan_label">
                    Advance Filter
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-advanceFilterCtrlK" v-model="formData.advanceFilterCtrlK"
                            id="advanceFilterCtrlKYes" :value="true">
                        <label for="advanceFilterCtrlKYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-advanceFilterCtrlK" v-model="formData.advanceFilterCtrlK"
                            id="advanceFilterCtrlKNo" :value="false">
                        <label for="advanceFilterCtrlKNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Time Tracker User" class="createPlan_label">
                    Time Tracker User<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.timeTrackerUser.value"
                    placeHolder="Number of Time Tracker User" type="text" id="Time Tracker User" tabindex="1" @keyup="checkErrors({
                            'field': formData.timeTrackerUser,
                            'name': formData.timeTrackerUser.name,
                            'validations': formData.timeTrackerUser.rules,
                            'type': formData.timeTrackerUser.type,
                            'event': $event.event
                        })" inputId="reftimeTrackerUser"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.timeTrackerUser.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Total Company Bucket Size" class="createPlan_label">
                    Total Company Bucket Size (In MB)<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.bucketStorage.value"
                    placeHolder="Number of Total Company Bucket Size" type="text" id="Total Company Bucket Size" tabindex="1" @keyup="checkErrors({
                            'field': formData.bucketStorage,
                            'name': formData.bucketStorage.name,
                            'validations': formData.bucketStorage.rules,
                            'type': formData.bucketStorage.type,
                            'event': $event.event
                        })" inputId="refbucketStorage"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.bucketStorage.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Max File Upload Size" class="createPlan_label">
                    Max File Upload Size (In MB)<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.maxFileSize.value"
                    placeHolder="Number of Max File Upload Size" type="text" id="Max File Upload Size" tabindex="1" @keyup="checkErrors({
                            'field': formData.maxFileSize,
                            'name': formData.maxFileSize.name,
                            'validations': formData.maxFileSize.rules,
                            'type': formData.maxFileSize.type,
                            'event': $event.event
                        })" inputId="refmaxFileSize"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.maxFileSize.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Guest User" class="createPlan_label">
                    Guest User<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.guestUser.value"
                    placeHolder="Number of Guest User" type="text" id="Guest User" tabindex="1" @keyup="checkErrors({
                            'field': formData.guestUser,
                            'name': formData.guestUser.name,
                            'validations': formData.guestUser.rules,
                            'type': formData.guestUser.type,
                            'event': $event.event
                        })" inputId="refguestUser"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.guestUser.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Chat" class="createPlan_label">
                    Chat
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-chat" v-model="formData.chat"
                            id="chatYes" :value="true">
                        <label for="chatYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-chat" v-model="formData.chat"
                            id="chatNo" :value="false">
                        <label for="chatNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="One to One Chat" class="createPlan_label">
                    One to One Chat
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-oneToOneChat" v-model="formData.oneToOneChat"
                            id="oneToOneChatYes" :value="true">
                        <label for="oneToOneChatYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-oneToOneChat" v-model="formData.oneToOneChat"
                            id="oneToOneChatNo" :value="false">
                        <label for="oneToOneChatNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Channels" class="createPlan_label">
                    Channels
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-chanels" v-model="formData.chanels"
                            id="chanelsYes" :value="true">
                        <label for="chanelsYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-chanels" v-model="formData.chanels"
                            id="chanelsNo" :value="false">
                        <label for="chanelsNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item" :class="[{'pointer-event-none opacity-5' : formData.chanels === false}]">
                <label for="Max Public Channels" class="createPlan_label">
                    Max Public Channels<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.maxPublicChannels.value"
                    placeHolder="Number of Max Public Channels" type="text" id="Max Public Channels" tabindex="1" @keyup="checkErrors({
                            'field': formData.maxPublicChannels,
                            'name': formData.maxPublicChannels.name,
                            'validations': formData.maxPublicChannels.rules,
                            'type': formData.maxPublicChannels.type,
                            'event': $event.event
                        })" inputId="refmaxPublicChannels"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.maxPublicChannels.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item" :class="[{'pointer-event-none opacity-5' : formData.chanels === false}]">
                <label for="Max Private Channels" class="createPlan_label">
                    Max Private Channels<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.maxPrivateChannels.value"
                    placeHolder="Number of Max Public Channels" type="text" id="Max Public Channels" tabindex="1" @keyup="checkErrors({
                            'field': formData.maxPrivateChannels,
                            'name': formData.maxPrivateChannels.name,
                            'validations': formData.maxPrivateChannels.rules,
                            'type': formData.maxPrivateChannels.type,
                            'event': $event.event
                        })" inputId="refmaxPrivateChannels"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.maxPrivateChannels.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="Tracker Timesheet" class="createPlan_label">
                    Tracker Timesheet
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-trackerTimesheet" v-model="formData.trackerTimesheet"
                            id="trackerTimesheetYes" :value="true">
                        <label for="trackerTimesheetYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-trackerTimesheet" v-model="formData.trackerTimesheet"
                            id="trackerTimesheetNo" :value="false">
                        <label for="trackerTimesheetNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="User TimeSheet" class="createPlan_label">
                    User TimeSheet
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-userTimesheet" v-model="formData.userTimesheet"
                            id="userTimesheetYes" :value="true">
                        <label for="userTimesheetYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-userTimesheet" v-model="formData.userTimesheet"
                            id="userTimesheetNo" :value="false">
                        <label for="userTimesheetNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Project Timesheet" class="createPlan_label">
                    Project Timesheet
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-projectTimesheet" v-model="formData.projectTimesheet"
                            id="projectTimesheetYes" :value="true">
                        <label for="projectTimesheetYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-projectTimesheet" v-model="formData.projectTimesheet"
                            id="projectTimesheetNo" :value="false">
                        <label for="projectTimesheetNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Workload Timesheet" class="createPlan_label">
                    Workload Timesheet
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-workloadTimesheet" v-model="formData.workloadTimesheet"
                            id="workloadTimesheetYes" :value="true">
                        <label for="workloadTimesheetYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-workloadTimesheet" v-model="formData.workloadTimesheet"
                            id="workloadTimesheetNo" :value="false">
                        <label for="workloadTimesheetNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Milestone" class="createPlan_label">
                    Milestone
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-milestone" v-model="formData.milestone"
                            id="milestoneYes" :value="true">
                        <label for="milestoneYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-milestone" v-model="formData.milestone"
                            id="milestoneNo" :value="false">
                        <label for="milestoneNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Milestone Report" class="createPlan_label">
                    Milestone Report
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-milstoneReport" v-model="formData.milstoneReport"
                            id="milstoneReportYes" :value="true">
                        <label for="milstoneReportYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-milstoneReport" v-model="formData.milstoneReport"
                            id="milstoneReportNo" :value="false">
                        <label for="milstoneReportNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Time Estimate" class="createPlan_label">
                    Time Estimate
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-timeEstimateProjectApp" v-model="formData.timeEstimateProjectApp"
                            id="timeEstimateProjectAppYes" :value="true">
                        <label for="timeEstimateProjectAppYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-timeEstimateProjectApp" v-model="formData.timeEstimateProjectApp"
                            id="timeEstimateProjectAppNo" :value="false">
                        <label for="timeEstimateProjectAppNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Global Permison" class="createPlan_label">
                    Global Permison
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-globalPermison" v-model="formData.globalPermison"
                            id="globalPermisonYes" :value="true">
                        <label for="globalPermisonYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-globalPermison" v-model="formData.globalPermison"
                            id="globalPermisonNo" :value="false">
                        <label for="globalPermisonNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Project Wise Permission" class="createPlan_label">
                    Project Wise Permission
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-projectWisePermisson" v-model="formData.projectWisePermisson"
                            id="projectWisePermissonYes" :value="true">
                        <label for="projectWisePermissonYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-projectWisePermisson" v-model="formData.projectWisePermisson"
                            id="projectWisePermissonNo" :value="false">
                        <label for="projectWisePermissonNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Custom Fields" class="createPlan_label">
                    Custom Fields
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-customFields" v-model="formData.customFields"
                            id="customFieldsYes" :value="true">
                        <label for="customFieldsYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-customFields" v-model="formData.customFields"
                            id="customFieldsNo" :value="false">
                        <label for="customFieldsNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Push" class="createPlan_label">
                    Push Notification 
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-pushNotification" v-model="formData.pushNotification"
                            id="pushNotificationYes" :value="true">
                        <label for="pushNotificationYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-pushNotification" v-model="formData.pushNotification"
                            id="pushNotificationNo" :value="false">
                        <label for="pushNotificationNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Email" class="createPlan_label">
                    Email Notification 
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-emailNotification" v-model="formData.emailNotification"
                            id="emailNotificationYes" :value="true">
                        <label for="emailNotificationYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-emailNotification" v-model="formData.emailNotification"
                            id="emailNotificationNo" :value="false">
                        <label for="emailNotificationNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="Email" class="createPlan_label">
                    AI
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-aiPermission" v-model="formData.aiPermission"
                            id="emailNotificationYes" :value="true">
                        <label for="emailNotificationYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-aiPermission" v-model="formData.aiPermission"
                            id="emailNotificationNo" :value="false">
                        <label for="emailNotificationNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item" :class="[{'pointer-event-none opacity-5' : formData.aiPermission === false}]">
                <label for="Daily AI-generated Credit Limit" class="createPlan_label">
                    Daily AI-generated Credit Limit<span class="red">*</span>
                </label>
                <InputText class="form-control" v-model.trim="formData.aiRequest.value"
                    placeHolder="Number of Daily AI-generated Credit Limit" type="text" id="Daily AI-generated Credit Limit" tabindex="1" @keyup="checkErrors({
                            'field': formData.aiRequest,
                            'name': formData.aiRequest.name,
                            'validations': formData.aiRequest.rules,
                            'type': formData.aiRequest.type,
                            'event': $event.event
                        })" inputId="refmaxPublicChannels"
                        @keypress="onlyNumber($event.event)"
                        @paste="onlyNumberPaste($event.event)"
                    />
                <div class="invalid-feedback red">{{ formData.aiRequest.error }}</div>
                <div class="font-size-12 create_plan_Note">Note: '-1' for unlimited</div>
            </div>
            <div class="item">
                <label for="import" class="createPlan_label">
                    Import Tasks
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-importTask" v-model="formData.taskImportPermission"
                            id="taskImportYes" :value="true">
                        <label for="taskImportYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-importTask" v-model="formData.taskImportPermission"
                            id="taskImportNo" :value="false">
                        <label for="taskImportNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
            <div class="item">
                <label for="import" class="createPlan_label">
                    Export Tasks
                </label>
                <div class="d-flex mt-10px">
                    <div class="mr-15px">
                        <input type="radio" class="mr-10px radio" name="radio-group-exportTask" v-model="formData.taskExportPermission"
                            id="taskExportYes" :value="true">
                        <label for="taskExportYes" class="createPlan_label">Yes</label>
                    </div>
                    <div>
                        <input type="radio" class="mr-10px radio" name="radio-group-exportTask" v-model="formData.taskExportPermission"
                            id="taskExportNo" :value="false">
                        <label for="taskExportNo" class="createPlan_label">No</label>
                    </div>
                </div>
            </div>
        </div>

    </div>
    
</template>
<script setup>
    import InputText from '@/components/atom/InputText/InputText';
    import { useValidation } from "@/composable/Validation.js";
    const formData = defineModel()
    defineProps({
        isEdit: {
            type: Boolean,
            default: false,
        }
    })
    const { checkErrors } = useValidation();
    function onlyNumber(event) {
        const char = String.fromCharCode(event.keyCode);
        const input = event.target.value;
        if (!/[\d-]/.test(char)) {
            event.preventDefault();
        }
        if (char === '-' && (input.indexOf('-') !== -1 || event.target.selectionStart !== 0)) {
            event.preventDefault();
        }
    }
    function onlyNumberPaste(event) {
        const input = event.target.value;
        if (!/[\d-]/.test(event.clipboardData.getData('text'))) {
            event.preventDefault();
        }
        if (event.clipboardData.getData('text') === '-' && (input.indexOf('-') !== -1 || event.target.selectionStart !== 0)) {
            event.preventDefault();
        }
    }

</script>
<style scoped src="./style.css"></style>