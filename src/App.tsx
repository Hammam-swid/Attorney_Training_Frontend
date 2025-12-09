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
import ActivityTraineesPage from "./pages/ActivityTraineesPage";
import ActivityDetailsPage from "./pages/ActivityDetailsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import AddActivityPage from "./pages/AddActivityPage";
import EditActivityPage from "./pages/EditActivityPage";
import ActivityInstructorsPage from "./pages/ActivityInstructorsPage";
import SubActivitiesPage from "./pages/SubActivitiesPage";

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
      loader={() => {
        const auth = store.getState().auth;
        if (!auth.token) {
          return redirect("/login");
        }
        return null;
      }}
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
        path="activities/add"
        element={<AddActivityPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="activities/:activityId"
        element={<ActivityDetailsPage />}
        errorElement={<ErrorPage />}
      >
        <Route
          index
          element={<ActivityTraineesPage />}
          errorElement={<ErrorPage />}
        />
        <Route
          path="instructors"
          element={<ActivityInstructorsPage />}
          errorElement={<ErrorPage />}
        />
        <Route
          path="sub-activities"
          element={<SubActivitiesPage />}
          errorElement={<ErrorPage />}
        />
      </Route>
      <Route
        path="activities/:activityId/edit"
        element={<EditActivityPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="activities/:activityId/trainees"
        element={<ActivityTraineesPage />}
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
      <Route
        path="users"
        element={<UsersPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="settings"
        element={<SettingsPage />}
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
