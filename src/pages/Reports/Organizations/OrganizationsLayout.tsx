import { Outlet } from "react-router";
import { NavLink } from "react-router-dom";

const links = [
  { to: ".", label: "كافة الجهات" },
  { to: "organization-activities", label: "الأنشطة الخاصة بالجهات" },
];

export default function OrganizationsLayout() {
  return (
    <div>
      <div>
        <nav className="mb-8">
          <ul className="flex gap-4">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  className={({ isActive }) =>
                    `p-2 rounded-md flex items-center justify-center gap-2 hover:bg-secondary hover:text-primary dark:hover:text-primary ${
                      isActive
                        ? "text-primary bg-secondary font-bold underline"
                        : "text-gray-400 dark:text-muted"
                    }`
                  }
                  to={link.to}
                  end
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
