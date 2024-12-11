import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BriefcaseBusiness, Home, NotepadText } from "lucide-react";
import { Link } from "react-router-dom";
// import { createLucideIcon } from "lucide-react";

export default function AppSidebar() {
  const links = [
    {
      label: "الرئيسية",
      to: "/",
      icon: Home,
    },
  ];

  const actLinks = [
    {
      label: "الدورات التدريبية",
      to: "/activities?type=1",
      icon: NotepadText,
      iconName: "notepad-text",
    },
    {
      label: "ورش العمل",
      to: "/activities?type=2",
      icon: BriefcaseBusiness,
    },
  ];

  // createLucideIcon("notepad-text");

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="font-bold">إدارة المتدربين</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>الرئيسية</SidebarGroupLabel>
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
        <SidebarGroup>
          <SidebarGroupLabel>الأنشطة التدريبية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actLinks.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton asChild>
                    <Link to={link.to}>
                      {link.icon && <link.icon />}
                      {/* {link.iconName && <i date-lucide={link.iconName}></i>} */}
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
  );
}
