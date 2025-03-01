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

interface FormDialogProps {
  title: string;
  initialData: Partial<Instructor>;
  organizations: Organization[];
  onSubmit: (data: Instructor) => void;
  onClose: () => void;
}

const FormDialog: React.FC<FormDialogProps> = ({
  title,
  initialData,
  organizations,
  onSubmit,
  onClose,
}) => {
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
        organization: { name: "", id: values.organizationId },
      };
      onSubmit(instructor);
    },
  });

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
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-sm text-destructive">{formik.errors.phone}</p>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="organization">الجهة التابع لها</Label>
            <Select
              value={String(formik.values.organizationId)}
              onValueChange={(value) => {
                formik.setFieldValue("organizationId", Number(value));
                formik.setFieldTouched("organizationId", true);
              }}
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
            {formik.touched.organizationId && formik.errors.organizationId && (
              <p className="text-sm text-destructive">
                {formik.errors.organizationId}
              </p>
            )}
          </div>
          <div className="flex justify-start flex-row-reverse">
            <Button type="submit">حفظ</Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="ml-2"
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
