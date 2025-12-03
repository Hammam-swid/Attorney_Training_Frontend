import { Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ReactNode, useState } from "react";
import { Organization } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizationService } from "@/services/organization.service";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";

interface AddOrganizationProps {
  type: "add";
  organization?: never;
}

interface EditOrganizationProps {
  type: "edit";
  organization: Organization;
}

type props = {
  title: string;
  children: ReactNode;
} & (AddOrganizationProps | EditOrganizationProps);

export default function OrganizationForm({
  title,
  children,
  type,
  organization,
}: props) {
  const { formik, open, setOpen } = useOrganizationForm({
    title,
    children,
    organization,
    type,
  } as props);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
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
              onClick={() => {}}
              type="button"
            >
              <span className="mr-2">إلغاء</span>
              <X />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const useOrganizationForm = ({ type, organization }: props) => {
  const [open, setOpen] = useState(false);
  const { page, search } = useAppSelector((state) => state.organizations);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationKey:
      type === "add"
        ? ["add-organization"]
        : ["update-organization", { id: organization.id }],
    mutationFn: ({ name }: { name: string }) =>
      type === "add"
        ? OrganizationService.createOrganization(name)
        : OrganizationService.updateOrganization(organization.id, name),
    onSuccess() {
      toast.success("تمت العملية بنجاح");
      formik.resetForm();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["organization", { page }, { search }],
      });
      queryClient.invalidateQueries({
        queryKey: ["all-organizations"],
      });
    },
  });
  const formik = useFormik({
    initialValues: {
      name: type === "edit" ? organization.name : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("يرجى إدخال اسم الجهة"),
    }),
    async onSubmit(values) {
      await mutateAsync(values);
    },
  });

  return { formik, open, setOpen };
};
