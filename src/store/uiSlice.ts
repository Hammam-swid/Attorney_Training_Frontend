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
    removeType: (state, action: PayloadAction<ActivityType>) => {
      state.activityTypes = state.activityTypes.filter(
        (type) => type.id !== action.payload.id
      );
    },
    addType: (state, action: PayloadAction<ActivityType>) => {
      state.activityTypes.push(action.payload);
    },
    updateType: (state, action: PayloadAction<ActivityType>) => {
      state.activityTypes = state.activityTypes.map((type) =>
        type.id === action.payload.id ? action.payload : type
      );
    },
  },
});

export const { setActivityTypes, addType, removeType, updateType } =
  uiSlice.actions;
export default uiSlice.reducer;
