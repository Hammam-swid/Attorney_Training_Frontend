import { BookOpen, Building, User2, Users } from "lucide-react";
import { Helmet } from "react-helmet";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "activities", label: "الأنشطة التدريبية", icon: BookOpen },
  { to: "instructors", label: "المدربون", icon: User2 },
  { to: "trainees", label: "المتدربون", icon: Users },
  { to: "organizations", label: "الجهات المختصة", icon: Building },
];

export default function ReportsLayout() {
  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>إدارة المتدربين | التقارير</title>
        <meta
          name="description"
          content="إنشاء التقارير الخاصة بالأنشطة التدريبية"
        />
      </Helmet>
      <nav className="mb-8">
        <ul className="flex gap-4">
          {links.map((link) => (
            <li className="w-full shadow-sm">
              <NavLink
                className={({ isActive }) =>
                  `p-2 rounded-md text-lg flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-secondary"
                  }`
                }
                to={link.to}
              >
                <span>{link.label}</span>
                <link.icon size={"18"} />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
