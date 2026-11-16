import { store } from "@/store";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

const baseURL = "http://localhost:5000"; //"https://attorney-training-api.com.ly",

const api = axios.create({
  baseURL,
  // the refresh token travels in an httpOnly cookie
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  config.headers.Authorization = token
    ? `Bearer ${token}`
    : config.headers.Authorization;
  return config;
});

// ---------------------------------------------------------------------------
// The access token expires (1 hour by default). On a 401 the token is renewed
// once with the refresh cookie and the request is replayed; only when that
// fails the user is sent back to the login page.
// ---------------------------------------------------------------------------

const AUTH_PATHS = ["/api/v1/users/login", "/api/v1/users/refresh-access-token"];

let refreshing: Promise<string | null> | null = null;

const refreshAccessToken = () => {
  // one refresh at a time, shared by all the requests that failed together
  refreshing ??= axios
    .post(`${baseURL}/api/v1/users/refresh-access-token`, {}, { withCredentials: true })
    .then((res) => {
      const { token, user } = res.data.data;
      store.dispatch({ type: "auth/setToken", payload: token });
      if (user) store.dispatch({ type: "auth/setUser", payload: user });
      return token as string;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

const goToLogin = () => {
  store.dispatch({ type: "auth/logout" });
  if (window.location.pathname !== "/login") window.location.assign("/login");
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const isAuthCall = AUTH_PATHS.some((p) => original?.url?.includes(p));

    if (status === 401 && original && !isAuthCall) {
      if (!original._retried) {
        original._retried = true;
        const token = await refreshAccessToken();
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      }
      toast.error("انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى");
      goToLogin();
    } else if (status === 403) {
      // not allowed: the user stays logged in
      toast.error(
        (error.response?.data as { message?: string })?.message ||
          "ليس لديك صلاحية للقيام بهذا الإجراء",
      );
    }
    return Promise.reject(error);
  },
);

export default api;
