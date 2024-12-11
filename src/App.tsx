import { createRoutesFromElements, Route, RouterProvider } from "react-router";
import MainLayout from "./pages/MainLayout";
import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";

const routes = createRoutesFromElements(
  <>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="activities" element={<div>Activities</div>} />
    </Route>
  </>
);

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
