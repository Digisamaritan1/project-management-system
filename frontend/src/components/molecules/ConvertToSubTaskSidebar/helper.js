export function useHelperFun() {

    function changeStatus(st,st1,projectData) {
        projectData.taskStatusData.filter((val) => {
            if(val.key === st1.key){
                val['convertStatus'] = st;
            }
        })
    }

    function changeTaskType(type,type1,projectData) {
        projectData.taskTypeCounts.filter((val) => {
            if(val.value === type1.value){
                val['convertType'] = type;
            }
        })
    }

    function filterSprintData(taskSearch,isMoveTask,sprints,searchData,isDuplicate) {
        if(taskSearch && isMoveTask === false && isDuplicate === false) {
            let arr = [];
            sprints.map((x) => {
                searchData.map((y) => {
                    if(x.id === y.sprintId) {
                        arr.push({...x, isTaskExpanded: true});
                    }
                })
            });
            const uniqueArr = arr.filter((item, index, self) => {
                const foundIndex = self.findIndex((t) => t.id === item.id);
                return index === foundIndex;
            });
            return uniqueArr;
        } else if(taskSearch && (isMoveTask === true || isDuplicate === true)){
            let arr = [];
            sprints.filter((x) => {
                if(x.name && x.name.toLowerCase().includes(taskSearch.toLowerCase())) {
                    arr.push({...x, isTaskExpanded: true});
                }
            })
            return arr;
        }
        else {
            return sprints;
        }
    }

    function filterFolderSprintData(taskSearch,isMoveTask,sprintFolders,searchData,isDuplicate){
        if(taskSearch && isMoveTask === false && isDuplicate === false) {
            let arr = [];
            Object.keys(sprintFolders).map((x) => {
                searchData.map((y) => {
                    if(sprintFolders[x].folderId === y.folderObjId) {
                        if(sprintFolders[x].sprintsObj[y.sprintId]) {
                            arr.push({isExpanded : true, ...sprintFolders[x], sprintsObj: {[y.sprintId]: {...sprintFolders[x].sprintsObj[y.sprintId], isTaskExpanded: true}}});
                        }
                    }   
                })
            });
            const uniqueArr = arr.filter((item, index, self) => {
            const foundIndex = self.findIndex((t) => t.id === item.id);
            return index === foundIndex;
            });
            return uniqueArr;
        }
        else if(taskSearch && (isMoveTask === true || isDuplicate === true)){
            let arr = [];
            Object.keys(sprintFolders).filter((x) => {
                Object.keys(sprintFolders[x].sprintsObj).filter((y) => {
                    if(sprintFolders[x].sprintsObj[y] && sprintFolders[x].sprintsObj[y].name.toLowerCase().includes(taskSearch.toLowerCase())) {
                        const newItem = {
                            ...sprintFolders[x],
                            isExpanded: true,
                            sprintsObj: { [y]: { ...sprintFolders[x].sprintsObj[y] } },
                        };
                        if(arr.length > 0){
                            let index = arr.findIndex((item) => item.folderId === newItem.folderId)
                            if(index !== -1){
                                arr[index].sprintsObj = {...arr[index].sprintsObj, ...newItem.sprintsObj} 
                            }else{
                                arr.push(newItem)
                            }
                        }else{
                            arr.push(newItem);
                        }
                    }
                })
            })
            return arr;
        }
        else {  
            return sprintFolders;
        }
    }

    function oldStatusData(projectData, selectedTaskSubTask) {
        let uniqueArray = [];

        selectedTaskSubTask.forEach(y => {
            let match = projectData.taskStatusData.find(x => x.key === y.statusKey);
            if (match && !uniqueArray.some(item => item.key === match.key)) {
                uniqueArray.push(match);
            }
        });

        return uniqueArray;
    }

    function oldTaskTypeData(projectData, selectedTaskSubTask) {
        let uniqueArray = [];

        selectedTaskSubTask.forEach(y => {
            let match = projectData.taskTypeCounts.find(x => x.value === y.TaskType);
            if (match && !uniqueArray.some(item => item.value === match.value)) {
                uniqueArray.push(match);
            }
        });

        return uniqueArray;
    }

    return {
        changeStatus,
        changeTaskType,
        filterSprintData,
        filterFolderSprintData,
        oldStatusData,
        oldTaskTypeData
    }
}
