import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  page: 1,
  search: "",
  dateType: "year" as "year" | "date",
  status: "الكل" as string,
  year: undefined as number | undefined,
  date: {
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  },
};

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    setActivitiesPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setActivitiesSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    setActivitiesStatus: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
      state.page = 1;
    },
    setActivitiesYear: (state, action: PayloadAction<number | undefined>) => {
      state.year = action.payload;
      state.page = 1;
    },
    setActivitiesDateType: (state, action: PayloadAction<"year" | "date">) => {
      state.dateType = action.payload;
      if (action.payload === "year") {
        state.date.startDate = undefined;
        state.date.endDate = undefined;
      } else {
        state.year = undefined;
      }
      state.page = 1;
    },
    setActivitiesStartDate: (
      state,
      action: PayloadAction<Date | undefined>
    ) => {
      state.date.startDate = action.payload;
      state.page = 1;
    },
    setActivitiesEndDate: (state, action: PayloadAction<Date | undefined>) => {
      state.date.endDate = action.payload;
      state.page = 1;
    },
  },
});

export const {
  setActivitiesPage,
  setActivitiesSearch,
  setActivitiesStatus,
  setActivitiesYear,
  setActivitiesStartDate,
  setActivitiesEndDate,
  setActivitiesDateType,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
