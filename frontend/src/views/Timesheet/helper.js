import moment from 'moment';
import { apiRequest } from '@/services';
import * as env from '@/config/env';
// TO MANAGE DATE RANGE ACCRODING TO START & END DATE
export function managedDateRange(sdate, edate) {
  return new Promise((resolve, reject) => {
    try {
      let tempStart = moment(sdate).format('YYYY MM DD');
      let tempend = moment(edate).format('YYYY MM DD');
      let s_date = new Date(tempStart).setHours(0);
      s_date = new Date(s_date).setMinutes(0);
      s_date = new Date(s_date).setSeconds(0);
      let e_date = new Date(tempend).setHours(23);
      e_date = new Date(e_date).setMinutes(59);
      e_date = new Date(e_date).setSeconds(59);
      resolve({ status: true, data: { 'start': s_date, 'end': e_date } });
    } catch (error) {
      reject(error);
    }
  })
}

export function changeTableStyle(dateColumns, activeWeekObj, tableStyle) {
  return new Promise((resolve, reject) => {
    try {
      const dateColumnsLength = dateColumns.length;
      const dayMappings = {
        1: "isOneday",
        2: "isTwoday",
        3: "isThreeday",
        4: "isFourday",
        5: "isFiveday",
        6: "isSixday",
      };
      if (dateColumnsLength <= 6) {
        const dayProperty = dayMappings[dateColumnsLength];
        activeWeekObj[dayProperty] = true;
      }
      if (dateColumns.length <= 20) {
        activeWeekObj.isWeeked = true;
        tableStyle.colspanCount = "27";
        tableStyle.tableWidth = "1888px";
      }
      if (dateColumns.length > 7) {
        const noOfDays = dateColumns.length;
        const tblWidth = noOfDays * 135 + 445;
        tableStyle.tableWidth = tblWidth + "px";
        const tblColspan = 6 + 3 * noOfDays;
        tableStyle.colspanCount = tblColspan;
      }
      resolve({
        status: true,
        data: {
          dateColumns,
          activeWeekObj,
          tableStyle,
        },
      });
    } catch (error) {
      reject(error);
    }
  })
}

export function getFinalFilter(filterType, users, teams, projects) {
  return new Promise((resolve, reject) => {
    try {
      let finalFilter = [];
      if (filterType.toLowerCase() == "users") {
        if (users && users.length > 0) {
          users.forEach(x => {
            finalFilter.push({
              "id": x._id,
              'name': x.Employee_Name,
              'profile': x.Employee_profileImageURL || ""
            })
          });
        }
        else {
          finalFilter = [];
        }
      }
      else if (filterType.toLowerCase() == "teams") {
        if (teams && teams.length > 0) {
          teams.forEach(x => {
            finalFilter.push({
              "id": x._id,
              'name': x.name
            })
          });
        }
        else {
          finalFilter = [];
        }
      }
      else if (filterType.toLowerCase() == "projects") {
        if (projects && projects.length > 0) {
          projects.forEach(x => {
            finalFilter.push({
              "id": x._id,
              'name': x.ProjectName,
              'AssigneeUserId': x.AssigneeUserId,
              'ProjectCode': x.ProjectCode,
              "projectIcon": x.projectIcon
            })
          });
        } else {
          finalFilter = [];
        }
      }
      resolve({ status: true, data: { 'finalFilter': finalFilter } });
    }
    catch (error) {
      reject(error);
    }
  })
}

export function handleFilterItem(selectedItem, type, selectedFilters, checkedFilter, filterType) {
  return new Promise((resolve, reject) => {
    try {
      let selectKey = selectedFilters.findIndex((x) => { return x.id == selectedItem.id });
      let foundKey = checkedFilter.findIndex((x) => { return x == selectedItem.id });
      if (type == "add") {
        if (selectKey <= -1) {
          selectedFilters.push({ ...selectedItem, 'type': filterType });
          checkedFilter.push(selectedItem.id)
        }
      }
      if (type == "remove") {
        if (selectKey > -1) {
          selectedFilters.splice(selectKey, 1);
        }
        if (foundKey > -1) {
          checkedFilter.splice(foundKey, 1);
        }
      }
      if (type == 'checkEvent') {
        if (selectKey <= -1) {
          selectedFilters.push({ ...selectedItem, 'type': filterType });
          if (foundKey <= -1) {
            checkedFilter.push(selectedItem.id);
          }
        } else {
          selectedFilters.splice(selectKey, 1);
          if (foundKey > -1) {
            checkedFilter.splice(foundKey, 1);
          }
        }
      }
      resolve({ status: true, data: { selectedFilters: selectedFilters, checkedFilter: checkedFilter } })
    }
    catch (error) {
      reject(error);
    }
  })
}

