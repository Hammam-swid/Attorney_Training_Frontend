import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Instructor, Organization } from "@/types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InstructorService } from "@/services/instructors.service";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ReactNode, useState } from "react";

interface AddInstructorProps {
  type: "add";
  instructor?: never;
}

interface EditInstructorProps {
  type: "edit";
  instructor: Instructor;
}

type Props = {
  title: string;
  children: ReactNode;
  organizations: Organization[];
} & (AddInstructorProps | EditInstructorProps);

export default function InstructorForm({
  title,
  children,
  type,
  instructor,
  organizations,
}: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = type === "edit";

  const createMutation = useMutation({
    mutationFn: (trainer: Instructor) =>
      InstructorService.createInstructor(trainer),
    onSuccess: () => {
      toast.success("تمت إضافة المدرب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      formik.resetForm();
      setOpen(false);
    },
    onError: () => toast.error("حدث خطأ أثناء إضافة المدرب"),
  });

  const editMutation = useMutation({
    mutationFn: (trainer: Instructor) =>
      InstructorService.editInstructor(trainer),
    onSuccess: () => {
      toast.success("تم تعديل بيانات المدرب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      formik.resetForm();
      setOpen(false);
    },
    onError: () => toast.error("حدث خطأ أثناء تعديل المدرب"),
  });

  const formik = useFormik({
    initialValues: {
      name: isEdit ? instructor.name : "",
      phone: isEdit ? instructor.phone : "",
      organizationId: isEdit ? instructor.organization?.id || 0 : 0,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يرجى إدخال اسم المدرب"),
      phone: Yup.string().matches(
        /^(\+218|00218|0)?(9[1-5]\d{7})$/,
        "يجب إدخال الرقم بشكل صحيح"
      ),
      organizationId: Yup.number(),
    }),
    onSubmit: (values) => {
      const trainer: Instructor = {
        id: isEdit ? instructor.id : 0,
        name: values.name,
        phone: values.phone,
        organization: values.organizationId
          ? { id: values.organizationId, name: "" }
          : null,
      };
      isEdit ? editMutation.mutate(trainer) : createMutation.mutate(trainer);
    },
  });

  const isLoading = isEdit ? editMutation.isPending : createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4 mt-4"
        >
          <div>
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-sm text-destructive">{formik.errors.phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="organization">الجهة التابع لها</Label>
            <Select
              value={String(formik.values.organizationId)}
              onValueChange={(v) =>
                formik.setFieldValue("organizationId", Number(v))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الجهة" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-start flex-row-reverse gap-2 mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
