import { Activity } from "@/types";
import { useFormik } from "formik";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { LoaderCircle, PlusCircle, Save } from "lucide-react";
import OrganizationForm from "./OrganizationForm";
import * as Yup from "yup";

import DatePicker from "./ui/DatePicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrganizationService } from "@/services/organization.service";
import { ActivityTypeService } from "@/services/actvitiy-type.service";
import {
  ActivityFormValues,
  ActivityService,
} from "@/services/activity.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

interface addActivityProps {
  type: "add";
  activity?: never;
  parentId?: number | null;
}

interface editActivityProps {
  type: "edit";
  activity: Activity;
  parentId?: number | null;
}

type Props = {
  // children: React.ReactNode;
  title: string;
  activityTypeId: number;
} & (addActivityProps | editActivityProps);

export default function ActivityForm({
  type,
  activity,
  title,
  activityTypeId,
  parentId,
}: Props) {
  const { formik, activityTypes, organizations, isPending } = useActivityForm({
    activity,
    activityTypeId,
    type,
    parentId,
  } as Props);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>ادخل معلومات النشاط التدريبي</CardDescription>
      </CardHeader>
      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          <Label htmlFor="title">عنوان النشاط</Label>
          <div>
            <Input
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-destructive">{formik.errors.title}</p>
            )}
          </div>
          <Label htmlFor="hours">عدد الساعات</Label>
          <div>
            <Input
              id="hours"
              name="hours"
              value={formik.values.hours}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.hours && formik.errors.hours && (
              <p className="text-sm text-destructive">{formik.errors.hours}</p>
            )}
          </div>
          <Label htmlFor="location">مكان الانعقاد</Label>
          <div>
            <Input
              id="location"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.location && formik.errors.location && (
              <p className="text-sm text-destructive">
                {formik.errors.location}
              </p>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {/* تاريخ البدء */}
            <Label htmlFor="startDate">تاريخ البدء</Label>
            <div>
              <DatePicker
                date={formik.values.startDate}
                setDate={(date) => formik.setFieldValue("startDate", date)}
              />
              {formik.touched.startDate && formik.errors.startDate && (
                <p className="text-sm text-destructive">
                  {formik.errors.startDate as string}
                </p>
              )}
            </div>

            {/* تاريخ الانتهاء */}
            <Label htmlFor="endDate">تاريخ الانتهاء</Label>
            <div>
              <DatePicker
                date={formik.values.endDate}
                setDate={(date) => formik.setFieldValue("endDate", date)}
              />

              {formik.touched.endDate && formik.errors.endDate && (
                <p className="text-sm text-destructive">
                  {formik.errors.endDate as string}
                </p>
              )}
            </div>
          </div>

          <Label htmlFor="hostId">الجهة المنظمة</Label>
          <div>
            <div className="flex gap-2">
              <Select
                dir="rtl"
                value={formik.values.hostId + ""}
                onValueChange={(value) => {
                  formik.setFieldValue("hostId", +value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجهة المنظمة" />
                </SelectTrigger>
                <SelectContent
                  onBlur={() => formik.setFieldTouched("hostId", true)}
                >
                  {organizations?.map((organization) => (
                    <SelectItem
                      key={organization.id}
                      value={organization.id.toString()}
                    >
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <OrganizationForm type="add" title="إضافة جهة جديدة">
                <Button type="button">
                  <span>إضافة</span>
                  <PlusCircle />
                </Button>
              </OrganizationForm>
            </div>
            {formik.touched.hostId && formik.errors.hostId && (
              <p className="text-sm text-destructive">
                {formik.errors.hostId as string}
              </p>
            )}
          </div>
          <Label htmlFor="executorId">الجهة المنفذة</Label>
          <div>
            <Select
              dir="rtl"
              autoComplete=""
              value={formik.values.executorId + ""}
              onValueChange={(value) => {
                formik.setFieldValue("executorId", +value);
              }}
            >
              <SelectTrigger aria-autocomplete="list" dir="rtl">
                <SelectValue placeholder="اختر الجهة المنفذة" />
              </SelectTrigger>
              <SelectContent
                onBlur={() => formik.setFieldTouched("executorId", true)}
              >
                {organizations?.map((organization) => (
                  <SelectItem
                    key={organization.id}
                    value={organization.id.toString()}
                  >
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.executorId && formik.errors.executorId && (
              <p className="text-sm text-destructive">
                {formik.errors.executorId as string}
              </p>
            )}
          </div>
          {activity && (
            <div>
              <label>نوع النشاط</label>
              <div>
                <Select
                  dir="rtl"
                  value={formik.values.activityTypeId + ""}
                  onValueChange={(value) => {
                    formik.setFieldValue("activityTypeId", +value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع النشاط" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button disabled={isPending} type="submit" className="w-full">
            {!isPending ? (
              <>
                <span>حفظ</span>
                <Save />
              </>
            ) : (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const useActivityForm = ({
  activityTypeId,
  activity,
  type,
  parentId,
}: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: type === "add" ? ["add-activity"] : ["update-activity"],
    mutationFn: (values: ActivityFormValues) =>
      type === "add"
        ? ActivityService.createActivity(values, activityTypeId)
        : ActivityService.updateActivity(activity.id, values),
    onSuccess: () => {
      toast.success("تم حفظ النشاط");

      queryClient.invalidateQueries();
      if (type === "add") navigate(`/activities?type=${activityTypeId}`);
      else navigate(`/activities/${activity.id}`, { replace: true });
    },
  });
  const { data: activityTypes } = useQuery({
    queryKey: ["activity-types"],
    queryFn: ActivityTypeService.getActivityTypes,
  });
  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: OrganizationService.getAllOrganization,
  });

  const formik = useFormik<ActivityFormValues>({
    initialValues: {
      title: type === "edit" ? activity.title : "",
      location: type === "edit" ? activity.location : "",
      hours: type === "edit" ? activity.hours : undefined,
      startDate: type === "edit" ? new Date(activity.startDate) : new Date(),
      endDate: type === "edit" ? new Date(activity?.endDate) : new Date(),
      hostId: type === "edit" ? activity.host.id : undefined,
      executorId: type === "edit" ? activity.executor.id : undefined,
      activityTypeId: type === "edit" ? activity.type.id : activityTypeId,
      parentId: type === "edit" ? activity.parent?.id ?? null : parentId,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("العنوان مطلوب"),
      location: Yup.string().required("مكان الانعقاد مطلوب"),
      hours: Yup.number()
        .required("عدد الساعات مطلوب")
        .positive("عدد الساعات يجب أن يكون موجب")
        .min(1, "عدد الساعات يجب أن يكون أكبر من 0")
        .typeError("عليك أن تدخل أرقاماً فقط"),
      startDate: Yup.date().required("تاريخ البداية مطلوب"),
      endDate: Yup.date()
        .required("تاريخ النهاية مطلوب")
        .min(
          Yup.ref("startDate"),
          "تاريخ النهاية يجب أن يكون بعد تاريخ البداية"
        ),
      hostId: Yup.number().required("الجهة المنظمة مطلوبة"),
      executorId: Yup.number().required("الجهة المنفذة مطلوبة"),
    }),
    onSubmit: async (values) => {
      await mutateAsync(values);
    },
  });
  console.log(formik.errors);
  return { formik, activityTypes, organizations, isPending };
};
