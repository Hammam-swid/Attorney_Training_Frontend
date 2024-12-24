import { Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";

interface props {
  show: boolean;
  hideForm: () => void;
}

export default function AddOrganizationForm({ show, hideForm }: props) {
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يرجى إدخال اسم الجهة"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const res = await axios.post("/api/v1/organizations", values);
        if (res.status === 201) {
          hideForm();
          helpers.resetForm();
          toast.success("تمت الإضافة بنجاح");
        }
      } catch (error) {
        console.log(error);
      }
      console.log(values);
    },
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
          <h3 className="font-bold text-center text-lg">إضافة منظمة جديدة</h3>
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
              <p className="text-red-500">{formik.errors.name}</p>
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
