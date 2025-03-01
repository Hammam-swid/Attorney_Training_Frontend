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
import { AlertCircle, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface FormDialogProps {
  title: string;
  initialData: Partial<Trainee>;
  onSubmit: (data: Trainee) => void;
  onClose: () => void;
}
const payGrades = [
  "محامي عام من الفئة أ",
  "محامي عام من الفئة ب",
  "رئيس نيابة",
  "نائب نيابة من الدرجة الأولى",
  "نائب نيابة من الدرجة الثانية",
  "وكيل نيابة من الدرجة الأولى",
  "وكيل نيابة من الدرجة الثانية",
  "وكيل نيابة من الدرجة الثالثة",
  "مساعد نيابة",
  "معاون نيابة",
  "أخرى",
];

const FormDialog: React.FC<FormDialogProps> = ({
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [warning, setWarning] = useState(false);
  const formik = useFormik({
    initialValues: {
      id: initialData.id || undefined,
      name: initialData.name || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
      employer: initialData.employer,
      type: initialData.type || "",
      payGrade: initialData.payGrade || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يجب ادخال اسم المتدرب"),
      phone: Yup.string().matches(
        /^(\+218|00218|0)?(9[1-5]\d{7})$/,
        "يجب إدخال الرقم بشكل صحيح"
      ),
      address: Yup.string(),
      employer: Yup.string().required("يجب إدخال جهة العمل"),
      type: Yup.string().required("يجب إدخال النوع"),
      payGrade: Yup.string().oneOf(
        payGrades,
        "يجب إدخال الدرجة القضائية بشكل صحيح"
      ),
    }),
    onSubmit: (values) => {
      onSubmit(values as Trainee);
    },
  });

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const checkName = async () => {
      const res = await axios.get(
        `/api/v1/trainees/check?search=${formik.values.name}`
      );
      if (res.status === 200) {
        if (res.data.data.isTrainee) {
          setWarning(true);
        } else {
          setWarning(false);
        }
      }
    };
    checkName();
  }, [formik.values.name]);
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
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-sm text-destructive">
                {formik.errors.name}
              </div>
            )}
            {warning && formik.values.name !== initialData.name && (
              <div className="text-sm text-yellow-500">
                <AlertCircle className="inline-block me-1 w-4 h-4" />
                هذا الاسم مستخدم من قبل متدرب آخر
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-sm text-destructive">
                {formik.errors.phone}
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-sm text-destructive">
                {formik.errors.address}
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="employer">جهة العمل</Label>
            <Input
              id="employer"
              name="employer"
              value={formik.values.employer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.employer && formik.errors.employer && (
              <div className="text-sm text-destructive">
                {formik.errors.employer}
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="type">النوع</Label>
            <Select
              value={formik.values.type}
              onValueChange={(val) => {
                formik.setFieldValue("type", val);
                if (val !== "عضو نيابة") {
                  formik.setFieldValue("payGrade", "");
                }
                setTimeout(() => {
                  formik.setFieldTouched("type", true);
                }, 100);
              }}
            >
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر نوع" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="موظف">موظف</SelectItem>
                <SelectItem value="ضابط">ضابط</SelectItem>
                <SelectItem value="عضو نيابة">عضو نيابة</SelectItem>
                <SelectItem value="أخرى">أخرى</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.type && formik.errors.type && (
              <div className="text-sm text-destructive">
                {formik.errors.type}
              </div>
            )}
          </div>
          {formik.values.type === "عضو نيابة" && (
            <div className="mb-4">
              <Label htmlFor="type">الدرجة القضائية</Label>
              <Select
                value={formik.values.payGrade}
                onValueChange={(val) => {
                  formik.setFieldValue("payGrade", val);
                  setTimeout(() => {
                    formik.setFieldTouched("payGrade", true);
                  }, 100);
                }}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue placeholder="اختر الدرجة القضائية" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {payGrades.map((payGrade) => (
                    <SelectItem key={payGrade} value={payGrade}>
                      {payGrade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.payGrade && formik.errors.payGrade && (
                <div className="text-sm text-destructive">
                  {formik.errors.payGrade}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-row-reverse gap-2">
            <Button type="submit">
              <span>حفظ</span>
              <Save />
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              <span>إلغاء</span>
              <X />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDialog;
