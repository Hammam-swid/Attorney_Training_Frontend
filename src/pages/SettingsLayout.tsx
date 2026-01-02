import NavBar from "@/components/common/NavBar";
import { roleChecker } from "@/lib/roleChecker";
import { useAppSelector } from "@/store/hooks";
import { Role } from "@/types";
import { Outlet } from "react-router-dom";

const links = [
  {
    to: ".",
    label: "أنواع الأنشطة",
    allow: ["admin"] as Role[],
  },
  {
    to: "activity-domains",
    label: "مجالات التدريب",
    allow: ["admin"] as Role[],
  },
  {
    to: "trainee-types",
    label: "أنواع المتدربين",
    allow: ["admin"] as Role[],
  },
  {
    to: "account",
    label: "الحساب",
  },
];
export default function SettingsLayout() {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <div className="container mx-auto px-3 py-6 space-y-6">
      <NavBar
        links={links.filter(
          (link) => !link.allow || roleChecker(user, ...link.allow)
        )}
      />
      <Outlet />
    </div>
  );
}
