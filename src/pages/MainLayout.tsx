import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <ToastContainer
        position="top-right"
        rtl={true}
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <Outlet />
    </SidebarProvider>
  );
}
