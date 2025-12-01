import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  search: "",
  page: 1,
  status: "all" as "all" | "active" | "inactive",
  role: "",
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsersSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setUsersPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setUsersStatus(
      state,
      action: PayloadAction<"all" | "active" | "inactive">
    ) {
      state.status = action.payload;
    },
    setUsersRole(state, action: PayloadAction<string>) {
      state.role = action.payload;
    },
  },
});

export const { setUsersPage, setUsersRole, setUsersSearch, setUsersStatus } =
  usersSlice.actions;
export default usersSlice.reducer;
