import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { User } from "@/types";

interface ToggleUserStatusProps {
  children: ReactNode;
  user: User;
}

export default function ToggleUserStatus({ children }: ToggleUserStatusProps) {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  );
}
