import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AlertState {
  isAlert: boolean;
}
const localAlertString = localStorage.getItem("alert");
const localAlert = localAlertString ? JSON.parse(localAlertString) : false;

const initialState: AlertState = {
  isAlert: localAlert,
};
const alertSlice = createSlice({
  initialState,
  name: "alert",
  reducers: {
    setAlert: (state, action: PayloadAction<boolean>) => {
      state.isAlert = action.payload;
      localStorage.setItem("alert", JSON.stringify(action.payload));
    },
  },
});

export const { setAlert } = alertSlice.actions;

export default alertSlice.reducer;
