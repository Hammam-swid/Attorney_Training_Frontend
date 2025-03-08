import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import themeReducer from "./themeSlice";
import uiReducer from "./uiSlice";
import alertReducer from "./alertSlice";

export const store = configureStore({
  reducer: {
    // Add your reducers here
    auth: authReducer,
    theme: themeReducer,
    ui: uiReducer,
    alert: alertReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
