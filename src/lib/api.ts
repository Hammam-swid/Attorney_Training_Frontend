import { store } from "@/store";
import axios from "axios";
import toast from "react-hot-toast";
import { redirect } from "react-router";

const api = axios.create({
  baseURL: "http://localhost:5000", //"https://attorney-training-api.com.ly",
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  config.headers.Authorization = token
    ? `Bearer ${token}`
    : config.headers.Authorization;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      store.dispatch({ type: "auth/logout" });
      redirect("/login");
    } else if (error.response.status === 403) {
      store.dispatch({ type: "auth/logout" });
      redirect("/login");
      toast.error("تمت صلاحية الجلسة، الرجاء محاولة تسجيل الدخول مرة أخرى");
    }
    return Promise.reject(error);
  }
);

export default api;
