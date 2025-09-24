import { useAppSelector } from "@/store/hooks";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { Button } from "./ui/button";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

export default function ProfileForm() {
  const user = useAppSelector((state) => state.auth.user);
  const formik = useFormik({
    initialValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      email: user?.email || "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("الاسم الكامل مطلوب"),
      phone: Yup.string()
        .required("رقم الهاتف مطلوب")
        .matches(/^(09)\d{8}$/, "رقم الهاتف غير صالح"),
      email: Yup.string()
        .email("البريد الإلكتروني غير صالح")
        .required("البريد الإلكتروني مطلوب"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.patch("/api/v1/users/update-me", values);
        console.log(res);
        if (res.status === 200) {
          toast.success("تم تحديث الملف الشخصي بنجاح");
        }
      } catch (error) {
        console.log(error);
        const message =
          error instanceof AxiosError
            ? error.response?.data?.message ||
              "حدث خطأ أثناء تحديث الملف الشخصي"
            : "حدث خطأ أثناء تحديث الملف الشخصي";
        toast.error(message);
      }
    },
  });
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>الملف الشخصي</span>
          <User />
        </CardTitle>
        <CardDescription>قم بتحديث معلومات حسابك</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <div className="relative">
              <Input
                id="fullName"
                name="fullName"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                dir="rtl"
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
            {formik.touched.fullName && formik.errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.fullName}
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                dir="rtl"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <div className="relative">
              <Input
                id="phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                dir="rtl"
              />
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
            )}
          </div>
          <Button
            disabled={formik.isSubmitting}
            type="submit"
            className="w-full text-lg py-6 font-bold"
          >
            {formik.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span>حفظ التغييرات</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
