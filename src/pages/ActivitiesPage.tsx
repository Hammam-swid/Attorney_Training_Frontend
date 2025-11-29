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
import { PlusCircle, RotateCcw } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
import YearSelect from "@/components/ui/YearSelect";
import DatePicker from "@/components/ui/DatePicker";
import { useQuery } from "@tanstack/react-query";
import { ActivityService } from "@/services/activity-services";
import TableSkeleton from "@/components/TableSkeleton";
import Pagination from "@/components/ui/pagination";
import { getDifferenceDays } from "@/lib/getDifferenceDays";

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
  const [dateType, setDateType] = useState<"year" | "date">("year");
  const [year, setYear] = useState<number>();
  const [date, setDate] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined,
  });

  // console.log(activities);
  useEffect(() => {
    const getActivities = async () => {
      try {
        const res = await api.get(
          `/api/v1/training-activities/type/${typeId}?page=${page}&search=${search}${
            year
              ? `&year=${year}`
              : date.startDate && date.endDate
              ? `&startDate=${format(
                  date.startDate,
                  "yyyy-MM-dd"
                )}&endDate=${format(date.endDate, "yyyy-MM-dd")}`
              : ""
          }`
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
  }, [typeId, search, page, year, date.startDate, date.endDate]);

  const [status, setStatus] = useState("الكل");
  // console.log(type);

  const { data, isLoading } = useQuery({
    queryKey: [
      "activities",
      { typeId },
      { page },
      { status },
      { search },
      { year },
      { ...date },
    ],
    queryFn: () =>
      ActivityService.getActivities(
        typeId ?? 0,
        page,
        search,
        status,
        year,
        date.startDate && format(date.startDate, "yyyy-MM-dd"),
        date.endDate && format(date.endDate, "yyyy-MM-dd")
      ),
  });

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
      <div className="flex items-center justify-between gap-3 mb-4 mt-4">
        <Input
          className="w-96"
          placeholder="بحث"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-3 items-center">
          <Select
            dir="rtl"
            value={dateType}
            onValueChange={(v: "year" | "date") => {
              setDateType(v);
              setYear(undefined);
              setDate({
                startDate: undefined,
                endDate: undefined,
              });
            }}
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder={"اختر نوع الفلترة"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>نوع الفلترة</SelectLabel>
                <SelectItem value="year">فلترة بالسنة</SelectItem>
                <SelectItem value="date">فلترة بالتاريخ</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            {year && (
              <Button
                onClick={() => setYear(undefined)}
                variant="outline"
                size="icon"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            {dateType === "year" ? (
              <YearSelect setYear={setYear} year={year} />
            ) : (
              <div className="flex gap-2 items-center">
                <DatePicker
                  date={date.startDate}
                  setDate={(d) =>
                    setDate((prev) => ({ ...prev, startDate: d }))
                  }
                />
                <DatePicker
                  date={date.endDate}
                  setDate={(d) => setDate((prev) => ({ ...prev, endDate: d }))}
                  title="تاريخ النهاية"
                />
              </div>
            )}
          </div>
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
      </div>
      <div>
        <p className="text-end font-bold">
          {activities.length + (page - 1) * 10} \ {activityCount}
        </p>
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="*:text-right">
              <TableHead>ID</TableHead>
              <TableHead>عنوان النشاط</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>عدد الساعات</TableHead>
              <TableHead>عدد الأيام</TableHead>
              <TableHead>
                {activityType?.instructorName || "المدرب/المدربون"}
              </TableHead>
              <TableHead>عدد المتدربين</TableHead>

              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody dir="rtl">
            {isLoading ? (
              <TableSkeleton columns={13} />
            ) : (
              data?.activities
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
                      {getDifferenceDays(
                        new Date(activity.endDate),
                        new Date(activity.startDate)
                      )}{" "}
                      <span className="text-gray-500">يوم / أيام</span>
                    </TableCell>
                    <TableCell>
                      {activity.instructors
                        ?.map((instructor) => instructor.name)
                        .join("، ") || (
                        <span className="text-muted">لا يوجد مدربين</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!activity.traineesCount ? (
                        <span className="text-gray-400">لا يوجد متدربين</span>
                      ) : (
                        activity.traineesCount
                      )}
                    </TableCell>

                    <TableCell className="flex items-center justify-center gap-2">
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
                      <Button asChild size="sm">
                        <Link to={`/activities/${activity.id}`}>التفاصيل</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
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

        {/* <div className="flex items-center justify-center mt-4 gap-2">
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
        </div> */}
        <Pagination
          page={page}
          setPage={setPage}
          lastPage={Math.ceil(activityCount / 10)}
        />
      </div>
    </div>
  );
}
