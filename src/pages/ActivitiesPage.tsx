import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// import jsLingua from "jslingua";
import axios from "axios";
import { Activity, ActivityType } from "@/types";
import SureModal from "@/components/SureModal";
import { toast } from "react-toastify";
import ActivityForm from "@/components/ActivityForm";
import { FormikHelpers } from "formik";

interface SureModalType {
  title: string;
  description: ReactElement;
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

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

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const typeId = searchParams.get("type");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [activityType, setActivityType] = useState<ActivityType | null>(null);

  const [sureModal, setSureModal] = useState<SureModalType>({
    title: "",
    show: false,
    description: <></>,
    onCancel: () => {},
    onConfirm: () => {},
  });

  const [activityForm, setActivityForm] = useState<{
    show: boolean;
    title: string;
    activity?: Activity;
    onSubmit: (values: FormValues, helpers: FormikHelpers<FormValues>) => void;
    hideForm: () => void;
    activityTypeId: number;
  }>({
    show: false,
    title: "",
    activity: undefined,
    onSubmit: () => {},
    hideForm: () => {},
    activityTypeId: typeId ? +typeId : 0,
  });

  useEffect(() => {
    const getType = async () => {
      try {
        const res = await axios.get(`/api/v1/activity-types/${typeId}`);
        if (res.status === 200) {
          setActivityType(res.data.data.type);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getType();
  }, [typeId]);

  // console.log(activities);
  useEffect(() => {
    const getActivities = async () => {
      try {
        const res = await axios.get(
          `/api/v1/training-activities/type/${typeId}?page=${page}&search=${search}`
        );
        // console.log(res.data.data.activities);
        if (res.status === 200)
          setActivities(
            res?.data.data.activities.map((activity: Activity) => ({
              id: activity.id,
              name: activity.name,
              status: activity.status,
              startDate: new Date(activity.startDate),
              endDate: new Date(activity.endDate),
              location: activity.location,
              instructors: activity.instructors,
              hours: activity.hours,
              traineesCount: activity.traineesCount,
              host: activity.host,
              executor: activity.executor,
            }))
          );
      } catch (error) {
        console.log(error);
      }
    };
    getActivities();
  }, [typeId, search, page]);

  const [status, setStatus] = useState("الكل");
  // console.log(type);

  const handlePage = (type: string) => {
    if (type === "prev") {
      setPage((prev) => prev - 1);
    } else if (type === "next") {
      setPage((prev) => prev + 1);
    }
  };
  const deleteActivity = async (id: number) => {
    try {
      const res = await axios.delete(`/api/v1/training-activities/${id}`);
      if (res.status === 200) {
        setActivities((prev) => prev.filter((activity) => activity.id !== id));
        toast.success("تم حذف النشاط بنجاح");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleEdit = (activity: Activity) => {
    setActivityForm({
      ...activityForm,
      show: true,
      title: "تعديل النشاط",
      activity: activity,
      hideForm: () =>
        setActivityForm({
          ...activityForm,
          show: false,
          title: "",
          activity: undefined,
          onSubmit: () => {},
          hideForm: () => {},
        }),
      onSubmit: () => {},
    });
  };

  const handleAdd = () => {
    setActivityForm({
      ...activityForm,
      show: true,
      title: "إضافة نشاط جديد",
      activity: undefined,
      hideForm: () =>
        setActivityForm({
          ...activityForm,
          show: false,
          title: "",
          activity: undefined,
          onSubmit: () => {},
          hideForm: () => {},
        }),
      onSubmit: async (values, helpers) => {
        console.log(values);
        try {
          const res = await axios.post("/api/v1/training-activities", values);
          if (res.status === 201) {
            toast.success("تمت إضافة نشاط تدريبي بنجاح");
            helpers.resetForm();
          }
        } catch (error) {
          console.log(error);
          toast.error("حدث خطأ أثناء عملية الإضافة");
        }
      },
    });
  };
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">
          {activityType?.name || "الأنشطة التدريبية"}
        </h1>
        <Button onClick={handleAdd} className="text-lg">
          <span>إضافة جديد</span>
          <PlusCircle />
        </Button>
      </div>
      <div className="flex items-center justify-between mb-4 mt-4">
        <Input
          className="w-96"
          placeholder="بحث"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>الحالة</SelectLabel>
              <SelectItem value="الكل">الكل</SelectItem>
              <SelectItem value="نشطة">نشطة</SelectItem>
              <SelectItem value="مكتملة">مكتملة</SelectItem>
              <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="*:text-right">
              <TableHead>معرف النشاط</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>عدد الساعات</TableHead>
              <TableHead>تاريخ البداية</TableHead>
              <TableHead>تاريخ النهاية</TableHead>
              <TableHead>مكان الإقامة</TableHead>
              <TableHead>
                {activityType?.instructorName || "المدرب/المدربون"}
              </TableHead>
              {activityType?.isHaveRating && (
                <TableHead>تقييم المدرب</TableHead>
              )}
              <TableHead>عدد المتدربين</TableHead>
              <TableHead>الجهة المنظمة</TableHead>
              <TableHead>الجهة المنفذة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody dir="rtl">
            {activities
              .filter(
                (activity) => status === "الكل" || status === activity.status
              )
              .map((activity) => (
                <TableRow dir="rtl" key={activity.id}>
                  <TableCell>{activity.id}</TableCell>
                  <TableCell dir="rtl">{activity.name}</TableCell>
                  <TableCell>{activity.status}</TableCell>
                  <TableCell>{activity.hours}</TableCell>
                  <TableCell>
                    {activity.startDate.toLocaleString(undefined, {
                      day: "2-digit",
                      year: "numeric",
                      month: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {activity.endDate.toLocaleString(undefined, {
                      day: "2-digit",
                      year: "numeric",
                      month: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{activity.location}</TableCell>
                  <TableCell>
                    {activity.instructors
                      ?.map((instructor) => instructor.name)
                      .join("/")}
                  </TableCell>
                  {activityType?.isHaveRating && (
                    <TableCell>{activity.instructorRating}</TableCell>
                  )}
                  <TableCell>
                    {!activity.traineesCount ? (
                      <span className="text-gray-400">لا يوجد متدربين</span>
                    ) : (
                      activity.traineesCount
                    )}
                  </TableCell>
                  <TableCell>{activity.host.name}</TableCell>
                  <TableCell>{activity.executor.name}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(activity)}
                      variant={"secondary"}
                    >
                      <span>تعديل</span>
                      <Pencil />
                    </Button>
                    <Button
                      onClick={() =>
                        setSureModal({
                          description: (
                            <p>
                              هل أنت متأكد من حذف{" "}
                              <span className="font-bold">{activity.name}</span>
                              ؟
                            </p>
                          ),
                          title: "حذف نشاط",
                          show: true,
                          onConfirm: () => deleteActivity(activity.id),
                          onCancel: () =>
                            setSureModal({
                              show: false,
                              description: <></>,
                              title: "",
                              onConfirm: () => {},
                              onCancel: () => {},
                            }),
                        })
                      }
                      variant={"destructive"}
                    >
                      <span>حذف</span>
                      <Trash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <SureModal
          title={sureModal.title}
          description={sureModal.description}
          show={sureModal.show}
          onConfirm={sureModal.onConfirm}
          onCancel={sureModal.onCancel}
        />

        {activityForm.show && (
          <ActivityForm
            hideForm={activityForm.hideForm}
            onSubmit={activityForm.onSubmit}
            title={activityForm.title}
            show={activityForm.show}
            activityTypeId={activityForm.activityTypeId}
            activity={activityForm.activity}
          />
        )}

        <div className="flex items-center justify-center mt-4 gap-2">
          <Button
            onClick={() => handlePage("prev")}
            disabled={page <= 1}
            variant={"ghost"}
          >
            السابق
          </Button>
          <Button onClick={() => handlePage("next")} variant={"ghost"}>
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
