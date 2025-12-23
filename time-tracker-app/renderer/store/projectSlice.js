import { createSlice } from '@reduxjs/toolkit';

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    allProjects: [],
    filteredProjects: [],
    isLoading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {
    setAllProjects: (state, action) => {
      state.allProjects = action.payload;
      state.lastFetched = Date.now();
    },
    setFilteredProjects: (state, action) => {
      state.filteredProjects = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearProjects: (state) => {
      state.allProjects = [];
      state.filteredProjects = [];
      state.lastFetched = null;
      state.error = null;
    },
  },
});

export const { 
  setAllProjects, 
  setFilteredProjects, 
  setLoading, 
  setError, 
  clearProjects 
} = projectSlice.actions;

export default projectSlice.reducer; 