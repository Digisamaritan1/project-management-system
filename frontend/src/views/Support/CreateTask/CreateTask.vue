<template>
    <div class="d-flex justify-content-between border-primary mb-1 border-radius-5-px create__task-div">
        <template v-if="sprint && Object.keys(sprint).length">
            <div class="d-flex align-items-center position-re w-50 w-100">
                <TaskType
                    :id="sprint.id+taskId+'create_taskType'"
                    v-model="taskType"
                    :options="taskTypes"
                />
                <InputText
                    v-model="taskName.value"
                    :placeholder="$t('Projects.task_name')"
                    class="border-0 create__task-inputtext"
                    :maxLength="250"
                    :minLength="3"
                    :isOutline="false"
                    @enter="saveTask()"
                    :isDirectFocus="true"
                    @keyup="checkErrors({'field':taskName,
                    'name':taskName.name,
                    'validations':taskName.rules,
                    'type':taskName.type,
                    'event':$event.event})"
                />
                <div v-if="save" class="red position-ab z-index-1 save__error" :style="[{fontSize : clientWidth > 480 ? '11px' : '10px', left : clientWidth > 480 ? '30px' : '0px',width : clientWidth > 480 ? '100%' : '320px'},]">{{taskName.error}}</div>
            </div>
            <div class="d-flex align-items-center">
                <!-- checklist -->

                <!-- <img style="margin-right: 5px;" :src="checklist" class="cursor-pointer" alt="dateImage"/> -->

                <!-- ASSIGNEE -->

                <!-- SAVE CLOSE -->
                <div class="d-flex align-items-center">
                    <button class="btn-primary save__btn-primary ml-10px p0x-10px"  @click.stop.prevent="saveTask()">{{$t("Projects.save")}}</button>
                    <img :src="closeRedIcon" alt="closeRedIcon" class="cursor-pointer m-10px" @click.stop.prevent="$emit('cancel')">
                </div>
            </div>
        </template>
        <template v-else>
            <span class="red">SPRINT DATA REQUIRED</span>
        </template>
    </div>
</template>

<script setup>
// PACKAGES
import { ref, defineProps, defineEmits, onMounted, inject, computed, onBeforeUnmount } from "vue";
import { useStore } from "vuex";

// COMPONENTS
import InputText from "@/components/atom/InputText/InputText.vue"
import TaskType from "@/components/atom/TaskType/TaskType.vue"

// UTILS
import { useGetterFunctions } from "@/composable";
import taskClass from "@/utils/TaskOperations"
const projectRef = inject("selectedProject");
import { useValidation } from "@/composable/Validation";
import { useToast } from "vue-toast-notification";
import { useRoute } from "vue-router";
import { CANYON_API_URI, MONGO_OPRATION } from "@/config/env";
import { apiRequestWithoutCompnay } from "@/services";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const clientWidth = inject("$clientWidth");
const companyId = inject("$companyId");
const $toast = useToast()
const {getUser} = useGetterFunctions()
const userId = inject("$userId")
const {getters} = useStore();
const  { checkErrors , checkAllFields } = useValidation();

// IMAGES
const closeRedIcon = require("@/assets/images/svg/closeBlack.svg");
// PROPS
const props = defineProps({
    sprint: {
        type: Object,
        required: true
    },
    taskId: {
        type: String,
        default: ""
    },
    assigneeOptions: {
        type: Array,
        default: () => []
    },
    projectProp: {
        type: Object,
        default: null
    },
    addDefaultAssignee: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
})

// EMITS

const emits = defineEmits(["cancel", "submit"]);
const companyOwner = computed(() => {
    return getters["settings/companyOwnerDetail"];
})

const taskName = ref({
    value: "",
    rules:
    "required | min: 3",
    name: "name",
    error: "",
});
const taskType = ref({});
const taskTypes = computed(() => project.value.taskTypeCounts)
const status = ref({});
const save = ref(false);
const dueDate = ref("");
const priority = ref("MEDIUM");
const assignee = ref([]);
const project = computed(() => {
    if(props.projectProp) {
        return props.projectProp;
    } else {
        return projectRef.value;
    }
})

const route = useRoute()

onMounted(() => {
    // SELECT DEFAULT TASK TYPE
    const taskTypeIndex = taskTypes.value && taskTypes.value.length ? 0 : -1
    if(taskTypeIndex !== -1) {
        taskType.value = taskTypes.value[taskTypeIndex]
    }

    // SELECT DEFAULT STATUS
    let statusIndex = project.value.taskStatusData && project.value.taskStatusData.length ? project.value.taskStatusData.findIndex((x) => x.type === "default_active") : -1
    if(statusIndex !== -1) {
        status.value = project.value.taskStatusData[statusIndex];
    }

    if(props.addDefaultAssignee) {
        assignee.value.push(userId.value);
    }
})
function resetTaskFields() {
    dueDate.value = "";
    taskName.value.value = "";
    taskName.value.error = "";
    priority.value = "MEDIUM";
    assignee.value = [];
}

