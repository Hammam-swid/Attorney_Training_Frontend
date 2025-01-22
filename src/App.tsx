import { createRoutesFromElements, Route, RouterProvider } from "react-router";
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

const routes = createRoutesFromElements(
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<MainLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="instructors" element={<InstructorsPage />} />
      <Route path="trainees" element={<TraineesPage />} />
      <Route path="organizations" element={<OrganizationPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="reports" element={<ReportsLayout />}>
        <Route path="activities" element={<ActivitiesLayout />}>
          <Route index element={<ActivitiesReports />} />
          <Route path="one-activity" element={<OneActivity />} />
        </Route>

        <Route path="instructors" element={<InstructorsLayout />}>
          <Route index element={<InstructorsReports />} />
          <Route
            path="instructor-activities"
            element={<InstructorActivities />}
          />
        </Route>

        <Route path="organizations" element={<OrganizationsLayout />}>
          <Route index element={<OrganizationsReports />} />
          <Route
            path="organization-activities"
            element={<OrganizationActivities />}
          />
        </Route>

        <Route path="trainees" element={<TraineesLayout />}>
          <Route index element={<TraineesReports />} />
          <Route path="trainee-activities" element={<TraineeActivity />} />
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

export default App;
