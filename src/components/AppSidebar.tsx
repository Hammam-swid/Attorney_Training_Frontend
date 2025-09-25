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
  Building,
  ChevronsUpDown,
  Files,
  Home,
  LogOut,
  User,
  Users,
  Users2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
// import { createLucideIcon } from "lucide-react";
import Icon from "./ui/Icon";
import { ActivityType } from "@/types";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActivityTypes } from "@/store/uiSlice";
import { logout } from "@/store/authSlice";
import toast from "react-hot-toast";
import api from "@/lib/api";

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
  const ui = useAppSelector((state) => state.ui);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const actLinks: NavLink[] = ui.activityTypes.map((type) => ({
    label: type.name,
    to: `/activities?type=${type.id}`,
    iconName: type.iconName,
  }));
  useEffect(() => {
    const getActionLinks = async () => {
      try {
        const res = await api.get<{ data: { types: ActivityType[] } }>(
          "/api/v1/activity-types"
        );
        // console.log(res?.data.data.types);
        if (res.status === 200) {
          dispatch(setActivityTypes(res?.data.data.types));
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

  // const user = { name: "همام سويد", avatar: "", email: "hmam.swid@gmail.com" };
  const navigate = useNavigate();

  const logoutHandle = async () => {
    try {
      const res = await api.post("/api/v1/users/logout");
      if (res.status === 200) {
        toast.success("تم تسجيل الخروج بنجاح");
        setTimeout(() => {
          dispatch(logout());
          navigate("/login");
        }, 1000);
      }
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };
  return (
    <Sidebar side="right" collapsible="icon">
      {open && (
        <SidebarHeader className="font-bold">إدارة التدريب</SidebarHeader>
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
                      <Icon
                        name={(link.iconName as IconName) || "notepad-text"}
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
        {/* مجموعة التقارير */}
        <SidebarGroup>
          <SidebarGroupLabel>التقارير</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={(pathname + search).includes("/reports")}
                >
                  <Link to="/reports">
                    <Files />
                    <span>التقارير</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger className="w-full">
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    {/* <AvatarImage src={user?.avatar} alt={user?.fullName} /> */}
                    <AvatarFallback className="rounded-lg">
                      {user?.fullName
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.fullName}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                // side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {user?.fullName
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.fullName}
                      </span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link className="w-full h-full flex gap-2" to={"/account"}>
                      <User />
                      الحساب
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={logoutHandle}
                >
                  <LogOut />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <Button className="hover:bg-red-500 wf">
          {open && <span>تسجيل الخروج</span>}
          <LogOut />
        </Button> */}
      </SidebarFooter>
    </Sidebar>
  );
}
