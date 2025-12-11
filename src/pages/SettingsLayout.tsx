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
];
export default function SettingsLayout() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <NavBar links={links} />
      <Outlet />
    </div>
  );
}
