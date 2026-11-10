import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { TraineeTypeService } from "@/services/trainee-types.service";
import { Input } from "./ui/input";
import Dropzone from "./common/Dropzone";
import excelMimeTypes from "@/lib/excelMimeTypes";
import { useFormik } from "formik";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { ImportSummary, TraineesService } from "@/services/trainees.service";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import * as Yup from "yup";

interface Props {
  children: ReactNode;
  typeId: string;
}

export default function AddMultiTraineesForm({ children, typeId }: Props) {
  const { selectedType, formik, open, setOpen, isPending, summary } =
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
            <div className="text-muted-foreground text-sm">
              <ul className="list-disc ps-5 space-y-1">
                <li>يجب أن يحتوي الملف على عمودي "الاسم" و "جهة العمل".</li>
                {selectedType?.hasPayGrade && (
                  <li>يجب أن يحتوي الملف على عمود "الدرجة".</li>
                )}
                <li>
                  أعمدة اختيارية: "الجهة الرئيسية" (لوضع الجهة الجديدة تحت
                  نيابة رئيسية) و"ملاحظات".
                </li>
                <li>
                  تُربط جهة العمل تلقائياً بدليل النيابات حتى مع اختلاف الكتابة
                  البسيط (ة/ه، أ/ا، المسافات)، وما لا يوجد يُضاف كجهة جديدة
                  تحتاج مراجعة.
                </li>
              </ul>
            </div>
          </div>
          {summary && (
            <div className="rounded-md border p-3 text-sm space-y-2">
              <p className="font-semibold">
                تمت إضافة {summary.added} وتحديث {summary.updated} من
                المستهدفين
                {summary.skipped ? ` (تم تجاهل ${summary.skipped} صف)` : ""}
              </p>
              {summary.createdWorkplaces.length > 0 && (
                <div>
                  <p className="text-amber-600">
                    جهات عمل جديدة أُضيفت للدليل وتحتاج مراجعة (
                    {summary.createdWorkplaces.length}):
                  </p>
                  <p className="text-muted-foreground">
                    {summary.createdWorkplaces.map((w) => w.name).join("، ")}
                  </p>
                  <Link
                    to="/workplaces?needsReview=true"
                    className="text-primary underline"
                    onClick={() => setOpen(false)}
                  >
                    مراجعتها في دليل جهات العمل
                  </Link>
                </div>
              )}
              {[...summary.warnings, ...summary.errors].length > 0 && (
                <ul className="max-h-32 overflow-y-auto text-destructive">
                  {[...summary.errors, ...summary.warnings].map((w, i) => (
                    <li key={i}>
                      صف {w.row} ({w.name}): {w.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
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
  const [open, setOpenState] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const queryClient = useQueryClient();
  const setOpen = (value: boolean) => {
    setOpenState(value);
    if (!value) setSummary(null);
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) =>
      TraineesService.addMultiTrainees(typeId || "", file),
    onSuccess: (res) => {
      toast.success(res.message || "تم رفع الملف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["trainees"] });
      queryClient.invalidateQueries({ queryKey: ["workplaces"] });
      formik.resetForm();
      const data = res.data;
      // keep the dialog open to show new workplaces / warnings
      if (
        data &&
        (data.createdWorkplaces.length || data.errors.length || data.warnings.length)
      ) {
        setSummary(data);
      } else {
        setOpen(false);
      }
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
  return { selectedType, formik, open, setOpen, isPending, summary };
};
