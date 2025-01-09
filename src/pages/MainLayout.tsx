import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";

export default function MainLayout() {
  const theme = useAppSelector((state) => state.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme.darkMode) {
      root?.classList.add("dark");
    } else {
      root?.classList.remove("dark");
    }
  }, [theme]);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger  />
      <Toaster position="bottom-center" />
      <Outlet />
    </SidebarProvider>
  );
}
