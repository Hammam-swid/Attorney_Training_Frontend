import { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";

interface props {
  children: ReactNode;
  title: string;
  mutationKey: any;
  mutationFn?: () => Promise<any>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}
export default function ConfirmModal({
  children,
  title,
  mutationKey,
  mutationFn,
  onError,
  onSuccess,
}: props) {
  const { mutateAsync, isPending } = useMutation({
    mutationKey,
    mutationFn,
    onSuccess,
    onError,
  });
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-end gap-4 mt-4">
          <DialogClose asChild>
            <Button variant={"outline"}>إلغاء</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              disabled={isPending}
              onClick={async () => await mutateAsync()}
            >
              تأكيد
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
