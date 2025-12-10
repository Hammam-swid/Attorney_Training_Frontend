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
import {
  createInstructor,
  editInstructor,
} from "@/services/instructors.service";
import { toast } from "react-hot-toast";

interface FormDialogProps {
  title: string;
  initialData: Partial<Instructor>;
  organizations: Organization[];
  onClose: () => void;
}

const FormDialog: React.FC<FormDialogProps> = ({
  title,
  initialData,
  organizations,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (trainer: Instructor) => createInstructor(trainer),
    onSuccess: () => {
      toast.success("تمت إضافة المدرب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      onClose();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة المدرب");
    },
  });

  const editMutation = useMutation({
    mutationFn: (trainer: Instructor) => editInstructor(trainer),
    onSuccess: () => {
      toast.success("تم تعديل بيانات المدرب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      onClose();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تعديل المدرب");
    },
  });

  const isEdit = Boolean(initialData.id);

  const formik = useFormik({
    initialValues: {
      name: initialData.name || "",
      phone: initialData.phone || "",
      organizationId: initialData.organization?.id || 0,
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
      const instructor: Instructor = {
        id: initialData.id || 0,
        name: values.name,
        phone: values.phone,
        organization: values.organizationId
          ? { name: "", id: values.organizationId }
          : null,
      };
      if (isEdit) {
        editMutation.mutate(instructor);
      } else {
        createMutation.mutate(instructor);
      }
    },
  });

  const isLoading = isEdit ? editMutation.isPending : createMutation.isPending;

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
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
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-sm text-destructive">{formik.errors.phone}</p>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="organization">الجهة التابع لها</Label>
            <Select
              value={String(formik.values.organizationId)}
              onValueChange={(value) =>
                formik.setFieldValue("organizationId", Number(value))
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

          <div className="flex justify-start flex-row-reverse">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="ml-2"
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDialog;
