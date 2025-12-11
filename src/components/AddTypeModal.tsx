import { useFormik } from "formik";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActivityTypeService } from "@/services/actvitiy-type.service";
import { useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";

interface Props {
  children: React.ReactNode;
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

interface FormValues {
  name: string;
  iconName: string;
  isHaveRating: boolean | null;
  instructorName: string;
  traineeName: string;
}

export default function AddTypeModal({ children }: Props) {
  const { formik, isPending, open, setOpen } = useTypeForm();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">إضافة نوع نشاط جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              placeholder="أدخل اسم نوع النشاط التدريبي"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.name && formik.touched.name && (
              <span className="text-destructive text-xs">
                {formik.errors.name}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="iconName">مسمى المدرب</Label>
            <Input
              id="instructorName"
              name="instructorName"
              placeholder="المدرب/المدربون"
              value={formik.values.instructorName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.instructorName && formik.touched.instructorName && (
              <span className="text-destructive text-xs">
                {formik.errors.instructorName}
              </span>
            )}
          </div>
          <div>
            <Label htmlFor="iconName">مسمى المتدرب</Label>
            <Input
              id="traineeName"
              name="traineeName"
              placeholder="المتدرب/المتدربون"
              value={formik.values.traineeName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.traineeName && formik.touched.traineeName && (
              <span className="text-destructive text-xs">
                {formik.errors.traineeName}
              </span>
            )}
          </div>
          <div>
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
            {formik.errors.isHaveRating && formik.touched.isHaveRating && (
              <span className="text-destructive text-xs">
                {formik.errors.isHaveRating}
              </span>
            )}
          </div>
          <div>
            <Label htmlFor="iconName">أيقونة النوع</Label>
            <div className="flex flex-wrap gap-2">
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
            {formik.errors.iconName && formik.touched.iconName && (
              <span className="text-destructive text-xs">
                {formik.errors.iconName}
              </span>
            )}
          </div>

          <div className="flex flex-row-reverse gap-2 mt-6">
            <Button disabled={isPending} type="submit">
              <span>حفظ</span>
              <Save />
            </Button>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:text-destructive"
              variant={"outline"}
            >
              <span>إلغاء</span>
              <X />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const validationSchema = Yup.object({
  name: Yup.string().required("الاسم مطلوب"),
  iconName: Yup.string().required("أيقونة النوع مطلوبة"),
  isHaveRating: Yup.boolean().required("هل يمكن تقييم المدرب مطلوب"),
  instructorName: Yup.string(),
  traineeName: Yup.string(),
});

const useTypeForm = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["add-activity-type"],
    mutationFn: ActivityTypeService.createActivityType,
    onSuccess: () => {
      toast.success("تم إضافة النوع بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["activity-types"] });
    },
  });
  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      iconName: "",
      isHaveRating: null,
      instructorName: "",
      traineeName: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await mutateAsync(values);
    },
  });

  return { open, setOpen, formik, isPending };
};
