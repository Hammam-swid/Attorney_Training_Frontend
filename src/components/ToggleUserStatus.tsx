import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "@/services/users.service";

interface ToggleUserStatusProps {
  children: ReactNode;
  user: User;
}

export default function ToggleUserStatus({
  children,
  user,
}: ToggleUserStatusProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: boolean) =>
      UsersService.toggleUserStatus(user.id, newStatus),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
  });

  const handleConfirm = () => {
    const newStatus = !user.isActive;
    toggleStatusMutation.mutate(newStatus);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)}>{children}</DialogTrigger>
      <DialogContent className="space-y-6">
        <h2 className="text-lg font-semibold">
          هل أنت متأكد أنك تريد {user.isActive ? "إلغاء تفعيل" : "تفعيل"}{" "}
          المستخدم <span className="font-bold">{user.fullName}</span>؟
        </h2>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={toggleStatusMutation.isPending}
          >
            {toggleStatusMutation.isPending ? "جاري التنفيذ..." : "تأكيد"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
