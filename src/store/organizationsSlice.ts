import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  page: 1,
};

const organizationsSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganizationSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setOrganizationPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
});

export const { setOrganizationPage, setOrganizationSearch } =
  organizationsSlice.actions;
export default organizationsSlice.reducer;
