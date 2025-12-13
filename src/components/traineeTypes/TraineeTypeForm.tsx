import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { Save } from "lucide-react";
import { TraineeType } from "@/types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TraineeTypeService } from "@/services/trainee-types.service";
import toast from "react-hot-toast";

interface AddProps {
  type: "add";
  traineeType?: never;
}

interface EditProps {
  type: "edit";
  traineeType: TraineeType;
}

type Props = {
  children: ReactNode;
} & (AddProps | EditProps);

export default function TraineeTypeForm({
  type,
  children,
  traineeType,
}: Props) {
  const { formik, open, setOpen, title } = useTraineeTypeForm({
    type,
    traineeType,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-right">
              اسم نوع المتدرب
            </Label>
            <Input
              id="name"
              name="name"
              className="col-span-3"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.errors.name && formik.touched.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={formik.isSubmitting}
            >
              <Save />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Custom hook to handle form logic
const useTraineeTypeForm = ({ type, traineeType }: Omit<Props, "children">) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = type === "edit";
  const title = isEdit ? "تعديل نوع المتدرب" : "إضافة نوع متدرب جديد";

  const { mutateAsync } = useMutation({
    mutationKey:
      type === "add"
        ? ["add-trainee-type"]
        : ["update-trainee-type", { id: traineeType?.id }],
    mutationFn: ({ name }: { name: string }) =>
      type === "add"
        ? TraineeTypeService.createTraineeType(name)
        : TraineeTypeService.updateTraineeType(traineeType!.id, name),
    onSuccess() {
      toast.success("تمت العملية بنجاح");
      formik.resetForm();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["trainee-types"],
      });
    },
    onError() {
      toast.error("حدث خطأ أثناء العملية");
    },
  });

  const formik = useFormik({
    initialValues: {
      name: type === "edit" ? traineeType?.name || "" : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يرجى إدخال اسم نوع المتدرب"),
    }),
    async onSubmit(values) {
      await mutateAsync(values);
    },
  });

  return { formik, open, setOpen, title };
};
