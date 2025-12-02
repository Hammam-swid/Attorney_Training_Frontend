import { Activity } from "@/types";
import { FormikHelpers, useFormik } from "formik";
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
import { LoaderCircle, PlusCircle, Save, X } from "lucide-react";
import OrganizationForm from "./OrganizationForm";
import * as Yup from "yup";

import DatePicker from "./ui/DatePicker";
import { useAppSelector } from "@/store/hooks";
import { useQuery } from "@tanstack/react-query";
import { OrganizationService } from "@/services/organization.service";

interface FormValues {
  title: string;
  location: string;
  hours: number | undefined;
  startDate: Date;
  endDate: Date;
  hostId: number | undefined;
  executorId: number | undefined;
  activityTypeId: number;
}

interface props {
  title: string;
  show: boolean;
  hideForm: () => void;
  onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void;
  activity?: Activity;
  activityTypeId: number;
}

export default function ActivityForm({
  hideForm,
  title,
  onSubmit,
  activity,
  activityTypeId,
}: props) {
  const activityTypes = useAppSelector((state) => state.ui.activityTypes);
  const { data: organizations } = useQuery({
    queryKey: ["all-organizations"],
    queryFn: OrganizationService.getAllOrganization,
  });

  const formik = useFormik({
    initialValues: {
      title: activity?.title || "",
      location: activity?.location || "",
      hours: activity?.hours || undefined,
      startDate: activity?.startDate || new Date(),
      endDate: activity?.endDate || new Date(),
      hostId: activity?.host.id || undefined,
      executorId: activity?.executor.id || undefined,
      activityTypeId: activityTypeId,
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
    onSubmit: onSubmit,
  });
  return (
    <div
      id="activity-form-overlay"
      onClick={(
        e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
          target: HTMLDivElement;
        }
      ) => (e.target.id === "activity-form-overlay" ? hideForm() : undefined)}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl z-50"
    >
      <div className="bg-background max-h-[80vh] overflow-y-scroll rounded-md p-6">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4 w-96"
        >
          <h3 className="text-lg text-center font-bold mb-4">{title}</h3>
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
          {/* تاريخ البدء */}
          <Label htmlFor="startDate">تاريخ البدء</Label>
          <div>
            {/* <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant={"outline"}
                  className={cn(
                    "justify-start text-start",
                    !formik.values.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formik.values.startDate ? (
                    format(formik.values.startDate, "dd/MM/yyyy")
                  ) : (
                    <span>اختر تاريخ البداية</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  onDayBlur={() => formik.setFieldTouched("startDate", true)}
                  modifiersStyles={{
                    today: { backgroundColor: "var(--background)" },
                  }}
                  selected={formik.values.startDate}
                  onSelect={(date) => {
                    formik.setFieldValue("startDate", date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover> */}
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

          <Label htmlFor="hostId">الجهة المنظمة</Label>
          <div>
            <div className="flex gap-2">
              <Select
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
                dir="rtl"
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
          <label>نوع النشاط</label>
          <div>
            <Select
              value={formik.values.activityTypeId + ""}
              onValueChange={(value) => {
                formik.setFieldValue("activityTypeId", +value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع النشاط" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row-reverse gap-2">
            <Button disabled={formik.isSubmitting} type="submit">
              {!formik.isSubmitting ? (
                <>
                  <span>حفظ</span>
                  <Save />
                </>
              ) : (
                <LoaderCircle className="animate-spin" />
              )}
            </Button>
            <Button
              className="hover:text-red-500"
              variant={"outline"}
              type="button"
              onClick={hideForm}
            >
              <span>إلغاء</span>
              <X />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
