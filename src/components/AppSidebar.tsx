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
import {
  BriefcaseBusiness,
  Home,
  LogOut,
  NotepadText,
  Users,
  Users2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
// import { createLucideIcon } from "lucide-react";
import axios from "axios";
import Icon from "./ui/Icon";

export default function AppSidebar() {
  const { pathname, search } = useLocation();
  console.log(search);
  const { open } = useSidebar();
  const [actLinks, setActLinks] = useState([]);
  useEffect(() => {
    const getActionLinks = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/activity-types"
        );
        console.log(res?.data.data.types);
        if (res.status === 200) {
          setActLinks(
            res?.data.data.types.map((type) => ({
              label: type.name,
              to: `/activities?type=${type.id}&name=${type.name}`,
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

  // const actLinks = [
  //   {
  //     label: "الدورات التدريبية",
  //     to: "/activities?type=1",
  //     icon: NotepadText,
  //     iconName: "notepad-text",
  //   },
  //   {
  //     label: "ورش العمل",
  //     to: "/activities?type=2",
  //     icon: BriefcaseBusiness,
  //   },
  // ];

  const peopleLinks = [
    { label: "المدربون", to: "/instructors", icon: Users2 },
    { label: "المتدربين", to: "/trainees", icon: Users },
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
              {actLinks.map((link, index) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname + search === link.to}
                    className="transition-colors"
                  >
                    <Link to={link.to}>
                      {link.icon && <link.icon />}
                      {/* {link.iconName && <i date-lucide={link.iconName}></i>} */}
                      <Icon
                        name={
                          index === 0 ? "notepad-text" : "briefcase-business"
                        }
                      />
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
      </SidebarContent>
      <SidebarFooter>
        <Button className="hover:bg-red-500">
          {open && <span>تسجيل الخروج</span>}
          <LogOut />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
