import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import AuthProvider from "@/auth/AuthProvider";
import ChangePasswordAlert from "@/components/ChangePasswordAlert";
import { useQueryClient } from "@tanstack/react-query";

export default function MainLayout() {
  const theme = useAppSelector((state) => state.theme);
  const alert = useAppSelector((state) => state.alert);
  const queryClient = useQueryClient();
  useEffect(() => {
    const root = document.documentElement;
    if (theme.darkMode) {
      root?.classList.add("dark");
    } else {
      root?.classList.remove("dark");
    }
  }, [theme]);
  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        queryClient.invalidateQueries();
      }
    });
  }, []);
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        <Outlet />
        {alert.isAlert && <ChangePasswordAlert />}
      </SidebarProvider>
      {/* <Logo /> */}
    </AuthProvider>
  );
}

// function Logo() {
//   return (
//     <div className="absolute inset-0 p-2 z-50 flex items-center justify-center pointer-events-none">
//       <img src="/small-logo.svg" alt="logo" className="h-full opacity-10" />
//     </div>
//   );
// }
