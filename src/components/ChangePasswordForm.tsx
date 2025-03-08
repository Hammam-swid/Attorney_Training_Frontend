import { useFormik } from "formik";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import * as Yup from "yup";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/store/hooks";
import { setAlert } from "@/store/alertSlice";

export default function ChangePasswordForm() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("كلمة المرور الحالية مطلوبة"),
      newPassword: Yup.string()
        .required("كلمة المرور الجديدة مطلوبة")
        .min(8, "كلمة المرور الجديدة يجب أن تكون على الأقل 8 أحرف")
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          "كلمة المرور الجديدة يجب أن تحتوي على حرف ورقم ولا يمكن أن تكون أقل من 8 أحرف"
        ),
      confirmPassword: Yup.string()
        .required("تأكيد كلمة المرور مطلوب")
        .oneOf([Yup.ref("newPassword")], "كلمة المرور غير متطابقة"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await axios.patch("/api/v1/users/change-password", values);
        if (res.status === 200) {
          formik.resetForm();
          dispatch(setAlert(false));
          toast.success("تم تغيير كلمة المرور بنجاح");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error);
          toast.error(
            error?.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور"
          );
        }
      }
    },
  });
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>تغيير كلمة المرور</span>
          <Lock />
        </CardTitle>
        <CardDescription>
          قم بتغيير كلمة المرور الخاصة بك للحفاظ على أمان حسابك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="oldPassword">
              كلمة المرور الحالية <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="oldPassword"
                name="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={formik.values.oldPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showOldPassword ? <Eye /> : <EyeOff />}
              </span>
            </div>
            {formik.touched.oldPassword && formik.errors.oldPassword && (
              <div className="text-red-500">{formik.errors.oldPassword}</div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="newPassword">
              كلمة المرور الجديدة <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showNewPassword ? <Eye /> : <EyeOff />}
              </span>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <div className="text-red-500">{formik.errors.newPassword}</div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="confirmPassword">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmPassword ? <Eye /> : <EyeOff />}
              </span>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className="text-red-500">
                  {formik.errors.confirmPassword}
                </div>
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
