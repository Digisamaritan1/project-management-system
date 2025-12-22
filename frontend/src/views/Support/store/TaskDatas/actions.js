import * as env from '@/config/env';
import { apiRequest } from "@/services";


export const getPaginatedTasks = ({state, commit}, payload) => {
    return new Promise((resolve, reject) => {
        try {
            const {pid, sprintId, item, fetchNew, parentId = "", indexName = "", showAllTasks,isSupport,customerId} = payload;

            const indName = indexName || item.indexName

            const projectFound = Object.keys(state.tasks).includes(pid);
            let sprintFound = false;
            if(projectFound) {
                sprintFound = state.tasks[pid].sprints.includes(sprintId);
            }

            if(sprintFound && !fetchNew) {
                resolve();
                return;
            }

            let cursor = null;
            let foundKey = `${item.searchKey}_${item.searchValue}`;

            const indexKey = `${parentId && parentId.length ? `${parentId}_` : ''}${item.searchKey}_${item.searchValue}`;

            if(sprintFound) {
                cursor = state.tasks[pid][sprintId].index[indexKey] || null;
            }

            const queryParams = [
                {
                    $match: {
                        objId :{
                            ProjectID: pid,
                            sprintId: sprintId,
                        },
                        deletedStatusKey: 0,
                        ...((showAllTasks === undefined || showAllTasks === true || showAllTasks === 2) ? {} : {AssigneeUserId: {$in: [payload.userId]}}),
                        ...( parentId && parentId.length ? { ParentTaskId: parentId } : {isParentTask: true, ...( item.conditions?.length ? { ...item.conditions[0] } : "" )} ),
                        ...( isSupport ? { [`customField.${process.env.VUE_APP_CUSTOMFIELDID}.fieldValue`]: customerId } : {} ),
                        ...( parentId && parentId.length ? 
                            { ParentTaskId: parentId }
                        :
                            {
                                isParentTask: true,
                                ...( item.mongoConditions?.length ? 
                                    { ...item.mongoConditions[0] }
                                :
                                    item?.conditions?.length ?
                                        { ...item.conditions[0] }
                                    :
                                        {}
                                )
                            }
                        ),
                    }
                },
                { $sort: {[indName]: 1, "createdAt": 1, _id: 1}},
            ]

            const findQuery = [
                ...queryParams,
                {
                    $facet: {
                        result:[
                            { $skip: cursor || 0},
                            { $limit: 35}
                        ],
                        count:[
                            {$count: "count" }
                        ]
                    }
                }
            ]
                

            apiRequest('post',`${env.TASK}/find`,{findQuery: findQuery})
            .then((response) => {
                if(response.status === 200 && response?.data?.[0]){
                    const responseData = response?.data?.[0]?.result;
    
                    let resCount = {}
                    if(sprintFound && state.tasks[pid][sprintId].found?.[foundKey]) {
                        resCount = {[foundKey]:state.tasks?.[pid]?.[sprintId]?.found?.[foundKey] || 0};
                    } else {
                        resCount = {[foundKey]:response.count?.[0]?.count || 0};
                    }
    
                    // SET CURSOR
                    if(responseData && responseData.length) {
                        responseData.forEach(async (task) => {
                            const doc = task;

                            if(doc.startDate && doc.startDate > 0) {
                                doc.startDate = new Date(doc.startDate * 1000);
                            }
    
                            if(doc.DueDate && doc.DueDate > 0) {
                                doc.DueDate = new Date(doc.DueDate * 1000);
                                // doc.dueDateDeadLine = doc.dueDateDeadLine.map((x) => JSON.parse(x)).map((x) => ({date: new Date(x.date * 1000)}));
                            }
    
                            commit('mutateTypesenseTaskss', {found: resCount, nextPage: {[indexKey]: (cursor || 0) + responseData?.length || 0}, pid: pid, sprintId: sprintId, data: {...doc}})
                        })
                    } else {
                        commit('mutateTypesenseTaskss', {found: resCount, nextPage: {[indexKey]: (cursor || 0) + responseData?.length || 0}, pid: pid, sprintId: sprintId, data: null})
                    }
    
                    resolve({responseData});
                }else{
                    resolve([]);
                }
            })
            .catch((error) => {
                reject(error);
            })

        } catch (error) {
            reject(error);
        }
    })
}