import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TraineeTypeService } from "@/services/trainee-types.service";
import { Input } from "./ui/input";
import Dropzone from "./common/Dropzone";
import excelMimeTypes from "@/lib/excelMimeTypes";
import { useFormik } from "formik";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { TraineesService } from "@/services/trainees.service";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import * as Yup from "yup";

interface Props {
  children: ReactNode;
  typeId: string;
}

export default function AddMultiTraineesForm({ children, typeId }: Props) {
  const { selectedType, formik, open, setOpen, isPending } =
    useMultiTraineesForm(typeId);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة عدة مستهدفين</DialogTitle>
          <DialogDescription>
            هنا يمكنك رفع قائمة خاصة بمستهدفين من نوع معين لإضافتها في النظام
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input value={selectedType?.name} disabled />
            <Dropzone
              accept=".xlsx"
              onDrop={(files) => {
                const file = files[0];
                if (excelMimeTypes.includes(file.type)) {
                  formik.setFieldValue("file", file);
                } else {
                  formik.setFieldError("file", "الملف غير صحيح");
                }
              }}
              file={formik.values.file}
            />
            <div className="text-muted-foreground">
              <ul>
                <li>يجب أن يحتوي الملف على عمودي "الاسم" و "جهة العمل".</li>
                {selectedType?.hasPayGrade && (
                  <li>يجب أن يحتوي الملف على عمود "الدرجة".</li>
                )}
              </ul>
            </div>
          </div>
          <Button
            disabled={isPending || !formik.isValid}
            className="w-full"
            type="submit"
          >
            <Upload />
            رفع
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const validationSchema = Yup.object({
  file: Yup.mixed().required("الملف مطلوب"),
});

const useMultiTraineesForm = (typeId: string | null) => {
  const { data: traineesTypes } = useQuery({
    queryKey: ["trainee-types"],
    queryFn: TraineeTypeService.getTraineeTypes,
  });
  const selectedType = traineesTypes?.find(
    (type) => type.id === parseInt(typeId || "0"),
  );
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) =>
      TraineesService.addMultiTrainees(typeId || "", file),
    onSuccess: () => {
      toast.success("تم رفع الملف بنجاح");
      setOpen(false);
      formik.resetForm();
    },
    onError: (error) => {
      let message = "حدث خطأ، يرجى المحاولة مرة أخرى";
      if (error instanceof AxiosError) {
        message = error.response?.data.message || message;
      }
      toast.error(message);
    },
  });

  const formik = useFormik<{ file: File | null }>({
    initialValues: {
      file: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      await mutateAsync(values.file!);
    },
  });
  return { selectedType, formik, open, setOpen, isPending };
};
