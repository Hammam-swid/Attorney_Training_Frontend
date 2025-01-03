import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Building, Home, LogOut, Settings, Users, Users2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
// import { createLucideIcon } from "lucide-react";
import axios from "axios";
import Icon from "./ui/Icon";
import { ActivityType } from "@/types";
import dynamicIconImports from "lucide-react/dynamicIconImports";

interface NavLink {
  label: string;
  to: string;
  iconName?: string;
}

type IconName = keyof typeof dynamicIconImports;

export default function AppSidebar() {
  const { pathname, search } = useLocation();
  console.log(search);
  const { open } = useSidebar();
  const [actLinks, setActLinks] = useState<NavLink[]>([]);
  useEffect(() => {
    const getActionLinks = async () => {
      try {
        const res = await axios.get<{ data: { types: ActivityType[] } }>(
          "/api/v1/activity-types"
        );
        // console.log(res?.data.data.types);
        if (res.status === 200) {
          setActLinks(
            res?.data.data.types.map((type) => ({
              label: type.name,
              to: `/activities?type=${type.id}`,
              iconName: type.iconName,
            }))
          );
        }
      } catch (err) {
        console.log(err);
      }
    };
    getActionLinks();
  }, []);
  const links = [
    {
      label: "الرئيسية",
      to: "/",
      icon: Home,
    },
  ];

  const peopleLinks = [
    { label: "المدربون", to: "/instructors", icon: Users2 },
    { label: "المتدربون", to: "/trainees", icon: Users },
  ];

  const organizationLinks = [
    { label: "الجهات المختصة", to: "/organizations", icon: Building },
  ];
  // createLucideIcon("notepad-text");

  return (
    <Sidebar side="right" collapsible="icon">
      {open && (
        <SidebarHeader className="font-bold">إدارة المتدربين</SidebarHeader>
      )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname + search === link.to}
                  >
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
        {/* مجموعة الأنشطة التدريبية */}
        <SidebarGroup>
          <SidebarGroupLabel>الأنشطة التدريبية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actLinks.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname + search === link.to}
                    className="transition-colors"
                  >
                    <Link to={link.to}>
                      {/* {link.iconName && <i date-lucide={link.iconName}></i>} */}
                      <Icon name={(link.iconName as IconName) || "notepad-text"} />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* مجموعة الموارد البشرية */}
        <SidebarGroup>
          <SidebarGroupLabel>الموارد البشرية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {peopleLinks.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname + search === link.to}
                    className="transition-colors"
                  >
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
        {/* مجموعة الجهات المختصة */}
        <SidebarGroup>
          <SidebarGroupLabel>الجهات المختصة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationLinks.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname + search === link.to}
                    className="transition-colors"
                  >
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
        {/* مجموعة الإعدادات */}
        <SidebarGroup>
          <SidebarGroupLabel>الإعدادات</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname + search === "/settings"}
                >
                  <Link to="/settings">
                    <Settings />
                    <span>الإعدادات</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="hover:bg-red-500 wf">
          {open && <span>تسجيل الخروج</span>}
          <LogOut />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
