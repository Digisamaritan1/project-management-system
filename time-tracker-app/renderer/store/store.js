import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user';
import authReducer from './authSlice';
import companyReducer from './companySlice';
import timelogReducer from './timelog';
import projectReducer from './projectSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    company: companyReducer,
    timeLog: timelogReducer,
    project: projectReducer
  },
});

export default store;