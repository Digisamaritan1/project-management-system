import { createSlice } from '@reduxjs/toolkit';

const timeLog = createSlice({
  name: 'timeLog',
  initialState: {
    comment: "",
    startTime: null,
    stopTime: null,
    captures: [],
    keyboardClicks: [],
    applicationDetails: [],
    mouseClicks: [],
    trackerStart: false,
    trackerID: "",
    sprintId: "",
    taskId: "",
    projectId: "",
    taskName: "",
    projectName: "",
    folderName: "",
    sprintName: ""
  },
  reducers: {
    setComment: (state, action) => {
      state.comment = action.payload.comment;
      state.sprintId = action.payload.sprintId;
      state.taskId = action.payload.taskId;
      state.projectId = action.payload.projectId;
      state.taskName = action.payload.taskName;
      state.projectName = action.payload.projectName;
      state.folderName = action.payload.folderName;
      state.sprintName = action.payload.sprintName;
      state.taskTypeImage = action.payload.taskTypeImage
    },
    setTrackerStartTime: (state, action) => {
      
      state.startTime = new Date().toISOString()
      state.trackerStart = true
      
      state.trackerID=action.payload
    },
    setTrackerStopTime: (state, action) => {
      state.stopTime = new Date().toISOString()
      state.trackerStart = false
    },
    setCaptures: (state, action) => {
      state.captures = [...state.captures,{...action.payload}]
    },
    setKeyboardClick: (state, action) => {
      if (state.trackerStart) {

        function updateTracker(dt) {
          var obj=[...state.keyboardClicks]
          
          let temp=[]
          if(dt.index==-1){
            var key=dt.key=="keyboard"?"mouse":"keyboard"
            temp=[...obj,{time:new Date().getTime(),[key]:0,[dt.key]:1}]
          }else{
            obj.map((itm,ind)=>{
              if(dt.index==ind){
                temp.push({...itm,[dt.key]:itm[dt.key]+1})
              }else{
                temp.push({...itm})
              }
            })
          }
          
          state.keyboardClicks = [...temp]
        }

        const checkTimeKeyboard = (time) => {
          const currentTime = new Date();
          const otherTime = new Date(time);
          const timeDifference = Math.abs(currentTime - otherTime);
          return timeDifference <= 60000;
        };

        const lastTime = state.keyboardClicks.length > 0 ? state.keyboardClicks[state.keyboardClicks.length - 1] : {};
        if (Object.keys(lastTime).length > 0) {
          
          const isMinute = checkTimeKeyboard(lastTime.time);
          
          if (isMinute) {
            updateTracker({ key: action.payload.key, index: state.keyboardClicks.length - 1 });
          } else {
            updateTracker({ key: action.payload.key, index: -1 });
          }
        } else {
          updateTracker({ key: action.payload.key, index: -1 });
        }
      }
      
    
      
    },
    removeExtraClicks:(state)=>{
      var obj=[...state.keyboardClicks];
      obj = obj.slice(-1);
      state.keyboardClicks = [...obj]
    },
    removeAllTimeLog: (state, action) => {
      state.comment = ""
      state.startTime = null
      state.stopTime = null
      state.captures = []
      state.keyboardClicks = []
      state.applicationDetails = []
      state.mouseClicks = []
      state.trackerStart = false
      state.trackerID = ""
      state.sprintId = "";
      state.taskId = "";
      state.projectId = "";
      state.taskName = "";
      state.projectName = "";
      state.folderName = "";
      state.sprintName = "";
    }

  },
});

export const { setComment, setTrackerStartTime, setTrackerStopTime,removeAllTimeLog,setCaptures ,setKeyboardClick,removeExtraClicks} = timeLog.actions;
export default timeLog.reducer;