export const getTaskData = (projectObject, timesheetDocArray) => {
    return new Promise((resolve, reject) => {
        try {
            projectObject.activitiesArray = [];
            const tmpfullLoggedData = timesheetDocArray.value.filter(x => x.user.trim() === projectObject.selectedUserId.trim());
            let tmpuserRecord = tmpfullLoggedData.map(item => item['data']).flat();
            let userRecord = tmpuserRecord.filter(x => x.projectId === projectObject._id);
            let uniqueTicketId = userRecord.map((x)=>{return x.taskId})
            const mergedArray = [...new Set(uniqueTicketId.flat())];
            let finalUniquArray = mergedArray.map((x) => {
                return x
            })
            const findQuery = [
                {
                    "$match": {
                        _id: {objId: { $in: finalUniquArray}}
                    }
                }
            ];
            apiRequest('post',`${env.TASK}/find`,{findQuery: findQuery}).then((res) => {
              if(res.status === 200){
                let result = res.data;
                let count = 0;
                const countFunction = (row) => {
                    if (count >= userRecord.length) {
                        resolve({ 'status': true, 'data': projectObject, 'key': "logtime" });
                        return;
                    }
                    let search_key = projectObject.activitiesArray.findIndex(values => values._id === row.taskId);
                    let tempESTDate = row.date ? moment(row.date).format("YYYY-MM-DD") : "";
                    if (search_key !== -1) {
                        const activity = projectObject.activitiesArray[search_key];
                        activity.totalTaskLogMin += row.logMinutes || 0;
                        if (row.logType === 0 || row.logType === undefined) {
                            activity.totalTaskManualLogMin += row.logMinutes
                        } else {
                            activity.totalTaskTrackedLogMin += row.logMinutes
                        }
                        let tempDateObj = activity.taskFinalLogs || {};
                        let logTypeDateObj = activity.dateLogsType || {};
                        let isInc = Object.keys(tempDateObj).includes(tempESTDate);
                        if (isInc) {
                            tempDateObj[tempESTDate] += row.logMinutes || 0;
                            if (row.logType === 0 || row.logType === undefined) {
                                activity.dateManualTime[tempESTDate] = activity.dateManualTime[tempESTDate] ? activity.dateManualTime[tempESTDate] + row.logMinutes : row.logMinutes
                            } else if (row.logType === 1) {
                                activity.dateTrackTime[tempESTDate] = activity.dateTrackTime[tempESTDate] ? activity.dateTrackTime[tempESTDate] + row.logMinutes : row.logMinutes
                            }
                            if (logTypeDateObj[tempESTDate] !== row.logType) {
                                logTypeDateObj[tempESTDate] = 2;
                            }
                        } else {
                            tempDateObj[tempESTDate] = row.logMinutes || 0;
                            logTypeDateObj[tempESTDate] = row.logType;
                            if (row.logType === 0 || row.logType === undefined) {
                                activity.dateManualTime[tempESTDate] = row.logMinutes
                            } else if (row.logType === 1) {
                                activity.dateTrackTime[tempESTDate] = row.logMinutes
                            }
                        }
                        activity.taskFinalLogs = tempDateObj;
                        activity.dateLogsType = logTypeDateObj;
                        if (!activity.rateManage[tempESTDate]) {
                            activity.rateManage[tempESTDate] = activity.spendWorkRate ? parseInt(activity.spendWorkRate) : 0;
                        }
                        if (Object.keys(activity.dateManage).length === 0 || activity.dateManage[tempESTDate] === undefined) {
                            activity.dateManage[tempESTDate] = 0;
                        }
                        const tmpData = (activity.dateManage[tempESTDate] || 0) + (activity.LogTimeDuration || 0);
                        activity.dateManage[tempESTDate] = tmpData;
                        const tmpTimeData = (activity.rateManage[tempESTDate] || 0) + (activity.spendWorkRate ? parseInt(activity.spendWorkRate) : 0);
                        activity.rateManage[tempESTDate] = tmpTimeData || 0;
                        count += 1;
                        countFunction(userRecord[count]);
                    } else {
                        // let ind = result.findIndex((x) => { return row.data.map(item => { return item.taskId }).includes(x._id)})
                        let ind = result.findIndex((x)=>{return x._id === row.taskId})
                        if (ind === -1) {
                            count += 1;
                            countFunction(userRecord[count]);
                            return;
                        }
                        result[ind].Created_At = result[ind].Created_At !== "" ? { 'seconds': result[ind].Created_At } : new Date(result[ind].Created_At * 1000);
                        result[ind].DueDate = result[ind].DueDate !== "" ? { 'seconds': result[ind].DueDate } : new Date(result[ind].DueDate * 1000);
                        result[ind].EndDate = result[ind].EndDate !== "" ? { 'seconds': result[ind].EndDate } : new Date(result[ind].EndDate * 1000);
                        result[ind].StartDate = result[ind].StartDate !== "" ? { 'seconds': result[ind].StartDate } : new Date(result[ind].StartDate * 1000);
                        result[ind].Updated_At = result[ind].Updated_At !== "" ? { 'seconds': result[ind].Updated_At } : new Date(result[ind].Updated_At * 1000);
                        result[ind].rateManage = {};
                        result[ind].dateManage = {};
                        result[ind].dateLogsType = {};
                        result[ind].dateManualTime = {};
                        result[ind].dateTrackTime = {};
                        result[ind].rateManage[tempESTDate] = 0;
                        if (result[ind].taskFinalLogs === undefined) {
                            result[ind].taskFinalLogs = {};
                        }
                        if (result[ind].totalTaskLogMin === undefined) {
                            result[ind].totalTaskLogMin = 0;
                            result[ind].totalTaskManualLogMin = 0;
                            result[ind].totalTaskTrackedLogMin = 0;
                        }
                        result[ind].rateManage[tempESTDate] = result[ind].spendWorkRate ? parseInt(result[ind].spendWorkRate) : 0;
                        result[ind].dateManage[tempESTDate] = 0;
                        result[ind].dateManage[`${tempESTDate}`] = result[ind].LogTimeDuration || 0;
                        result[ind].totalTaskLogMin += row.logMinutes || 0;
                        if (row.logType === 0 || row.logType === undefined) {
                            result[ind].totalTaskManualLogMin += row.logMinutes
                        } else {
                            result[ind].totalTaskTrackedLogMin += row.logMinutes
                        }

                        let isInc = Object.keys(result[ind].taskFinalLogs).includes(tempESTDate);
                        if (isInc) {
                            if (row.logType === 0 || row.logType === undefined) {
                                result[ind].dateManualTime[`${tempESTDate}`] = result[ind].dateManualTime[`${tempESTDate}`] ? result[ind].dateManualTime[`${tempESTDate}`] + row.logMinutes : row.logMinutes
                            } else if (row.logType === 1) {
                                result[ind].dateTrackTime[`${tempESTDate}`] = result[ind].dateTrackTime[`${tempESTDate}`] ? result[ind].dateTrackTime[`${tempESTDate}`] + row.logMinutes : row.logMinutes
                            }
                            result[ind].taskFinalLogs[tempESTDate] += row.logMinutes || 0;
                            if (result[ind].dateLogsType[tempESTDate] !== row.logType) {
                                result[ind].dateLogsType[tempESTDate] = 2;
                            }
                        } else {
                            result[ind].taskFinalLogs[tempESTDate] = row.logMinutes || 0;
                            result[ind].dateLogsType[tempESTDate] = row.logType;
                            if (row.logType === 0 || row.logType === undefined) {
                                result[ind].dateManualTime[`${tempESTDate}`] = row.logMinutes
                            } else if (row.logType === 1) {
                                result[ind].dateTrackTime[`${tempESTDate}`] = row.logMinutes
                            }
                        }
                        projectObject.activitiesArray.push(result[ind]);
                        count += 1;
                        countFunction(userRecord[count]);
                    }
                };
                countFunction(userRecord[count]);
              }else{
                resolve({ 'status': false, 'data': {}, 'key': "logtime" });
              }
            }).catch((error)=>{
              console.error('Error in getting the task',error);
            })
        } catch (error) {
            reject(error);
        }
    });
};

