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

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </>
);

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
