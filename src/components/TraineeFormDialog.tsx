import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trainee, TraineeType } from "@/types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AlertCircle, Save, X } from "lucide-react";
import api from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TraineeFormValues,
  TraineesService,
} from "@/services/trainees.service";
import { useAppSelector } from "@/store/hooks";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddProps {
  type: "add";
  trainee?: never;
}

interface EditProps {
  type: "edit";
  trainee: Trainee;
}

type Props = {
  children: React.ReactNode;
  title: string;
} & (AddProps | EditProps);

const payGrades = [
  "محامي عام من الفئة أ",
  "محامي عام من الفئة ب",
  "رئيس نيابة",
  "نائب نيابة من الدرجة الأولى",
  "نائب نيابة من الدرجة الثانية",
  "وكيل نيابة من الدرجة الأولى",
  "وكيل نيابة من الدرجة الثانية",
  "وكيل نيابة من الدرجة الثالثة",
  "مساعد نيابة",
  "معاون نيابة",
  "أخرى",
];

const FormDialog: React.FC<Props> = ({ title, children, type, trainee }) => {
  const { formik, warning, traineesTypes, isPending, open, setOpen, typeId } =
    useTraineeForm({
      type,
      trainee,
    } as Props);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-sm text-destructive">
                {formik.errors.name}
              </div>
            )}
            {warning && formik.values.name !== trainee?.name && (
              <div className="text-sm text-yellow-500">
                <AlertCircle className="inline-block me-1 w-4 h-4" />
                هذا الاسم مستخدم من قبل متدرب آخر
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-sm text-destructive">
                {formik.errors.phone}
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-sm text-destructive">
                {formik.errors.address}
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="employer">جهة العمل</Label>
            <Input
              id="employer"
              name="employer"
              value={formik.values.employer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.employer && formik.errors.employer && (
              <div className="text-sm text-destructive">
                {formik.errors.employer}
              </div>
            )}
          </div>
          {type === "edit" && (
            <div className="mb-4">
              <Label htmlFor="type">النوع</Label>
              <Select
                value={formik.values.typeId?.toString() ?? ""}
                onValueChange={(val) => {
                  formik.setFieldValue("typeId", Number(val));
                  if (val !== "1") {
                    formik.setFieldValue("payGrade", "");
                  }
                  setTimeout(() => {
                    formik.setFieldTouched("typeId", true);
                  }, 100);
                }}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue placeholder="اختر نوع" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {traineesTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.typeId && formik.errors.typeId && (
                <div className="text-sm text-destructive">
                  {formik.errors.typeId}
                </div>
              )}
            </div>
          )}
          {Number(typeId) === 1 && (
            <div className="mb-4">
              <Label htmlFor="type">الدرجة القضائية</Label>
              <Select
                value={formik.values.payGrade}
                onValueChange={(val) => {
                  formik.setFieldValue("payGrade", val);
                  setTimeout(() => {
                    formik.setFieldTouched("payGrade", true);
                  }, 100);
                }}
              >
                <SelectTrigger dir="rtl">
                  <SelectValue placeholder="اختر الدرجة القضائية" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {payGrades.map((payGrade) => (
                    <SelectItem key={payGrade} value={payGrade}>
                      {payGrade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.payGrade && formik.errors.payGrade && (
                <div className="text-sm text-destructive">
                  {formik.errors.payGrade}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-row-reverse gap-2">
            <Button disabled={isPending} type="submit">
              <span>حفظ</span>
              <Save />
            </Button>
            <DialogClose>
              <Button type="button" variant="outline">
                <span>إلغاء</span>
                <X />
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const validationSchema = (type: "add" | "edit") =>
  Yup.object({
    name: Yup.string().required("يجب ادخال اسم المتدرب"),
    phone: Yup.string().matches(
      /^(\+218|00218|0)?(9[1-5]\d{7})$/,
      "يجب إدخال الرقم بشكل صحيح"
    ),
    address: Yup.string(),
    employer: Yup.string().required("يجب إدخال جهة العمل"),
    typeId:
      type === "edit"
        ? Yup.number().required("يجب إدخال النوع")
        : Yup.number().optional(),
    payGrade: Yup.string().oneOf(
      payGrades,
      "يجب إدخال الدرجة القضائية بشكل صحيح"
    ),
  });

const useTraineeForm = ({ type, trainee }: Props) => {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { page, search } = useAppSelector((state) => state.trainees);
  const traineeType = searchParams.get("type") || "attorney";
  const typeId = searchParams.get("typeId") || "";
  const { mutateAsync, isPending } = useMutation({
    mutationKey:
      type === "add" ? ["add-trainee"] : ["edit-trainee", { id: trainee?.id }],
    mutationFn: (data: TraineeFormValues) =>
      type === "add"
        ? TraineesService.createTrainee({
            ...data,
            typeId: data.typeId || Number(typeId),
            payGrade: Number(typeId) === 1 ? data.payGrade : undefined,
          })
        : TraineesService.updateTrainee(trainee.id, {
            ...data,
            payGrade: data.typeId === 1 ? data.payGrade : undefined,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "trainees",
          { page },
          { search },
          { type: traineeType },
          { typeId },
        ],
      });
      setOpen(false);
      toast.success("تم الحفظ بنجاح");
      formik.resetForm();
    },
  });
  const { data: traineesTypes } = useQuery({
    queryKey: ["trainee-types"],
    queryFn: async () => {
      const res = await api.get<{ data: { traineeTypes: TraineeType[] } }>(
        "/api/v1/trainee-types"
      );
      return res.data.data.traineeTypes;
    },
  });
  const formik = useFormik<TraineeFormValues>({
    initialValues: {
      name: trainee?.name || "",
      phone: trainee?.phone || "",
      address: trainee?.address || "",
      employer: trainee?.employer || "",
      typeId: trainee?.traineeType?.id || undefined,
      payGrade: trainee?.payGrade || "",
    },
    validationSchema: validationSchema(type),
    onSubmit: async (values) => {
      await mutateAsync(values);
    },
  });
  console.log(formik.errors);

  const { data: warning } = useQuery({
    queryKey: ["check-trainee", { name: formik.values.name }],
    queryFn: () => TraineesService.checkTraineeName(formik.values.name),
  });

  return {
    formik,
    warning,
    traineesTypes,
    isPending,
    open,
    setOpen,
    typeId,
  };
};

export default FormDialog;
