import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface INavBar {
  links: {
    to: string;
    label: string;
    allow?: string[];
    icon?: ReactNode;
  }[];
}

export default function NavBar({ links }: INavBar) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 p-3">
        <span></span>
        {links.map((link, i) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                `py-2 px-8 rounded-md transition-all flex items-center gap-2`,
                "hover:bg-primary/70 hover:font-semibold",
                isActive && "bg-primary font-bold text-white"
              )
            }
            end
            key={i}
            to={link.to}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </CardHeader>
    </Card>
  );
}
