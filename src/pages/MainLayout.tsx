import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <Toaster position="bottom-center" />
      <Outlet />
    </SidebarProvider>
  );
}
