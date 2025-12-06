import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import themeReducer from "./themeSlice";
import uiReducer from "./uiSlice";
import alertReducer from "./alertSlice";
import usersReducer from "./usersSlice";
import organizationsReducer from "./organizationsSlice";
import traineesReducer from "./traineesSlice";
import activitiesReducer from "./activitiesSlice";

export const store = configureStore({
  reducer: {
    // Add your reducers here
    auth: authReducer,
    theme: themeReducer,
    ui: uiReducer,
    alert: alertReducer,
    users: usersReducer,
    organizations: organizationsReducer,
    trainees: traineesReducer,
    activities: activitiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