function saveTask() {
    save.value = true;
    checkAllFields({taskName: taskName.value}).then( async(valid)=>{
        if(valid){
            save.value = false;
            if(taskName.value.value.trim().length < 3 || taskName.value.value.trim().length > 250) return;

            const name = taskName.value.value.trim();

            const user = getUser(userId.value)

            const userData = {
                id: user.id,
                Employee_Name: user.Employee_Name,
                companyOwnerId: companyOwner.value.userId,
            }

            let sprintObj = {
                id: props.sprint.id,
                name: props.sprint.name,
                value: props.sprint.value
            }

            if(props.sprint.folderId) {
                sprintObj.folderId = props.sprint.folderId;
                sprintObj.folderName = props.sprint.folderName;
            }

            const obj = {
                'TaskName': name,
                'TaskKey': '-',
                'AssigneeUserId': assignee.value,
                'watchers': [...assignee.value, userId.value],
                'DueDate': new Date(props.endDate ? props.endDate : dueDate.value),
                'dueDateDeadLine': [],
                'TaskType': taskType.value.value,
                'TaskTypeKey': taskType.value.key,
                'ParentTaskId': props.taskId,
                'ProjectID': project.value._id,
                'CompanyId': companyId.value,
                'status': {
                    "text": status.value.name,
                    "key": status.value.key,
                    "value": status.value.value,
                    'type': status.value.type
                },
                'isParentTask': props.taskId === "",
                'Task_Leader': userId.value,
                'sprintArray': sprintObj,
                'Task_Priority': priority.value,
                'deletedStatusKey': 0,
                'sprintId': props.sprint.id,
                'statusType': status.value.type,
                'statusKey': status.value.key
            }
            let updateDetail = {};
            updateDetail.fieldValue = route.params.cuid;
            updateDetail._id = process.env.VUE_APP_CUSTOMFIELDID;
            obj[`customField.${process.env.VUE_APP_CUSTOMFIELDID}`] = updateDetail;

            let data = {
                type: 'users',
                data:[{
                    _id:  route.params.cuid
                }]
            }
            const axiosData = {
                dataObj: data.data,
                collection: data.type,
                methodName: 'findOne'
            };

            let customerDetail = await apiRequestWithoutCompnay("post", `${CANYON_API_URI}${MONGO_OPRATION}`, axiosData)
            .then((response) => {
                if(response.data.status) {
                    return response.data.statusText
                } else {
                    $toast.error(response.data.statusText, {position: "top-right"});
                    return null;
                }
            })
            .catch((error) => {
                console.error("ERROR in get user data", error);
                $toast.error(error?.message || t("Toast.something_went_wrong"), {position: "top-right"});
                return null;
            })

            if(!customerDetail) {
                return
            }

            obj[`customField.${process.env.VUE_APP_CUSTOMFIELD_EMAIL}`] = {fieldValue: customerDetail.userEmail, _id: process.env.VUE_APP_CUSTOMFIELD_EMAIL};
            obj[`customField.${process.env.VUE_APP_CUSTOMFIELD_NAME}`] = {fieldValue: customerDetail.userName, _id: process.env.VUE_APP_CUSTOMFIELD_NAME};
            if (props.startDate) {
                obj.startDate = new Date(props.startDate)
            }
            const projectData = {
                _id: project.value._id,
                CompanyId: project.value.CompanyId,
                lastTaskId: project.value.lastTaskId,
                ProjectName: project.value.ProjectName,
                ProjectCode: project.value.ProjectCode
            }

            resetTaskFields();
            let indexObj
            if (props.taskId === "") {
                indexObj = {
                    indexName : "groupByStatusIndex",
                    searchKey : "statusKey",
                    searchValue : "1"
                }
            }
            if(route.params?.cuid){
                taskClass.create({data: obj, user: userData, projectData, indexObj})
                .then((data) => {
                    if(data.status){
                        $toast.success(t(`Toast.task_created_successfully`), {position: "top-right"});
                        emits('submit', {data: {...obj, _id: data.id}})
                    }else if(data.isUpgrade){
                        $toast.error(t(`Upgrades.upgrade_your_plan`), {position: "top-right"});
                    }else{
                        $toast.error(t(`Toast.something_went_wrong`), {position: "top-right"});
                    }
                })
                .catch((error) => {
                    console.error("ERROR in create task: ", error);
                })
            }
        }
    })
    .catch((error)=>{
        console.error("ERROR in creat task: ", error);
    })
}
onBeforeUnmount(() => {
    resetTaskFields()
})
</script>

<style scoped>
input#inputId::placeholder {
    color: #959595;
    font-size: 12px;
    font-weight: 400;
    text-transform: capitalize;
}
.create__task-div{
    height: 34px;
    padding: 0px 10px 0px 0px;
}
.save__error{
    bottom: -15px;
}
.save__btn-primary{
    height: 25px !important;
}
.create__task-inputtext{
    height: 28px !important;
}
</style>