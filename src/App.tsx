import {
  createRoutesFromElements,
  redirect,
  Route,
  RouterProvider,
} from "react-router";
import MainLayout from "./pages/MainLayout";
import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import LoginPage from "./pages/LoginPage";
import InstructorsPage from "./pages/InstructorsPage";
import TraineesPage from "./pages/TraineesPage";
import OrganizationPage from "./pages/OrganizationPage";
import AccountPage from "./pages/AccountPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReportsLayout from "./pages/ReportsLayout";
import ActivitiesReports from "./pages/Reports/Activities/ActivitiesReports";
import InstructorsReports from "./pages/Reports/Instructors/InstructorsReports";
import TraineesReports from "./pages/Reports/Trainees/TraineesReports";
import OrganizationsReports from "./pages/Reports/Organizations/OrganizationsReports";
import ActivitiesLayout from "./pages/Reports/Activities/ActivitiesLayout";
import OneActivity from "./pages/Reports/Activities/OneActivity";
import OrganizationsLayout from "./pages/Reports/Organizations/OrganizationsLayout";
import OrganizationActivities from "./pages/Reports/Organizations/OrganizationActivities";
import InstructorsLayout from "./pages/Reports/Instructors/InstructorsLayout";
import InstructorActivities from "./pages/Reports/Instructors/InstructorActivities";
import TraineesLayout from "./pages/Reports/Trainees/TraineesLayout";
import TraineeActivity from "./pages/Reports/Trainees/TraineeActivity";
import ErrorPage from "./pages/ErrorPage";
import { store } from "./store";
// import axios, { AxiosError } from "axios";
// import { logout, setToken, setUser } from "./store/authSlice";
// import toast from "react-hot-toast";
// import { setAlert } from "./store/alertSlice";

const routes = createRoutesFromElements(
  <>
    <Route
      path="/login"
      loader={loginLoader}
      element={<LoginPage />}
      errorElement={<ErrorPage />}
    />
    <Route
      path="/"
      // loader={async () => {
      //   const { user } = store.getState().auth;
      //   if (!user) return null;
      //   try {
      //     const res = await axios.post("/api/v1/users/refresh-access-token");
      //     if (res.status == 200) {
      //       store.dispatch(setToken(res.data.data.token));
      //       store.dispatch(setUser(res.data.data.user));
      //     }
      //     return null;
      //   } catch (error) {
      //     console.log(error);
      //     if (error instanceof AxiosError && error?.response?.status === 403) {
      //       await axios.post("/api/v1/users/logout");
      //       store.dispatch(logout());
      //       toast.error(
      //         "تمت صلاحية الجلسة، الرجاء محاولة تسجيل الدخول مرة أخرى"
      //       );
      //       return redirect("/login");
      //     }
      //   }
      //   return null;
      // }}
      element={<MainLayout />}
      errorElement={<ErrorPage />}
    >
      <Route index element={<DashboardPage />} errorElement={<ErrorPage />} />
      <Route
        path="activities"
        element={<ActivitiesPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="instructors"
        element={<InstructorsPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="trainees"
        element={<TraineesPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="organizations"
        element={<OrganizationPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="account"
        element={<AccountPage />}
        errorElement={<ErrorPage />}
      />
      <Route path="reports" element={<ReportsLayout />}>
        <Route
          path="activities"
          element={<ActivitiesLayout />}
          errorElement={<ErrorPage />}
        >
          <Route
            index
            element={<ActivitiesReports />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="one-activity"
            element={<OneActivity />}
            errorElement={<ErrorPage />}
          />
        </Route>

        <Route
          path="instructors"
          element={<InstructorsLayout />}
          errorElement={<ErrorPage />}
        >
          <Route
            index
            element={<InstructorsReports />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="instructor-activities"
            element={<InstructorActivities />}
            errorElement={<ErrorPage />}
          />
        </Route>

        <Route
          path="organizations"
          element={<OrganizationsLayout />}
          errorElement={<ErrorPage />}
        >
          <Route
            index
            element={<OrganizationsReports />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="organization-activities"
            element={<OrganizationActivities />}
            errorElement={<ErrorPage />}
          />
        </Route>

        <Route
          path="trainees"
          element={<TraineesLayout />}
          errorElement={<ErrorPage />}
        >
          <Route
            index
            element={<TraineesReports />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="trainee-activities"
            element={<TraineeActivity />}
            errorElement={<ErrorPage />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </>
);

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}
function loginLoader() {
  const auth = store.getState().auth;
  if (auth.token) {
    return redirect("/");
  }
  return null;
}

export default App;
