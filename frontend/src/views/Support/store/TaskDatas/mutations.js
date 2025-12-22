import Cookies from 'js-cookie';
export const mutateMongoUpdatedTask = (state, payload) => {
    state.mongoUpdatedTask = payload;
}

export const mutateTaskItems = (state, payload) => {
    state.items = payload;
}
// HANDLE TASK
export const mutateUpdateFirebaseTasks = (state, payload) => {
    const {pid, sprintId, op, data, snap, updatedFields,dragDropcheck,convertSubTaskToTask, groupBy: payloadGroupBy} = payload;
    const projectFound = Object.keys(state.tasks).includes(pid);

    if(projectFound) {
        const {groupBy} = state.tasks[pid];
        const sprintFound = state.tasks[pid].sprints.includes(sprintId);

        if(sprintFound) {
            if(groupBy) {
                if(["modified", "added"]?.includes(op) && data.isParentTask) {
                    const {addKey, removeKey} = returnItemCountDetails(state.tasks[pid][sprintId].tasks, groupBy, updatedFields, data._id);
                    if(addKey) {
                        if(state.tasks[pid][sprintId].found[addKey]) {
                            state.tasks[pid][sprintId].found[addKey] += 1
                        } else {
                            state.tasks[pid][sprintId].found[addKey] = 1
                        }
                    }
                    if(removeKey) {
                        if(state.tasks[pid][sprintId].found[removeKey]) {
                            state.tasks[pid][sprintId].found[removeKey] -= 1
                        } else {
                            state.tasks[pid][sprintId].found[removeKey] = 0
                        }
                    }
                } else if(["removed"]?.includes(op)) {
                    const {removeKey} = returnItemCountDetails(state.tasks[pid][sprintId].tasks, groupBy, null, data._id);

                    if(removeKey) {
                        if(state.tasks[pid][sprintId].found[removeKey]) {
                            state.tasks[pid][sprintId].found[removeKey] -= 1
                        } else {
                            state.tasks[pid][sprintId].found[removeKey] = 0
                        }
                    }
                }
            }
            if(op === "inital") {
                if(!state.tasks[pid][sprintId].snapshot) {
                    state.tasks[pid][sprintId].snapshot = snap
                }
                state.tasks[pid].groupBy = payloadGroupBy;
            } else if(op === "added") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);
                    if(taskIndex !== -1) {
                        if(state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.length) {
                            const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);
                            if(subTaskIndex === -1) {
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.push(data);
                            } else {
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex], ...data};
                            }
                        } else {
                            state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray= [data];
                        }
                    }
                } else {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex === -1) {
                        // state.tasks[pid][sprintId].found[``] += 1;
                        state.tasks[pid][sprintId].tasks.push(data);
                    } else {
                        state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                    }
                }
            } else if(op === "modified") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);
                    if(taskIndex !== -1 && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray) {
                        const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);
                        if(subTaskIndex !== -1){
                            if(convertSubTaskToTask === true){
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.splice(subTaskIndex,1);
                            }else{
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex], ...data};
                            }
                        }else{
                            if(state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.length){
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.push(data);
                            }else{
                                state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray = [data];
                            }
                        }
                    }
                    else if(dragDropcheck === true && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray === undefined && data.ParentTaskId){
                        state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray = [data];
                    }
                } else {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if (data.islocalSnapStop && data.islocalSnapStop === true) {     
                        if (data.updateToken?.user !== Cookies.get('accessToken')) {     
                            if(taskIndex !== -1) {
                                state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                            }else{
                                state.tasks[pid][sprintId].tasks.push(data);
                            }
                        } else {
                            const temp = state.tasks[pid][sprintId].tasks?.[taskIndex]
                            if (temp?.updateTimeStamp <= updatedFields.updateToken?.timeStamp) {
                                let indexes = ['groupByDueDateIndex','groupByPriorityIndex','groupByAssigneeIndex','groupByStatusIndex']
                                let updatedIndex = Object.keys(updatedFields).find((x) => indexes.includes(x))
                                if (updatedIndex) {
                                    state.tasks[pid][sprintId].tasks[taskIndex][updatedIndex] = data[updatedIndex]
                                }
                            }
                        }
                    } else {
                        if(taskIndex !== -1) {
                            state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                        }else{
                            state.tasks[pid][sprintId].tasks.push(data);
                        }
                    }
                }
            } else if(op === "removed") {
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);
                    if(taskIndex !== -1 && state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray) {
                        const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);
                        state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.splice(subTaskIndex, 1);
                    }
                } else {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex !== -1) {
                        state.tasks[pid][sprintId].tasks.splice(taskIndex, 1);
                    }
                }
            }
            if(convertSubTaskToTask === true){
                return;
            }
            if(data !== null && data.sprintId !== sprintId && updatedFields?.sprintId){
                const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                if(taskIndex !== -1) {
                    state.tasks[pid][sprintId].tasks.splice(taskIndex, 1);
                }
            }
            if(data !== null && data.sprintId === sprintId && (updatedFields?.isParentTask === true || updatedFields?.isParentTask === false || updatedFields?.subTasks)){
                if(data.isParentTask === false) {
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex !== -1) {
                        state.tasks[pid][sprintId].tasks.splice(taskIndex,1);
                    }
                }else{
                    const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);
                    if(taskIndex === -1){
                        state.tasks[pid][sprintId].tasks.push(data)
                    }
                }
            }
        }
    }
}

