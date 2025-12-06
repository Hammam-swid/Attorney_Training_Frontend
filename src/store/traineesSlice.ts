import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  page: 1,
  search: "",
};

const traineesSlice = createSlice({
  name: "trainees",
  initialState,
  reducers: {
    setTraineesPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setTraineesSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});

export const { setTraineesPage, setTraineesSearch } = traineesSlice.actions;

export default traineesSlice.reducer;
