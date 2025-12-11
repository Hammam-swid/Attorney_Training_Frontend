import { useFormik } from "formik";
import { ActivityType } from "@/types";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Book,
  BookOpen,
  BriefcaseBusiness,
  MessageCircle,
  MessageSquare,
  NotepadText,
  Save,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ReactNode, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityTypeService,
  AddFormValues,
} from "@/services/actvitiy-type.service";

interface Props {
  type: ActivityType;
  children: ReactNode;
}

const icons = [
  {
    name: "notepad-text",
    Icon: NotepadText,
  },
  {
    name: "book-open",
    Icon: BookOpen,
  },
  {
    name: "briefcase-business",
    Icon: BriefcaseBusiness,
  },
  {
    name: "message-circle",
    Icon: MessageCircle,
  },
  {
    name: "message-square",
    Icon: MessageSquare,
  },
  {
    name: "book",
    Icon: Book,
  },
];

const yesOrNo = [
  {
    label: "نعم",
    value: true,
  },
  {
    label: "لا",
    value: false,
  },
];

export default function EditTypeModal({ type, children }: Props) {
  const { formik, open, setOpen, isPending } = useEditTypeModal(type);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">تعديل نوع نشاط</DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              placeholder="أدخل اسم نوع النشاط التدريبي"
              value={formik.values.name}
              onChange={formik.handleChange}
            />

            <Label htmlFor="iconName">مسمى المدرب</Label>
            <Input
              id="instructorName"
              name="instructorName"
              placeholder="المدرب/المدربون"
              value={formik.values.instructorName}
              onChange={formik.handleChange}
            />
            <Label htmlFor="iconName">مسمى المتدرب</Label>
            <Input
              id="traineeName"
              name="traineeName"
              placeholder="المتدرب/المتدربون"
              value={formik.values.traineeName}
              onChange={formik.handleChange}
            />
            <Label htmlFor="isHaveRating">هل يمكن تقييم المدرب</Label>
            <div className="flex items-center gap-2">
              {yesOrNo.map((choice, index) => (
                <span
                  key={index}
                  className={`px-6 py-1 rounded-full text-primary-foreground cursor-pointer ${
                    formik.values.isHaveRating === choice.value
                      ? "bg-primary font-bold"
                      : "bg-primary/50"
                  }`}
                  onClick={() =>
                    formik.setFieldValue("isHaveRating", choice.value)
                  }
                >
                  {choice.label}
                </span>
              ))}
            </div>
            <Label htmlFor="iconName">أيقونة النوع</Label>
            <div className="flex gap-2">
              {icons.map((icon, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => formik.setFieldValue("iconName", icon.name)}
                >
                  <span
                    className={`rounded-md p-2 ${
                      formik.values.iconName === icon.name
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-500"
                    }`}
                  >
                    <icon.Icon />
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-row-reverse gap-2 mt-6">
              <Button disabled={isPending} type="submit">
                <span>حفظ</span>
                <Save />
              </Button>
              <DialogClose>
                <Button
                  type="button"
                  className="hover:text-destructive"
                  variant={"outline"}
                >
                  <span>إلغاء</span>
                  <X />
                </Button>
              </DialogClose>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const useEditTypeModal = (type: ActivityType) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["update", "activity-type", type.id],
    mutationFn: (data: AddFormValues) =>
      ActivityTypeService.updateActivityType(type.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["activity-types"],
      });
      toast.success("تم تعديل النوع بنجاح");
      setOpen(false);
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError ? error.response?.data?.message : null;
      toast.error(message || "حدث خطأ ما");
    },
  });
  const formik = useFormik({
    initialValues: {
      name: type.name,
      iconName: type.iconName,
      isHaveRating: type.isHaveRating,
      instructorName: type.instructorName,
      traineeName: type.traineeName,
    },
    onSubmit: async (values) => {
      await mutateAsync(values);
    },
  });

  return {
    open,
    setOpen,
    formik,
    isPending,
  };
};
