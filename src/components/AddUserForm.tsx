import { useFormik } from "formik";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import * as Yup from "yup";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { Roles, RolesCollection } from "@/types";

interface AddUserFormProps {
  children: ReactNode;
}

export default function AddUserForm({ children }: AddUserFormProps) {
  const { formik, showPassword, setShowPassword, open, setOpen } =
    useAddUserForm();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مستخدم</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <p className="text-red-500">{formik.errors.fullName}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500">{formik.errors.phone}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500">{formik.errors.email}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer left-4 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </span>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500">{formik.errors.password}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="role">الدور</Label>
            <div className="flex items-center space-x-2">
              {RolesCollection.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={role}
                    name="role"
                    value={role}
                    checked={formik.values.role === role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="hidden peer"
                  />
                  <Label
                    className="peer-checked:bg-primary peer-checked:text-primary-foreground bg-primary/20 peer-checked:hover:bg-primary rounded-md cursor-pointer py-2 px-3 hover:bg-primary/70 transition-colors"
                    htmlFor={role}
                  >
                    {Roles[role]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Button
            disabled={formik.isSubmitting}
            type="submit"
            className="w-full text-lg py-6 font-bold"
          >
            {formik.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span>إضافة مستخدم جديد</span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FormValues {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: "admin" | "moderator" | "";
}

const useAddUserForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { page, search, status } = useAppSelector((state) => state.users);
  const { mutateAsync } = useMutation({
    mutationKey: ["add-user"],
    mutationFn: (data: FormValues) => api.post("/api/v1/users/register", data),
    onSuccess: () => {
      toast.success("تم إضافة المستخدم بنجاح");
      formik.resetForm();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["users", { page }, { search }, { status }],
      });
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError ? error?.response?.data?.message : null;
      toast.error(message || "حدث خطأ أثناء إضافة المستخدم");
    },
  });
  const formik = useFormik<FormValues>({
    initialValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      role: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("الاسم الكامل مطلوب"),
      phone: Yup.string()
        .required("رقم الهاتف مطلوب")
        .matches(/^(09)\d{8}$/, "رقم الهاتف غير صالح"),
      email: Yup.string()
        .email("البريد الإلكتروني غير صالح")
        .required("البريد الإلكتروني مطلوب"),
      password: Yup.string()
        .required("كلمة المرور مطلوبة")
        .matches(
          /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          "كلمة المرور يجب أن تحتوي على حرف ورقم وأن تكون على الأقل 8 أحرف"
        ),
      role: Yup.string()
        .required("الدور مطلوب")
        .matches(/^(admin|moderator)$/, "الدور غير صالح"),
    }),
    onSubmit: async (values) => {
      await mutateAsync(values);
      // try {
      //   const res = await api.post("/api/v1/users/register", values);
      //   if (res.status === 201) {
      //     formik.resetForm();
      //     toast.success("تم إضافة المستخدم بنجاح");
      //   }
      // } catch (error) {
      // const message =
      //   error instanceof AxiosError ? error?.response?.data?.message : null;
      // toast.error(message || "حدث خطأ أثناء إضافة المستخدم");
      // }
    },
  });

  return { formik, showPassword, setShowPassword, open, setOpen };
};
