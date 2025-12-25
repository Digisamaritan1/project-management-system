import { createProject } from '@/utils/NotificationTemplate';
import { apiRequest } from '../../../services';
import * as env from '@/config/env';
import { useCustomComposable } from '@/composable';
import Store from "@/store/index";
const {sanitizeInput} = useCustomComposable();

export const HandleProject = async (path,dataObj,userData,CompanyId,action) => {
    return new Promise((resolve, reject) => {
        try {
            dataObj.isTemplate = action;
            apiRequest("post", env.CREATE_PROJECT, dataObj).then((result)=>{
                if(result.data.status === true){
                    let id = result.data.data._id;
                    let projectData = result.data.data;
                    if(result.data.customFieldVal !== undefined) {
                        resolve({status: true, id: id, data: projectData, message: "Project created successfully.",customFieldValueArray:result.data.customFieldVal});
                    } else {
                        resolve({status: true, id: id, data: projectData, message: "Project created successfully."});
                    }
                    let historyObj = {
                        'message': `<b>${userData.Employee_Name}</b> has created new </b> as <b>${sanitizeInput(dataObj.ProjectName)}</b> project`,
                        'key' : 'Project_Created',
                    }
                    let notificationObject = {
                        'message': createProject({
                            projectName: dataObj.ProjectName,
                        }),
                        'key': 'project_create',
                        'projectId': id,
                    }
                    apiRequest("post", env.HANDLE_HISTORY, {
                        type: 'project', 
                        companyId: CompanyId,
                        projectId: id,
                        taskId: null,
                        object: historyObj,
                        userData: userData,
                    })
                    .catch((error) => {
                        console.error("ERROR in update history", error);
                    })
    
                    apiRequest("post", env.HANDLE_NOTIFICATION, {
                        type: 'project',
                        companyId: CompanyId,
                        projectId: id,
                        object: notificationObject,
                        userData: userData,
                        changeType:'project_create',
                        changeData: {ProjectName : dataObj.ProjectName}
                    })
                    .catch((error) => {
                        console.error("ERROR in update notification", error);
                    })
                }else{
                    resolve({status: false, message: "Error In creating Project."});
                }
            })
            .catch((error) => {
                reject(error);
            })
        }
        catch(error){
            reject(error);
        }
    })
}

export const resetStatus = async () => {
    const getters = Store.getters;
    const projectTaskTypeArray = JSON.parse(JSON.stringify(getters['settings/projectTaskType']));
    const projectTaskTypeMap = new Map(projectTaskTypeArray.map((x) => [x._id, x]));
    const taskTypeArray = getters['settings/taskType'];

    const correspondingTasks = [];
    taskTypeArray?.filter((y) => y?.isShowSave === true)?.forEach((y) => {
        const correspondingTask = projectTaskTypeMap.get(y._id);
        delete y.isShowSave;
        y.isEditable = false;        
        if (correspondingTask) {
            if(correspondingTask.newAdded === true){
                delete correspondingTask?.newAdded;
                correspondingTask.taskTypes = correspondingTask.taskTypes.filter((x) => x.default === true);
                Store.commit("settings/mutateTaskType", { data: correspondingTask, op: "modified" });
                Store.commit("settings/setProjectTaskTypeArray", { data: correspondingTask, op: "modified" });
            }else{
                y.taskTypes = correspondingTask.taskTypes;
                correspondingTasks.push(correspondingTask);
                Store.commit("settings/mutateTaskType", { data: y, op: "modified" });
            }
        }
    });


    const projectStatusArr = JSON.parse(JSON.stringify(getters['settings/projectStatusStore']));
    const projectStatusMap = new Map(projectStatusArr.map((x) => [x._id, x]));
    const projectStatusArray = getters['settings/projectStaus'];

    const correspondingProjectStatus = [];
    projectStatusArray?.filter((y) => y?.isShowSave === true)?.forEach((y) => {
        const correspondingProject = projectStatusMap.get(y._id);
        delete y.isShowSave;
        y.isEditable = false;        
        if (correspondingProject) {
            if(correspondingProject.newAdded === true){
                delete correspondingProject?.newAdded;
                correspondingProject.projectActiveStatus = correspondingProject.projectActiveStatus.filter((x) => x.default === true);
                correspondingProject.projectDoneStatus = [];
                Store.commit("settings/mutateProjectStatus", { data: correspondingProject, op: "modified" });
                Store.commit("settings/setProjectStatus", { data: correspondingProject, op: "modified" });
            }else{
                y.projectCompletedStatus = correspondingProject.projectCompletedStatus;
                y.projectDoneStatus = correspondingProject.projectDoneStatus;
                y.projectActiveStatus = correspondingProject.projectActiveStatus;
                correspondingProjectStatus.push(correspondingProject);
                Store.commit("settings/mutateProjectStatus", { data: y, op: "modified" });
            }
        }
    })


    const projectTaskStatusArray = JSON.parse(JSON.stringify(getters['settings/projectTaskStatus']));
    const projectTaskStatusMap = new Map(projectTaskStatusArray.map((x) => [x._id, x]));
    const taskStatusArray = getters['settings/taskStatus'];

    const correspondingTasksStatus = [];
    taskStatusArray?.filter((y) => y?.isShowSave === true)?.forEach((y) => {
        const correspondingTask = projectTaskStatusMap.get(y._id);
        delete y.isShowSave;
        y.isEditable = false;
        if (correspondingTask) {
            if(correspondingTask.newAdded === true){
                delete correspondingTask?.newAdded;
                correspondingTask.ActiveStatusList = [];
                correspondingTask.DoneStatusList = [];
                Store.commit("settings/mutateTaskStatus", { data: correspondingTask, op: "modified" });
                Store.commit("settings/setProjectTaskStatusArray", { data: correspondingTask, op: "modified" });
            }else{
                y.defaultComplete = correspondingTask.defaultComplete;
                y.defaultActive = correspondingTask.defaultActive;
                y.DoneStatusList = correspondingTask.DoneStatusList;
                y.ActiveStatusList = correspondingTask.ActiveStatusList;
                correspondingTasksStatus.push(correspondingTask);
                Store.commit("settings/mutateTaskStatus", { data: y, op: "modified" });
            }
        }
    });
}