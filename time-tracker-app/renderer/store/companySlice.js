// store/companySlice.js
import { createSlice } from '@reduxjs/toolkit';

const companySlice = createSlice({
  name: 'company',
  initialState: {
    assignCompany: [],
    currentCompany: null,
    companyUser: {},
    settings: {},
    rules: [],
    // Add any new fields here
  },
  reducers: {
    setAssignCompany: (state, action) => {
      state.assignCompany = action.payload;
    },
    setCurrentCompany: (state, action) => {
      state.currentCompany = action.payload;
    },
    setCompanyUser: (state, action) => {
      state.companyUser = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    setRules: (state, action) => {
      state.rules = action.payload;
    },
    // Add any new reducers here
  },
});

export const { setAssignCompany, setCurrentCompany, setCompanyUser, setSettings, setRules } = companySlice.actions;
export default companySlice.reducer;