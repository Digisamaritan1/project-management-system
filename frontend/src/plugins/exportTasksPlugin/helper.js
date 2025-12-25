import { apiRequest } from "@/services";
import * as env from "@/config/env";
import { useToast } from 'vue-toast-notification';
import { i18n } from "@/locales/main";
import { escapeCSVValue } from "@/composable/commonFunction";

const t = i18n.global.t;
const $toast = useToast();

const exportTaskAsCsv = async ({
  sprintId,
  projectId,
  tasks = null,
  fieldsToInclude = Object.keys(headerMapping), 
  fileName,
}) => {
  try {
    if (!tasks || tasks.length === 0) {
      tasks = await fetchTasks(sprintId, projectId);
      if (!tasks || tasks.length === 0) {
        $toast.error(t(`Toast.export_task_error`), { position: "top-right" });
        return;
      }
    }

    const csvHeader = fieldsToInclude.map(field => headerMapping[field] || field).join(",");

    const csvRows = tasks.map((task) =>
      fieldsToInclude
        .map((field) => {
          let value = task[field];

          if (Array.isArray(value)) {
            return escapeCSVValue(value.join(", "));
          } else if (typeof value === "object" && value !== null) {
            return value.text ? escapeCSVValue(value.text) : escapeCSVValue(JSON.stringify(value));
          } else if (typeof value === "boolean") {
            return escapeCSVValue(value ? "true" : "false");
          } else {
            return escapeCSVValue(value);
          }
        })
        .join(",")
    );

    const csvData = [csvHeader, ...csvRows].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    $toast.success(t(`Toast.export_task_success`), { position: "top-right" });
  } catch (error) {
    console.error("Error exporting as CSV:", error.message);
  }
};

const headerMapping = {
  "_id": "ID",
  "TaskName": "Task Name",
  "TaskKey": "Task Key",
  "AssigneeUserId": "Assignee User Id",
  "watchers": "Watchers",
  "DueDate": "Due Date",
  "TaskType": "Task Type",
  "TaskTypeKey": "Task Type Key",
  "Task_Leader": "Task Leader",
  "Task_Priority": "Task Priority",
  "status": "Status",
  "statusType": "Status Type",
  "statusKey": "Status Key",
  "isParentTask": "Is Parent Task",
  "ParentTaskId": "Parent Task Id"
};

const fetchTasks = async (sprintId, projectId) => {
  try {
    const response = await apiRequest("post", `${env.TASK}/find`, {
      findQuery: [
        {
          "$match": {
            objId: {
              ProjectID: projectId,
              sprintId: sprintId,
            },
          },
        },
      ],
    });

    return response.data || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export default {
  exportTaskAsCsv,
};