export const removeProjectTaskSnap = (state, payload) => {
    delete state.tasks[payload];
}

export const mutateTypesenseTaskss = (state, payload) => {
    const {pid, sprintId, data, nextPage, found = 0} = payload;

    const keys = Object.keys(state.tasks);
    const projectFound = keys.includes(pid);

    if(projectFound) {
        const sprintFound = state.tasks[pid].sprints.includes(sprintId);

        if(sprintFound) {
            if(!data) return;

            if(data.isParentTask === false) {

                const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data.ParentTaskId);

                if(taskIndex !== -1) {
                    if(state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray) {
                        const subTaskIndex = state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.findIndex((x) => x._id === data._id);

                        if(subTaskIndex !== -1) {
                            state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray[subTaskIndex] = {...data};
                        } else {
                            state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray.push(data);
                        }
                    } else {
                        state.tasks[pid][sprintId].tasks[taskIndex].subtaskArray = [data];
                    }
                }
            } else {
                const taskIndex = state.tasks[pid][sprintId].tasks.findIndex((x) => x._id === data._id);

                if(taskIndex !== -1) {
                    state.tasks[pid][sprintId].tasks[taskIndex] = {...state.tasks[pid][sprintId].tasks[taskIndex], ...data};
                } else {
                    state.tasks[pid][sprintId].tasks.push(data);
                }
            }
            state.tasks[pid][sprintId].index = {
                ...state.tasks[pid][sprintId].index,
                ...nextPage
            };
            state.tasks[pid][sprintId].found = {
                ...state.tasks[pid][sprintId].found,
                ...found
            };
        } else {

            state.tasks[pid].sprints.push(sprintId);
            state.tasks[pid][sprintId]={
                index: {
                    ...nextPage
                },
                found: {
                    ...found
                },
                tasks: [],
                snapshot: null
            };
            if(data) {
                state.tasks[pid][sprintId].tasks = [data];
            }
        }
    } else {

        state.tasks[pid] = {
            projectId: pid,
            [sprintId]: {
                index: {
                    ...nextPage
                },
                found: {
                    ...found
                },
                tasks: [],
                snapshot: null
            },
            sprints: [sprintId]
        };
        if(data) {
            state.tasks[pid][sprintId].tasks = [data];
        }
    }
}

function returnItemCountDetails(tasks, groupBy, updatedFields = null, taskId) {
    const obj = {};

    let removeCountValue;
    const today = new Date().setHours(0, 0, 0, 0)/1000;
    let over;
    let next;
    switch(groupBy.type) {
        case 0:
            removeCountValue = tasks?.find((x) => x._id === taskId)?.statusKey
            if(updatedFields) {
                obj.addKey = groupBy.items?.find((x) => x.value === updatedFields.statusKey)?.key
            }
            obj.removeKey = groupBy.items?.find((x) => x.value === removeCountValue)?.key
            break;
        case 1:
            break;
        case 2:
            removeCountValue = tasks?.find((x) => x._id === taskId)?.Task_Priority
            if(updatedFields) {
                obj.addKey = groupBy.items?.find((x) => x.value === updatedFields.Task_Priority)?.key
            }
            obj.removeKey = groupBy.items?.find((x) => x.value === removeCountValue)?.key
            break;
        case 3:
            removeCountValue = tasks?.find((x) => x._id === taskId)?.DueDate;
            over = groupBy.items.find((x) => x.name === "Overdue")?.value
            next = groupBy.items.find((x) => x.name === "Next")?.value

            if(updatedFields) {
                if(updatedFields.DueDate === null) {
                    obj.addKey = groupBy.items?.find((x) => x.value === "DueDate_0")?.key
                } else {
                    if(today > (new Date(updatedFields.DueDate).setHours(0,0,0,0) / 1000)) {
                        obj.addKey = groupBy.items?.find((x) => x.value === (over))?.key
                    } else if(next <= (new Date(updatedFields.DueDate).setHours(0,0,0,0) / 1000)) {
                        obj.addKey = groupBy.items?.find((x) => x.value === (next))?.key
                    } else {
                        obj.addKey = groupBy.items?.find((x) => x.value === (new Date(updatedFields.DueDate).setHours(0,0,0,0) / 1000))?.key
                    }
                }
            }
            if(removeCountValue === null) {
                obj.removeKey = groupBy.items?.find((x) => x.value === "DueDate_0")?.key
            } else {
                if(today > (new Date(removeCountValue).setHours(0,0,0,0) / 1000)) {
                    obj.removeKey = groupBy.items?.find((x) => x.value === (over))?.key
                } else if(next <= (new Date(removeCountValue).setHours(0,0,0,0) / 1000)) {
                    obj.removeKey = groupBy.items?.find((x) => x.value === (next))?.key
                } else {
                    obj.removeKey = groupBy.items?.find((x) => x.value === (new Date(removeCountValue).setHours(0,0,0,0) / 1000))?.key
                }
            }
            break;
    }

    return obj;
}