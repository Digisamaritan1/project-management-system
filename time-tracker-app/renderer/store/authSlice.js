import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    isInitialized: false,
    isInternetLost: false,
    showOfflineQueueScreen: false,
    showOflineLogout: false,
  },
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("companyId");
    },
    initializeAuth: (state) => {
      const user = localStorage.getItem('userId');
      if (user) {
        state.isAuthenticated = true;
        // state.user = JSON.parse(user);
      }
      state.isInitialized = true;
    },
    setInternetLost: (state,action) => {
      
      state.isInternetLost = action.payload;
    },
    setShowOfflineQueueScreen: (state, action) => {
      if (action.payload) {
        state.showOfflineQueueScreen = action.payload;
      } else {
        state.showOfflineQueueScreen = action.payload;
        if (state.showOflineLogout) {
          state.isAuthenticated = false;
          localStorage.removeItem("userId");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          state.showOflineLogout = false;
        }
      }
    },
    setShowOflineLogout: (state,action) => {
      state.showOflineLogout = action.payload;
    }
  }
});

export const { login, logout, initializeAuth,setInternetLost, setShowOfflineQueueScreen,setShowOflineLogout } = authSlice.actions;
export default authSlice.reducer; 