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
import { LoaderCircle, PlusCircle, Save, X } from "lucide-react";

interface FormValues {
  title: string;
  location: string;
  hours: number;
  startDate: Date;
  endDate: Date;
  hostId: number;
  executorId: number;
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
  const formik = useFormik({
    initialValues: {
      title: activity?.name || "",
      location: activity?.location || "",
      hours: activity?.hours || 0,
      startDate: activity?.startDate || new Date(),
      endDate: activity?.endDate || new Date(),
      hostId: activity?.host.id || 0,
      executorId: activity?.executor.id || 0,
      activityTypeId: activityTypeId,
    },
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
          <Input
            id="title"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
          />
          <Label htmlFor="hours">عدد الساعات</Label>
          <Input
            id="hours"
            name="hours"
            value={formik.values.hours}
            onChange={formik.handleChange}
          />
          <Label htmlFor="location">مكان الإقامة</Label>
          <Input
            id="location"
            name="location"
            value={formik.values.location}
            onChange={formik.handleChange}
          />
          <Label htmlFor="startDate">تاريخ البدء</Label>
          <Input type="date" id="startDate" name="startDate" />

          <Label htmlFor="endDate">تاريخ الانتهاء</Label>
          <Input type="date" id="endDate" name="endDate" />

          <Label htmlFor="hostId">الجهة المنظمة</Label>
          <div className="flex gap-2">
            <Select
              value={formik.values.hostId + ""}
              onValueChange={(value) => formik.setFieldValue("hostId", +value)}
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
            <Button type="button">
              <span>إضافة</span>
              <PlusCircle />
            </Button>
          </div>
          <Label htmlFor="executorId">الجهة المنفذة</Label>
          <Select
            value={formik.values.executorId + ""}
            onValueChange={(value) =>
              formik.setFieldValue("executorId", +value)
            }
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
