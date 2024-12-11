import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";

export default function MainLayout() {
  const links = [
    {
      label: "الرئيسية",
      to: "/",
      icon: Home,
    },
    {
      label: "النشاطات التدريبية",
      to: "/activities",
    },
    {
      label: "المعلومات الشخصية",
      to: "/profile",
    },
  ];
  return (
    <SidebarProvider>
      <Sidebar side="right" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>النشاطات التدريبية</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => (
                  <SidebarMenuItem key={link.label}>
                    <SidebarMenuButton asChild>
                      <Link to={link.to}>
                        {link.icon && <link.icon />}
                        <span>{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger />
      <Outlet />
    </SidebarProvider>
  );
}
