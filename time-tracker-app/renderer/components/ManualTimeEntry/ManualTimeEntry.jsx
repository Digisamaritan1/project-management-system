import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProject } from '../../controller/project/project';
import TrackerSelection from '../TrackerSelection/TrackerSelection';
import { apiRequest } from '../../utils/services';
import store from '../../store/store';
import moment from 'moment';
import Loader from '../Loader/Loader';

const ManualTimeEntry = ({ onClose }) => {
  const dispatch = useDispatch();
  const companyUser = useSelector((state) => state.company.companyUser);
  const currentCopany = useSelector((state) => state.company.currentCompany);
  const { user } = useSelector((state) => state.user);

  const [isTrackerPermission, setIsTrackerPermission] = useState(true);
  const [projectOption, setProjectOption] = useState([]);
  const trackerRef = useRef(null);
  const [isSpinner,setIsSpinner] = useState(false);

  useEffect(() => {
    init();
  }, [companyUser]);

  const init = () => {
    if (!companyUser.isTrackerUser) {
      setIsTrackerPermission(false);
      return;
    } else {
      setIsTrackerPermission(true);
      fetchProject()
        .then((projects) => {
          if (projects.length) {
            let option = projects
            .filter((x) => {
              let index = x.apps.findIndex((z) => z.key === 'TimeTracking');
              return index !== -1 && x.apps[index].appStatus || x.apps.includes('TimeTracking');
            })
            .map((itm) => ({ label: itm.ProjectName, value: itm._id, ...itm }));
            setProjectOption(option);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  function calculateDuration(startDate, endDate) {
    const startMoment = moment(startDate, "HH:mm");
    const endMoment = moment(endDate, "HH:mm");
    const duration = endMoment.diff(startMoment);
    
    var durationInMinutes = Math.floor(duration / 60000);
    var hours = Math.floor(durationInMinutes / 60);
    var minutes = durationInMinutes % 60;
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes}`;
  }

  const handleStartTracker = () => {
    try {
        const selectedData = trackerRef.current.getSelectedData();
        if (selectedData) {
            setIsSpinner(true);
          let axiosData = {
            logTimeDate: selectedData?.startDate || '',
            description: selectedData?.comment || "",
            endLogTime: selectedData?.endTime || '',
            startLogTime: selectedData?.startTime || '',
            timeDuration: calculateDuration(selectedData?.startTime, selectedData?.endTime),
            ticketId: selectedData?.selectedTask?.value || "",
            projectId: selectedData?.selectedProject?._id || "",
            companyId: currentCopany?._id || "",
            userId: user?._id || '',
            isEdit: false,
            userName: store.getState()?.user?.user?.Employee_Name,
            dateFormat: "DD-MM-yyyy",
            timeSheetId: "",
            sprintId: selectedData?.selectedSprint?.value,
            taskName: selectedData?.selectedTask?.label.split(" | ")[1] || '',
            companyOwnerId: store.getState()?.company.currentCompany?.userId || "N/A",
            projectName: selectedData?.selectedProject?.ProjectName,
            previousLoggedTime: "",
            timeZone: "Time_Zone" in store.getState()?.user?.user ? store.getState()?.user?.user?.Time_Zone : "Asia/Kolkata" || "Asia/Kolkata",
            timeFormat: "Time_Format" in store.getState()?.user?.user ? store.getState()?.user?.user?.Time_Format : "Asia/Kolkata" || "12",
            type: "timesheets"
          };
    
          apiRequest('post', `/api/v2/manualLogtime`, axiosData)
            .then((result) => {
              if (result.data.status === true) {
                onClose(); // Close the modal on success
                setIsSpinner(false);
              } else {
                setIsSpinner(false);
                console.error('Something went wrong....');
              }
            })
            .catch((err) => {
                setIsSpinner(false);
              console.error(err);
            });
        }
    } catch (error) {
        setIsSpinner(false);
        console.error(error);        
    }
  };

  return (
    <div>
    {isSpinner && <Loader/>}
      {!isTrackerPermission ? (
        <div className='flex justify-center items-center flex-col p-12 text-center'>
          <div><img src="/images/png/Frame.png" alt='warning' /></div>
          <div className='font-semibold text-md'>
            You don't have permission to use tracker please contact your administrator.
          </div>
        </div>
      ) : (
        <div>
          <TrackerSelection
            ref={trackerRef}
            projectOption={projectOption}
            showDateTime={true}
          />

          <div className="flex justify-center mt-4">
            <button
              className="w-full bg-[#2F3990] text-white py-[10px] rounded-[5px] text-sm hover:bg-[#252d75] transition-colors"
              onClick={handleStartTracker}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualTimeEntry; 