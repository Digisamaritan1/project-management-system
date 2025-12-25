import { apiRequest } from '@/services';
import * as env from '@/config/env';

export const getTimeSheetData = (companyId,userArray,sdate,edate,projectId,taskId) => {
    return new Promise((resolve, reject) => {
        try {
            let axiosObj = {
                taskId: taskId,
                projectId: projectId,
                startDate: sdate,
                endDate: edate,
                userArray: userArray
            }
            apiRequest("post", `${env.TIMESHEET}/logDetail`,axiosObj)
            .then((result) => {
                let tempTypesSenseDocs = [];
                result.data.map((vals) => {
                    let docTemp = vals;
                    tempTypesSenseDocs.push({...docTemp,'logAddType':docTemp.logAddType ? docTemp.logAddType : 0});
                })
                resolve(tempTypesSenseDocs)
            })
            .catch((error)=>{
                console.error(error)
                reject([])
            })
        } catch (error) {
            reject(error);
        }
    })
}


export const getTaskName = (companyId,array) => {
    return new Promise((resolve, reject) => {
        try {
            let uniquerTaskId = [...new Set(array.map((x)=>{return x.TicketID}))]
            let finalUniquArray = uniquerTaskId.map((x)=> {
                return x
            })
            const getQuery = {
                $match: {
                    _id: { objId: {$in: finalUniquArray} }
                }
            }
            apiRequest('post',`${env.TASK}/find`,{findQuery: getQuery}).then((task) => {                
                if(task && task.status === 200 && task.data){
                    let Array = [];
                    task.data.forEach((ele)=>{
                        Array.push({id: ele._id, name: ele.TaskName , key: ele.TaskKey, isFolderSprint: ele.folderObjId ? true : false, sprintName: ele.sprintArray.name, folderName: ele.sprintArray.folderName ? ele.sprintArray.folderName : "" })
                    })
                    resolve(Array);
                }else{
                    resolve([]);
                }
            }).catch((error) => {
                console.error('error in getting the task',error);
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    })
}
