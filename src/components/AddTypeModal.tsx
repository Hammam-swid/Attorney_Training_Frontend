import { useFormik } from "formik";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { ActivityType } from "@/types";
import api from "@/lib/api";

interface Props {
  onClose: () => void;
  onAdd: (newType: ActivityType) => void;
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

export default function AddTypeModal({ onClose, onAdd }: Props) {
  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      iconName: "",
      isHaveRating: null,
      instructorName: "",
      traineeName: "",
    },
    onSubmit: async (values) => {
      try {
        const res = await api.post("/api/v1/activity-types", values);
        if (res.status === 201) {
          closeModal();
          toast.success("تم إضافة النوع بنجاح");
          onAdd(res.data.data.type as ActivityType);
        }
      } catch (error) {
        const message =
          error instanceof AxiosError ? error?.response?.data?.message : null;
        toast.error(message || "حدث خطأ ما");
      }
    },
  });
  const closeModal = () => {
    onClose();
    formik.resetForm();
  };
  return (
    <div
      id="add-type-modal-overlay"
      onClick={(
        e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
          target: HTMLDivElement;
        }
      ) => e.target.id === "add-type-modal-overlay" && closeModal()}
      className="fixed inset-0 bg-black bg-opacity-50 h-screen w-screen flex items-center justify-center z-50"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-center">إضافة نوع نشاط جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col gap-4 w-96"
          >
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

            <div className="flex flex-row-reverse gap-2 mt-6">
              <Button type="submit">
                <span>حفظ</span>
                <Save />
              </Button>
              <Button
                type="button"
                onClick={() => closeModal()}
                className="hover:text-destructive"
                variant={"outline"}
              >
                <span>إلغاء</span>
                <X />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
