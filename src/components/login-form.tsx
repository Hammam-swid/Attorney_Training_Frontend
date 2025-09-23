import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LoaderCircle } from "lucide-react";
import axios, { AxiosError } from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAppDispatch } from "@/store/hooks";
import { setToken, setUser } from "@/store/authSlice";
import { useNavigate } from "react-router";
import { setAlert } from "@/store/alertSlice";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("البريد الإلكتروني غير صالح")
        .required("يجب إدخال البريد الإلكتروني"),
      password: Yup.string()
        .min(8, "كلمة المرور يجب أن تكون على الأقل 8 أحرف")
        .required("يجب إدخال كلمة المرور"),
    }),
    onSubmit: async (values) => {
      try {
        const { data } = await axios.post("/api/v1/users/login", values);
        console.log(data);
        if (data.data.token) {
          toast.success("تم تسجيل الدخول بنجاح");
          dispatch(setToken(data.data.token));
          dispatch(setUser(data.data.user));
          if (!data.data.isLoggedIn) {
            dispatch(setAlert(true));
          }
          setTimeout(() => {
            navigate("/");
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        if (error instanceof AxiosError)
          toast.error(
            error?.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول"
          );
      }
    },
  });
  return (
    <form
      onSubmit={formik.handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">تسجيل الدخول إلى حسابك</h1>
        <p className="text-balance text-sm text-muted-foreground">
          أدخل البريد الإلكتروني للدخول إلى حسابك
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          {formik.errors.email && formik.touched.email && (
            <p className="text-xs text-red-500">{formik.errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">كلمة المرور</Label>
            {/* <a
              href="#"
              className="ms-auto text-sm underline-offset-4 hover:underline"
            >
              هل نسيت كلمة المرور؟
              </a> */}
          </div>
          <Input
            id="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          {formik.errors.password && formik.touched.password && (
            <p className="text-xs text-red-500">{formik.errors.password}</p>
          )}
        </div>
        <Button disabled={formik.isSubmitting} type="submit" className="w-full">
          {!formik.isSubmitting ? (
            "تسجيل الدخول"
          ) : (
            <LoaderCircle className="animate-spin" />
          )}
        </Button>
      </div>
      <Toaster position="bottom-center" />
    </form>
  );
}
