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
import { PlusCircle } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// import jsLingua from "jslingua";
import { AxiosError } from "axios";
import { Activity, ActivityType } from "@/types";
import SureModal from "@/components/SureModal";
import { toast } from "react-hot-toast";
import ActivityForm from "@/components/ActivityForm";
import { FormikHelpers } from "formik";
import ActivityTraineesDialog from "@/components/ActivityTraineesDialog";
import InstructorActivityDialog from "@/components/InstructorActivityDialog";
import { Helmet } from "react-helmet";
import ActivityActions from "@/components/ActivityActions";
import RatingActivity from "@/components/RatingActivity";
import { format } from "date-fns";
import api from "@/lib/api";

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
  hours: number | undefined;
  startDate: Date;
  endDate: Date;
  hostId: number | undefined;
  executorId: number | undefined;
  activityTypeId: number;
}

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const typeId = searchParams.get("type");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [activityCount, setActivityCount] = useState<number>(0);
  const [selectedActivityForTrainee, setSelectedActivityForTrainee] =
    useState<Activity | null>(null);
  const [selectedActivityForInstructor, setSelectedActivityForInstructor] =
    useState<Activity | null>(null);
  const [selectedActivityForRating, setSelectedActivityForRating] =
    useState<Activity | null>(null);

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
        const res = await api.get(`/api/v1/activity-types/${typeId}`);
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
        const res = await api.get(
          `/api/v1/training-activities/type/${typeId}?page=${page}&search=${search}`
        );
        // console.log(res.data.data.activities);
        if (res.status === 200) {
          setActivities(
            res?.data.data.activities.map((activity: Activity) => ({
              id: activity.id,
              title: activity.title,
              status: activity.status,
              startDate: new Date(activity.startDate),
              endDate: new Date(activity.endDate),
              location: activity.location,
              instructors: activity.instructors,
              hours: activity.hours,
              rating: activity.rating,
              traineesCount: activity.traineesCount,
              host: activity.host,
              executor: activity.executor,
            }))
          );
          const count = res?.data?.data?.count;
          if (count !== activityCount) setActivityCount(count);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const handleRating = (activity: Activity) => {
    setSelectedActivityForRating(activity);
  };
  const deleteActivity = async (id: number) => {
    try {
      const res = await api.delete(`/api/v1/training-activities/${id}`);
      if (res.status === 204) {
        setActivities((prev) => prev.filter((activity) => activity.id !== id));
        toast.success("تم حذف النشاط بنجاح");
        setSureModal({
          description: <>تم حذف النشاط بنجاح</>,
          show: false,
          title: "",
          onCancel: () => {},
          onConfirm: () => {},
        });
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else toast.error("حدث خطأ أثناء حذف النشاط");
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
      onSubmit: async (values, helpers) => {
        try {
          const res = await api.patch(
            `/api/v1/training-activities/${activity.id}`,
            values
          );
          if (res.status === 200) {
            console.log(res);
            toast.success("تم تعديل النشاط بنجاح");
            helpers.resetForm();
            setActivityForm({
              ...activityForm,
              show: false,
              title: "",
              activity: undefined,
              onSubmit: () => {},
              hideForm: () => {},
            });
            const newActivity = {
              ...res.data.data.activity,
              startDate: new Date(res.data.data.activity.startDate),
              endDate: new Date(res.data.data.activity.endDate),
              hostName: res.data.data.activity.host?.name || activity.host.name,
              executorName:
                res.data.data.activity.executor?.name || activity.executor.name,
            };
            setActivities((prev) =>
              prev.map((act) => (act.id === activity.id ? newActivity : act))
            );
          }
        } catch (error) {
          console.log(error);
          if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
          } else toast.error("حدث خطأ أثناء تعديل النشاط");
        }
      },
    });
  };
  const handleDelete = (activity: Activity) =>
    setSureModal({
      description: (
        <p>
          هل أنت متأكد من حذف{" "}
          <span className="font-bold">{activity.title}</span>؟
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
    });

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
          const res = await api.post("/api/v1/training-activities", values);
          if (res.status === 201) {
            toast.success("تمت إضافة نشاط تدريبي بنجاح");
            helpers.resetForm();
            const newActivity = {
              ...res.data.data.activity,
              startDate: new Date(res.data.data.activity.startDate),
              endDate: new Date(res.data.data.activity.endDate),
            };
            setActivities((prev) => [newActivity, ...prev]);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            toast.error(error?.response?.data.message);
          } else toast.error("حدث خطأ أثناء عملية الإضافة");
        }
      },
    });
  };

  const updateRating = (activityId: number, rating: number) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId ? { ...activity, rating: rating } : activity
      )
    );
  };
  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>إدارة التدريب | {activityType?.name || ""}</title>
        <meta
          name="description"
          content={`إدارة كل الأنشطة التدريبية من نوع ${activityType?.name}`}
        />
      </Helmet>
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
        <Select dir="rtl" value={status} onValueChange={setStatus}>
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
        <p className="text-end font-bold">
          {activities.length + (page - 1) * 10} \ {activityCount}
        </p>
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="*:text-right">
              <TableHead>معرف النشاط</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>عدد الساعات</TableHead>
              <TableHead>تاريخ البداية</TableHead>
              <TableHead>تاريخ النهاية</TableHead>
              <TableHead>مكان الانعقاد</TableHead>
              <TableHead>
                {activityType?.instructorName || "المدرب/المدربون"}
              </TableHead>
              {activityType?.isHaveRating && (
                <TableHead>تقييم المدرب/المدربين</TableHead>
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
                  <TableCell dir="rtl">{activity.title}</TableCell>
                  <TableCell>{activity.status}</TableCell>
                  <TableCell>{activity.hours}</TableCell>
                  <TableCell>
                    {format(activity.startDate, "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(activity.endDate, "dd-MM-yyyy")}
                  </TableCell>
                  <TableCell>{activity.location}</TableCell>
                  <TableCell>
                    {activity.instructors
                      ?.map((instructor) => instructor.name)
                      .join("، ") || (
                      <span className="text-muted">لا يوجد مدربين</span>
                    )}
                  </TableCell>
                  {activityType?.isHaveRating && (
                    <TableCell>
                      {activity.instructors
                        ?.map((i) => i.rating)
                        .map((i) => (!i ? "//" : i))
                        ?.join("، ") || (
                        <span className="text-muted">لا يوجد تقييم</span>
                      )}
                    </TableCell>
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
                  <TableCell className="flex items-center justify-center">
                    <ActivityActions
                      activityId={activity.id}
                      handleDelete={() => handleDelete(activity)}
                      handleEdit={() => handleEdit(activity)}
                      handleInstructors={() =>
                        setSelectedActivityForInstructor(activity)
                      }
                      handleTrainees={() =>
                        setSelectedActivityForTrainee(activity)
                      }
                      handleRating={() => handleRating(activity)}
                    />
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
            activityTypeId={typeId ? +typeId : 0}
            activity={activityForm.activity}
          />
        )}
        {selectedActivityForRating?.id && (
          <RatingActivity
            updateRating={updateRating}
            activity={selectedActivityForRating}
            onCancel={() => setSelectedActivityForRating(null)}
          />
        )}

        {selectedActivityForTrainee?.id && (
          <ActivityTraineesDialog
            activityId={selectedActivityForTrainee.id}
            activityName={selectedActivityForTrainee.title}
            onClose={() => setSelectedActivityForTrainee(null)}
            refresh={() => {
              setSearch(" ");
              setTimeout(() => {
                setSearch("");
              }, 1);
            }}
          />
        )}
        {selectedActivityForInstructor?.id && (
          <InstructorActivityDialog
            activityId={selectedActivityForInstructor.id}
            activityName={selectedActivityForInstructor.title}
            onClose={() => setSelectedActivityForInstructor(null)}
            refresh={() => {
              setSearch(" ");
              setTimeout(() => {
                setSearch("");
              }, 1);
            }}
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
          <Button
            disabled={activities.length + (page - 1) * 10 >= activityCount}
            onClick={() => handlePage("next")}
            variant={"ghost"}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
