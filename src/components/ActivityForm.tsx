import { Activity, Organization } from "@/types";
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
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { CalendarIcon, LoaderCircle, PlusCircle, Save, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import AddOrganizationForm from "./AddOrganizationForm";
import * as Yup from "yup";
import toast from "react-hot-toast";

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

interface OrganizationFormArgs {
  title: string;
  show: boolean;
  orgName?: string;
  hideForm: () => void;
  onSubmit: (
    values: { name: string },
    helpers: FormikHelpers<{ name: string }>
  ) => void;
}

export default function ActivityForm({
  hideForm,
  title,
  onSubmit,
  activity,
  activityTypeId,
}: props) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const res = await axios.get("/api/v1/organizations");
        if (res.status === 200) {
          setOrganizations(res.data.data.organizations);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getOrganizations();
  }, []);

  const [organizationForm, setOrganizationForm] =
    useState<OrganizationFormArgs>({
      title: "إضافة منظمة",
      show: false,
      hideForm: () => {},
      onSubmit: () => {},
    });
  const addNewOrganization = async (
    values: { name: string },
    helpers: FormikHelpers<{ name: string }>
  ) => {
    try {
      const res = await axios.post("/api/v1/organizations", values);
      if (res.status === 201) {
        setOrganizations([...organizations, res.data.data.organization]);
        setOrganizationForm({
          title: "",
          show: false,
          hideForm: () => {},
          onSubmit: () => {},
        });
        helpers.resetForm();
        toast.success("تمت الإضافة بنجاح");
      }
    } catch (error) {
      console.log(error);
    }
    console.log(values);
  };
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
      location: Yup.string().required("مكان الإقامة مطلوب"),
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
      <div className="bg-background rounded-md p-6">
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
          <Label htmlFor="location">مكان الإقامة</Label>
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
            <Popover>
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
                  selected={formik.values.startDate}
                  onSelect={(date) => {
                    formik.setFieldValue("startDate", date);
                    formik.setFieldTouched("startDate", true);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formik.touched.startDate && formik.errors.startDate && (
              <p className="text-sm text-destructive">
                {formik.errors.startDate as string}
              </p>
            )}
          </div>

          {/* تاريخ الانتهاء */}
          <Label htmlFor="endDate">تاريخ الانتهاء</Label>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant={"outline"}
                  className={cn(
                    "justify-start text-start",
                    !formik.values.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formik.values.endDate ? (
                    format(formik.values.endDate, "dd/MM/yyyy")
                  ) : (
                    <span>اختر تاريخ الانتهاء</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formik.values.endDate}
                  onSelect={(date) => {
                    formik.setFieldValue("endDate", date);
                    formik.setFieldTouched("endDate", true);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
                  formik.setFieldTouched("hostId", true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجهة المنظمة" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((organization) => (
                    <SelectItem
                      key={organization.id}
                      value={organization.id.toString()}
                    >
                      {organization.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() =>
                  setOrganizationForm({
                    title: "إضافة جهة جديدة",
                    show: true,
                    onSubmit: addNewOrganization,
                    hideForm: () => {
                      setOrganizationForm({
                        title: "إضافة جهة جديدة",
                        show: false,
                        onSubmit: () => {},
                        hideForm: () => {},
                      });
                    },
                  })
                }
                type="button"
              >
                <span>إضافة</span>
                <PlusCircle />
              </Button>
              <AddOrganizationForm
                hideForm={organizationForm.hideForm}
                show={organizationForm.show}
                title="إضافة جهة جديدة"
                onSubmit={organizationForm.onSubmit}
              />
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
              value={formik.values.executorId + ""}
              onValueChange={(value) => {
                formik.setFieldValue("executorId", +value);
                formik.setFieldTouched("executorId", true);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الجهة المنفذة" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((organization) => (
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
