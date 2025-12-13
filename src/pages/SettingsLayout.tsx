import NavBar from "@/components/common/NavBar";
import { Outlet } from "react-router-dom";

const links = [
  {
    to: ".",
    label: "أنواع الأنشطة",
  },
  {
    to: "trainee-types",
    label: "أنواع المتدربين",
  },
  {
    to: "account",
    label: "الحساب",
  },
];
export default function SettingsLayout() {
  return (
    <div className="container mx-auto px-3 py-6 space-y-6">
      <NavBar links={links} />
      <Outlet />
    </div>
  );
}
