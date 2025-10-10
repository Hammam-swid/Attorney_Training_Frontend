import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { setCookie, getCookie, deleteCookie } from "cookies-next";

interface State {
  user: User | null;
  token: string | null;
}

const userCookie = getCookie("user");

const initialState: State = {
  user: userCookie ? (JSON.parse(userCookie as string) as User) : null,
  token: (getCookie("token") as string) || null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      setCookie("user", action.payload);
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      setCookie("token", action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      deleteCookie("token");
      deleteCookie("user");
    },
  },
});

export const { setUser, setToken, logout } = authSlice.actions;

export default authSlice.reducer;
