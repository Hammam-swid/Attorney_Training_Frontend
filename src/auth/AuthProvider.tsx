import { logout, setToken, setUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import axios, { AxiosError } from "axios";
import { useLayoutEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "@/lib/api";

// export function useAuth() {}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // useLayoutEffect(() => {
  //   const refreshToken = async () => {
  //     try {
  //       const res = await api.post("/api/v1/users/refresh-access-token");
  //       if (res.status == 200) {
  //         dispatch(setToken(res.data.data.token));
  //         dispatch(setUser(res.data.data.user));
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       if (error instanceof AxiosError && error?.response?.status === 403) {
  //         await api.post("/api/v1/users/logout");
  //         dispatch(logout());
  //         navigate("/login");
  //         toast.error(
  //           "انتهت صلاحية الجلسة، الرجاء محاولة تسجيل الدخول مرة أخرى"
  //         );
  //       }
  //     }
  //   };
  //   refreshToken();
  // }, [dispatch, navigate]);

  // useLayoutEffect(() => {
  //   const refreshInterceptors = api.interceptors.response.use(
  //     (response) => response,
  //     async (error) => {
  //       const originalRequest = error.config;
  //       if (error.response.status === 401 && !originalRequest._retry) {
  //         try {
  //           const res = await api.post("/api/v1/users/refresh-access-token");
  //           if (res.status == 200) {
  //             dispatch(setToken(res.data.data.token));
  //             dispatch(setUser(res.data.data.user));
  //             originalRequest._retry = true;
  //             originalRequest.headers.Authorization = `Bearer ${res.data.data.token}`;
  //             return axios(originalRequest);
  //           }
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       } else if (error.response.status === 403) {
  //         dispatch(logout());
  //         navigate("/login");
  //         toast.error("تمت صلاحية الجلسة، الرجاء محاولة تسجيل الدخول مرة أخرى");
  //       }
  //       return Promise.reject(error);
  //     }
  //   );
  //   return () => {
  //     api.interceptors.response.eject(refreshInterceptors);
  //   };
  // }, [token, dispatch, navigate]);
  return <>{children}</>;
}