export const getTaskEstimateData = (projectId, userId, estimateDocArray) => {
  return new Promise((resolve, reject) => {
    try {
      let activitiesArray = [];
      let tmpfullETAData = estimateDocArray.value.map(item => item['data']).flat();
      let userRecord = tmpfullETAData.filter(x => x.userId.trim() === userId.trim() && x.projectId === projectId);
      let uniqueTicketId = userRecord.map((x) => { return x.taskId })
      let uniquerTaskId = [...new Set(uniqueTicketId)]
      let finalUniquArray = uniquerTaskId.map((x) => {
        return x
      })
      const findQuery = [
        {
            "$match": {
                _id: {objId: { $in: finalUniquArray}}
            }
        }
      ];
      apiRequest('post',`${env.TASK}/find`,{findQuery: findQuery}).then((res) => {
        if(res.status === 200){
          let result = res.data;
          let count = 0;
          const countFunction = (row) => {
            if (count >= userRecord.length) {
              resolve({ 'status': true, 'data': activitiesArray, 'key': "estimate" });
              return;
            }
            let search_key = activitiesArray.findIndex(values => values.id === row.taskId);
            let tempESTDate = row.date ? moment(new Date(row.date)).format("YYYY-MM-DD") : "";
            if (search_key !== -1) {
              const activity = activitiesArray[search_key];
              activity.totalTaskEstMin += row.logMinutes || 0;
              let tempDateObj = activity.taskFinalEstimate || {};
              let isInc = Object.keys(tempDateObj).includes(tempESTDate);
              if (isInc) {
                tempDateObj[tempESTDate] += row.logMinutes || 0;
              } else {
                tempDateObj[tempESTDate] = row.logMinutes || 0;
              }
              activity.taskFinalEstimate = tempDateObj;
              if (Object.keys(activity.dateManage).length === 0 || activity.dateManage[tempESTDate] === undefined) {
                activity.dateManage[tempESTDate] = 0;
              }
              const tmpData = (activity.dateManage[tempESTDate] || 0) + (activity.EstimatedTime || 0);
              activity.dateManage[tempESTDate] = tmpData;
              count += 1;
              countFunction(userRecord[count]);
            } else {
              let ind = result.findIndex((x) => { return x._id === row.taskId })
              if (ind === -1) {
                count += 1;
                countFunction(userRecord[count]);
                return;
              }
              result[ind].Created_At = result[ind].Created_At !== "" ? { 'seconds': result[ind].Created_At } : new Date(result[ind].Created_At * 1000);
              result[ind].DueDate = result[ind].DueDate !== "" ? { 'seconds': result[ind].DueDate } : new Date(result[ind].DueDate * 1000);
              result[ind].EndDate = result[ind].EndDate !== "" ? { 'seconds': result[ind].EndDate } : new Date(result[ind].EndDate * 1000);
              result[ind].StartDate = result[ind].StartDate !== "" ? { 'seconds': result[ind].StartDate } : new Date(result[ind].StartDate * 1000);
              result[ind].Updated_At = result[ind].Updated_At !== "" ? { 'seconds': result[ind].Updated_At } : new Date(result[ind].Updated_At * 1000);
              result[ind].rateManage = {};
              result[ind].dateManage = {};
              result[ind].dateLogsType = {};
              if (result[ind].taskFinalEstimate === undefined) {
                result[ind].taskFinalEstimate = {};
              }
              if (result[ind].totalTaskEstMin === undefined) {
                result[ind].totalTaskEstMin = 0;
              }
              result[ind].dateManage[`${tempESTDate}`] = result[ind].EstimatedTime || 0;
              result[ind].totalTaskEstMin += row.logMinutes || 0;
              let isInc = Object.keys(result[ind].taskFinalEstimate).includes(tempESTDate);
              if (isInc) {
                result[ind].taskFinalEstimate[tempESTDate] += row.logMinutes || 0;
              } else {
                result[ind].taskFinalEstimate[tempESTDate] = row.logMinutes || 0;
              }
              activitiesArray.push(result[ind]);
              count += 1;
              countFunction(userRecord[count]);
            }
          };
          countFunction(userRecord[count]); 
        }else{
          resolve({ 'status': false, 'data': [], 'key': "estimate" });
        }
      }).catch((error)=>{
        console.error('Error in getting the task',error);
      })
    } catch (error) {
      reject(error);
    }
  });
};

