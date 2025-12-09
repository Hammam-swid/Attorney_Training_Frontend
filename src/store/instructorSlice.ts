import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InstructorState {
  page: number;
  searchQuery: string;
}

const initialState: InstructorState = {
  page: 1,
  searchQuery: "",
};

const instructorSlice = createSlice({
  name: "instructors",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      //   state.page = 1;
    },
  },
});

export const { setPage, setSearchQuery } = instructorSlice.actions;
export default instructorSlice.reducer;
