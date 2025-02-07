import { Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FormikHelpers, useFormik } from "formik";
import * as Yup from "yup";

interface props {
  title: string;
  show: boolean;
  hideForm: () => void;
  onSubmit: (
    values: { name: string },
    helpers: FormikHelpers<{ name: string }>
  ) => void;
  orgName?: string;
}

export default function AddOrganizationForm({
  title,
  show,
  hideForm,
  onSubmit,
  orgName,
}: props) {
  const formik = useFormik({
    initialValues: {
      name: orgName || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يرجى إدخال اسم الجهة"),
    }),
    onSubmit: onSubmit,
  });

  return (
    show && (
      <div
        id="add-organization-form-overlay"
        onClick={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
            target: HTMLDivElement;
          }
        ) =>
          e.target.id === "add-organization-form-overlay"
            ? hideForm()
            : undefined
        }
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl z-50"
      >
        <div className="bg-background p-6 rounded-md w-96 shadow-lg">
          <h3 className="font-bold text-center text-lg">{title}</h3>
          <form
            className="flex flex-col gap-2 mt-6"
            onSubmit={formik.handleSubmit}
          >
            <Label htmlFor="name">اسم الجهة</Label>
            <Input
              id="name"
              placeholder="اسم الجهة"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.errors.name && formik.touched.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
            <div className="flex flex-row-reverse gap-2 mt-6">
              <Button type="submit">
                <span className="mr-2">حفظ</span>
                <Save />
              </Button>
              <Button
                className="hover:text-red-500"
                variant={"outline"}
                onClick={() => {
                  hideForm();
                  formik.resetForm();
                }}
                type="button"
              >
                <span className="mr-2">إلغاء</span>
                <X />
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
