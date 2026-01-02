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
import { ActivityDomain } from "@/types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActivityDomainsService } from "@/services/activity-domains.service";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";

interface AddProps {
  type: "add";
  domain?: never;
}

interface EditProps {
  type: "edit";
  domain: ActivityDomain;
}

type Props = {
  children: ReactNode;
} & (AddProps | EditProps);

export default function ActivityDomainForm({ type, children, domain }: Props) {
  const { formik, open, setOpen, title } = useActivityDomainForm({
    type,
    domain,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-right">
                اسم المجال
              </Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.name && formik.touched.name && (
                <p className="text-sm text-destructive">{formik.errors.name}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-right">
                الوصف
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.description && formik.touched.description && (
                <p className="text-sm text-destructive">
                  {formik.errors.description}
                </p>
              )}
            </div>
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

const useActivityDomainForm = ({ type, domain }: Omit<Props, "children">) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = type === "edit";
  const title = isEdit ? "تعديل المجال" : "إضافة مجال جديد";

  const { mutateAsync } = useMutation({
    mutationKey:
      type === "add"
        ? ["add-activity-domain"]
        : ["update-activity-domain", { id: domain?.id }],
    mutationFn: (values: { name: string; description: string }) =>
      type === "add"
        ? ActivityDomainsService.createDomain(values)
        : ActivityDomainsService.updateDomain(domain!.id, values),
    onSuccess() {
      toast.success("تمت العملية بنجاح");
      formik.resetForm();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["activity-domains"],
      });
    },
    onError() {
      toast.error("حدث خطأ أثناء العملية");
    },
  });

  const formik = useFormik({
    initialValues: {
      name: type === "edit" ? domain?.name || "" : "",
      description: type === "edit" ? domain?.description || "" : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يرجى إدخال اسم المجال"),
      description: Yup.string().required("يرجى إدخال الوصف"),
    }),
    async onSubmit(values) {
      await mutateAsync(values);
    },
  });

  return { formik, open, setOpen, title };
};
