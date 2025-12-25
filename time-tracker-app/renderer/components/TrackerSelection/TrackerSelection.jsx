// components/ProjectSelectionForm.jsx
import React, { useState,forwardRef, useImperativeHandle, useEffect } from 'react';
import Select from 'react-select';
import { apiRequest } from '../../utils/services';
import { useSelector } from 'react-redux';
import moment from 'moment';

const TrackerSelection = forwardRef(({
  projectOption,
  showDateTime = false, // New prop to control date/time visibility
},ref) => {
  // Local state management
  const { user } = useSelector((state) => state.user)
  const currentCopany = useSelector((state)=> state.company.currentCompany)
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [sprintAndFolderOption, setSprintAndFolderOption] = useState([]);
  const [sprintFolder, setSprintFolder] = useState([]);
  const [taskOptions, setTaskOptions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startTimeErr, setStartTimeErr] = useState("");
  const [endTimeErr, setEndTimeErr] = useState("");

  // Add error states
  const [errors, setErrors] = useState({
    projectError: '',
    listError: '',
    sprintError: '',
    taskError: '',
    commentError: '',
    dateError: '',
    timeError: ''
  });

  const handleProjectChange = async (selected) => {
    try {
      setErrors({ ...errors, projectError: '' });
      setSprintAndFolderOption([]);
      let project = { ...selected, sprintsObj: {}, sprintsfolders: {} };
      const { sprint, folder } = await getSprintFolderData(project._id);
      project.sprintsObj = sprint;
      project.sprintsfolders = folder;
      
      setSelectedProject(project);
      setComment('');
      setSelectedTask(null);
      setSelectedSprint(null);
      setSelectedList(null);
      setSprintFolder([]);
      setTaskOptions([]);
      setdropDownOptions(project);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  
    const handleTrackerInfoFill = async (url) => {
      try {
        setComment('');
        setSelectedTask(null);
        setSelectedSprint(null);
        setSelectedList(null);
        setSprintFolder([]);
        setTaskOptions([]);
        setErrors({ ...errors, projectError: '' });
        setSprintAndFolderOption([]);
  
        const queryParams = url.url.split('?')[1].split('&');
        const projectId = queryParams[3]?.split('=')[1];
        const sprintId = queryParams[2]?.split('=')[1];
        const taskId = queryParams[1]?.split('=')[1];
        const folderId = queryParams[4]?.split('=')[1];
  
        const selectedProjectOption = projectOption.find(x => x._id === projectId);
        if (!selectedProjectOption) return;
  
        const project = { ...selectedProjectOption, sprintsObj: {}, sprintsfolders: {} };
        const { sprint, folder } = await getSprintFolderData(project._id);
        project.sprintsObj = sprint;
        project.sprintsfolders = folder;
        setSelectedProject(project);
  
        const options = await setdropDownOptions(project);
  
        const companyId = currentCopany.id;
        const userid = user._id;
  
        const obj = {
          findQuery: [{
            "$match": {
              objId: { sprintId, ProjectID: projectId, CompanyId: companyId },
              statusType: { $in: ["active", "default_active"] },
              AssigneeUserId: { $in: [userid] }
            }
          }]
        };
  
        const res = await apiRequest("post", `/api/v1/task/find`, obj);
        const tasks = res?.data?.map(item => ({
          ...item,
          id: item._id,
          taskNameWithId: `${item.TaskKey} | ${item.TaskName}`,
          taskName: item.taskName
        })) || [];
  
        setTaskOptions(tasks);
  
        const taskOption = tasks.find(item => item.id === taskId);
  
        if (folderId && sprintId) {
          const folderOption = options.find(item => item.folderId === folderId);
          if (folderOption) {
            setSelectedList({ value: `${folderId}_folder`, label: folderOption.name });
  
            const sprintFolder = Object.values(project.sprintsfolders?.[folderId]?.sprintsObj || {}).filter(data =>
              !data.private || (data.private && data.AssigneeUserId?.includes(user._id))
            );
            setSprintFolder(sprintFolder);
  
            const selectedSprint = sprintFolder.find(item => item.id === sprintId);
            if (selectedSprint) {
              setSelectedSprint({ value: `${sprintId}__sprint`, label: selectedSprint.name });
            }
  
            if (taskOption) {
              handleTaskChange({ value: taskId, label: taskOption.taskNameWithId });
            }
          }
        } else if (!folderId && sprintId) {
          const sprintOption = options.find(item => item.id === sprintId);
          if (sprintOption) {
            setSelectedList({ value: `${sprintId}_sprint`, label: sprintOption.name });
            if (taskOption) {
              handleTaskChange({ value: taskId, label: taskOption.taskNameWithId });
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    window.ipc.on('trackerInfoFill', handleTrackerInfoFill);
  
    return () => {
      window.ipc.removeAll('trackerInfoFill');
    };
  }, [projectOption]);
  

  const getSprintFolderData = async (id) => {
    return new Promise((resolve, reject) => {
      try {
        Promise.allSettled([getSprintData(id), getFolderData(id)])
          .then((results) => {
            const resolvedPromises = results.filter((result) => result.status === 'fulfilled');
            if (resolvedPromises.length === 2) {
              const [sprintsResult, foldersResult] = resolvedPromises.map((result) => result.value);
              const sprintsArray = sprintsResult?.filter(sprint => sprint.projectId === id && !sprint.folderId).map(({ _id, ...x }) => ({ ...x, id: _id }));

              const foldersObject = foldersResult?.reduce((acc, folder) => {
                if (folder.projectId === id) {
                  let folId = folder._id;
                  acc[folId] = {
                    folderId: folId,
                    name: folder.name,
                    sprintsObj: {},
                    deletedStatusKey: folder.deletedStatusKey,
                    legacyId: folder?.legacyId ? folder?.legacyId : '',
                    id: folder._id
                  };
                }
                return acc;
              }, {});

              sprintsResult?.forEach(sprint => {
                if (sprint.projectId === id && sprint.folderId && foldersObject[sprint.folderId]) {
                  sprint.folderName = foldersObject[sprint.folderId].name;
                  sprint.id = sprint._id;
                  foldersObject[sprint.folderId].sprintsObj[sprint.id] = sprint;
                }
              });

              const sprintIdToObject = {};
              sprintsArray.forEach(item => { sprintIdToObject[item.id] = item; });
              resolve({ folder: foldersObject, sprint: sprintIdToObject });
            } else {
              reject("One or more promises were rejected");
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  };

  const getSprintData = (id) => {
    return new Promise((resolve, reject) => {
      try {
        apiRequest("get", `/api/v1/project/sprintFolder/${id}?collection=sprints`)
          .then((resp) => {
            let res = resp?.data.filter((x)=> !x.deletedStatusKey) || [];
            resolve(res);
          })
          .catch((error) => {
            reject(error)
          })
      } catch (error) {
        reject(error);
      }
    })
  }

  const getFolderData = (id) => {
    return new Promise((resolve, reject) => {
      try {
        apiRequest("get", `/api/v1/project/sprintFolder/${id}?collection=folders`)
          .then((resp) => {
            let res = resp?.data.filter((x)=> !x.deletedStatusKey) || [];
            resolve(res);
          })
          .catch((error) => {
            reject(error)
          })
      } catch (error) {
        reject(error);
      }
    })
  }
  const setdropDownOptions = (project) => {
    try {
      let option = [];
      if (Object.keys(project).length > 0) {
        if ("sprintsfolders" in project && Object?.keys(project?.sprintsfolders || {})?.length > 0) {
          Object.keys(project.sprintsfolders || {}).map((element) => {
            option.push(project.sprintsfolders[element]);
          });
        }
        if (Object.keys(project?.sprintsObj || {}).length > 0) {
          Object.values(project?.sprintsObj || {}).map((data) => {
            if (data.private) {
              if (data?.AssigneeUserId?.includes(user?._id)) {
                option.push(data);
              }
            } else if (!data.private) {
              option.push(data);
            }
          });
        }
        setSprintAndFolderOption(option);
        return option
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleListChange = (selected) => {
    
    setErrors({ ...errors, listError: '' });
    setComment('');
    setSelectedTask(null);
    setSelectedSprint(null);
    setTaskOptions([]);
    setSprintFolder([]);
    setSelectedList(selected);

    let details = selected.value.split("_");
    var id = details[0];
    var type = details[1];
    
    if (type === "folder") {
      let sprintFolder = [];
      if (Object?.keys(selectedProject.sprintsfolders[id]).length > 0) {
        if (Object?.keys(selectedProject.sprintsfolders[id]?.sprintsObj || {}).length > 0) {
          Object.values(selectedProject.sprintsfolders[id]?.sprintsObj || {}).map((data) => {
            if (data.private) {
              if (data?.AssigneeUserId?.includes(user?._id)) {
                sprintFolder.push(data);
              }
            } else if (!data.private) {
              sprintFolder.push(data);
            }
          });
        }
      }
      setSprintFolder(sprintFolder);
    } else {
      setSelectedSprint(selectedProject.sprintsObj[id]);
      getProjectTask(id);
    }
  };

  const handleSprintChange = (selected) => {
    setErrors({ ...errors, sprintError: '' });
    setComment('');
    setSelectedTask(null);
    setSelectedSprint(selected);

    let details = selected.value.split("_");
    var id = details[0];
    getProjectTask(id);

  };

  const getProjectTask = (sprint) => {
    const companyId = currentCopany.id;
    const userid = user._id;
    const projectId = selectedProject._id;
    
    let obj = {
      findQuery: [{
        "$match": {
          objId: {
            sprintId: sprint,
            ProjectID: projectId,
            CompanyId: companyId
          },
          statusType: { $in: ["active", "default_active"] },
          AssigneeUserId: { $in: [userid] }
        }
      }]
    };

    apiRequest("post", `/api/v1/task/find`, obj)
      .then((res) => {
        let tasks = [];
        if (res?.data?.length > 0) {
          res?.data?.map(item => {
            tasks.push({ ...item, id: item._id, taskNameWithId: `${item.TaskKey} | ${item.TaskName}`, taskName: item.taskName });
          });
        }
        setTaskOptions(tasks);
        return tasks;
      });
  };

  const handleTaskChange = (selected) => {
    setErrors({ ...errors, taskError: '' });
    setComment('');
    setSelectedTask(selected);
  };

  const handleCommentChange = (e) => {
    setErrors({ ...errors, commentError: '' });
    setComment(e.target.value);
  };

  const handleRemoveSelected = () => {
    setSelectedProject(null);
    setSelectedList(null);
    setSelectedSprint(null);
    setSelectedTask(null);
    setComment('');
    setSprintAndFolderOption([]);
    setSprintFolder([]);
    setTaskOptions([]);
  };

  const handleDateChange = (e) => {
    setStartDate(e.target.value);
    setErrors({ ...errors, dateError: '' });
  };

  const handleStartTimeChange = (e) => {
    setStartTimeErr("");
    setStartTime(e.target.value);
    setErrors({ ...errors, timeError: '' });
  };

  const handleEndTimeChange = (e) => {
    setEndTimeErr("");
    setEndTime(e.target.value);
    setErrors({ ...errors, timeError: '' });
  };

  // Modify validate method to include date/time validation
  const validate = () => {
    let isValid = true;
    const newErrors = {
      projectError: '',
      listError: '',
      sprintError: '',
      taskError: '',
      commentError: '',
      dateError: '',
      timeError: ''
    };

    if (!selectedProject) {
      newErrors.projectError = 'Please select a project';
      isValid = false;
    }

    if (!selectedList) {
      newErrors.listError = 'Please select a list';
      isValid = false;
    }

    if (sprintFolder.length > 0 && !selectedSprint) {
      newErrors.sprintError = 'Please select a sprint';
      isValid = false;
    }

    if (!selectedTask) {
      newErrors.taskError = 'Please select a task';
      isValid = false;
    }

    if (!comment.trim()) {
      newErrors.commentError = 'Please enter a comment';
      isValid = false;
    }

    if (showDateTime) {
      if (!startDate) {
        newErrors.dateError = 'Please select a date';
        isValid = false;
      }

      if (!startTime || !endTime) {
        newErrors.timeError = 'Please select both start and end time';
        isValid = false;
      } else if (startTime >= endTime) {
        newErrors.timeError = 'End time must be after start time';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Modify useImperativeHandle to include date/time data
  useImperativeHandle(ref, () => ({
    getSelectedData: () => {
      if (validate()) {
        return {
          selectedProject,
          selectedList,
          selectedSprint,
          selectedTask,
          comment,
          ...(showDateTime && {
            startDate,
            startTime,
            endTime
          })
        };
      }
      return null;
    },
    resetSelection: handleRemoveSelected,
    validate
  }));

  return (
    <div className={`max-w-[94%] w-full  mt-[30px] rounded-[15px] flex justify-center p-[15px] ${showDateTime ? 'bg-white' : ''}`}>
      <div className="w-full">
        {/* Project Select */}
        <div className="mb-[15px]">
          <Select
            value={selectedProject}
            options={projectOption}
            onChange={handleProjectChange}
            placeholder="Project Name"
            className="cursor-pointer"
            isDisabled={projectOption.length === 0}
            isSearchable={true}
          />
          {errors.projectError && (
            <div className="text-red-500 text-sm mt-1">{errors.projectError}</div>
          )}
        </div>

        {/* List Select */}
        <div className="mb-[15px]">
          <Select
            value={selectedList}
            options={sprintAndFolderOption.length > 0 
              ? sprintAndFolderOption.map((item) => ({ 
                  label: item.name, 
                  value: `${"id" in item ? item.id : "folderId" in item ? item.folderId : ""}_${"folderId" in item ? "folder" : 'sprint'}` 
                })) 
              : [{label: 'No Option Available',value: ''}]
            }
            onChange={handleListChange}
            placeholder="List Name"
            isDisabled={!selectedProject}
            isSearchable={true}
          />
          {errors.listError && (
            <div className="text-red-500 text-sm mt-1">{errors.listError}</div>
          )}
        </div>

        {/* Sprint Select */}
        {sprintFolder.length > 0 && (
          <div className="mb-[15px]">
            <Select
              value={selectedSprint}
              options={sprintFolder.length > 0 ? sprintFolder.map((item) => ({ 
                label: item.name, 
                value: `${item.id}_${'sprint'}` 
              })) : [{label: 'No Option Available',value: ''}]}
              onChange={handleSprintChange}
              placeholder="Sprint Name"
              isDisabled={!selectedList}
              isSearchable={true}
            />
            {errors.sprintError && (
              <div className="text-red-500 text-sm mt-1">{errors.sprintError}</div>
            )}
          </div>
        )}

        {/* Task Select */}
        <div className="mb-[15px]">
          <Select
            value={selectedTask}
            options={taskOptions.length > 0 ? taskOptions.map((item) => ({ 
              label: item.taskNameWithId, 
              value: `${item.id}` 
            })): [{label: 'No Option Available',value: ''}]}
            onChange={handleTaskChange}
            placeholder="Task Name"
            isDisabled={!selectedSprint || !selectedList}
            isSearchable={true}
          />
          {errors.taskError && (
            <div className="text-red-500 text-sm mt-1">{errors.taskError}</div>
          )}
        </div>


        {/* Comment Area */}
        <div className="mt-[15px]">
          <div className="flex justify-center">
            <textarea
              className="w-full h-[90px] rounded-[5px] resize-none text-sm p-3 text-[#959595] border border-[#DFE1E6] outline-none font-roboto placeholder-[#b3b3b3]"
              placeholder="Comment"
              value={comment}
              onChange={handleCommentChange}
            />
          </div>
          {errors.commentError && (
            <div className="text-red-500 text-sm mt-1">{errors.commentError}</div>
          )}
        </div>

         {/* Date and Time Pickers - Only shown when showDateTime is true */}
         {showDateTime && (
          <>
            <div className="mt-[15px] relative">
              <div className="relative">
                <label className="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-600">
                  Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={moment().format('YYYY-MM-DD')}
                  onChange={handleDateChange}
                  className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.dateError && (
                <div className="text-red-500 text-sm mt-1">{errors.dateError}</div>
              )}
            </div>

            <div className="mt-[15px] flex gap-4">
              <div className="flex-1 relative">
                <label className="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-600">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {startTimeErr && (
                  <div className="text-red-500 text-sm mt-1">{startTimeErr}</div>
                )}
              </div>
              <div className="flex-1 relative">
                <label className="absolute -top-2 left-2 bg-white px-1 text-sm text-gray-600">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {endTimeErr && (
                  <div className="text-red-500 text-sm mt-1">{endTimeErr}</div>
                )}
              </div>
            </div>
            {errors.timeError && (
              <div className="text-red-500 text-sm mt-1">{errors.timeError}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default TrackerSelection;