import { ActivityType } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  activityTypes: ActivityType[];
}

const initialState: UiState = {
  activityTypes: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActivityTypes: (state, action: PayloadAction<ActivityType[]>) => {
      state.activityTypes = action.payload;
    },
  },
});

export const { setActivityTypes } = uiSlice.actions;
export default uiSlice.reducer;
