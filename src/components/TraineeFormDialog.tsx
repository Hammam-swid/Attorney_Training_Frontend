import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trainee } from "@/types";
import { useFormik } from "formik";
import * as Yup from "yup";

interface FormDialogProps {
  title: string;
  initialData: Partial<Trainee>;
  onSubmit: (data: Trainee) => void;
  onClose: () => void;
}

const FormDialog: React.FC<FormDialogProps> = ({
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: {
      name: initialData.name || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
      employer: initialData.employer,
      type: initialData.type || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يجب ادخال اسم المتدرب"),
      phone: Yup.string().matches(
        /^(\+218|00218|0)?(9[1-5]\d{7})$/,
        "يجب إدخال الرقم بشكل صحيح"
      ),
      address: Yup.string().min(3),
      employer: Yup.string().required("يجب إدخال جهة العمل"),
      type: Yup.string().required("يجب إدخال النوع"),
    }),
    onSubmit: () => {},
  });
  const [formData, setFormData] = useState<Partial<Trainee>>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.phone &&
      formData.address &&
      formData.employer &&
      formData.type
    ) {
      onSubmit(formData as Trainee);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl z-50"
      onClick={handleClose}
    >
      <div
        className="bg-background p-6 rounded-lg w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="employer">جهة العمل</Label>
            <Input
              id="employer"
              name="employer"
              value={formData.employer || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="type">النوع</Label>
            <Select
              value={formData.type || ""}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, type: val }))
              }
            >
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر نوع" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="موظف">موظف</SelectItem>
                <SelectItem value="ضابط">ضابط</SelectItem>
                <SelectItem value="عضو هيئة النيابة">
                  عضو هيئة النيابة
                </SelectItem>
                <SelectItem value="أخرى">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-start">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" className="ml-2">
              حفظ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDialog;
