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
import { format } from "date-fns";
import api from "@/lib/api";
import YearSelect from "@/components/ui/YearSelect";
import DatePicker from "@/components/ui/DatePicker";
import { useQuery } from "@tanstack/react-query";
import { ActivityService } from "@/services/activity.service";
import TableSkeleton from "@/components/TableSkeleton";
import Pagination from "@/components/ui/pagination";
import { getDifferenceDays } from "@/lib/getDifferenceDays";
import { useAppSelector } from "@/store/hooks";
import { useDispatch } from "react-redux";
import {
  setActivitiesDateType,
  setActivitiesEndDate,
  setActivitiesPage,
  setActivitiesSearch,
  setActivitiesStartDate,
  setActivitiesStatus,
  setActivitiesYear,
} from "@/store/activitiesSlice";
import { ActivityTypeService } from "@/services/actvitiy-type.service";
import { Badge } from "@/components/ui/badge";
import { parseActivityStatusClassName } from "@/lib/parseActivityStatus";

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
  const { page, search, status, year, date, dateType } = useAppSelector(
    (state) => state.activities
  );
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const typeId = searchParams.get("type");
  const [, setActivities] = useState<Activity[]>([]);
  const [searchText, setSearchText] = useState<string>(search);
  const [selectedActivityForTrainee, setSelectedActivityForTrainee] =
    useState<Activity | null>(null);
  const [selectedActivityForInstructor, setSelectedActivityForInstructor] =
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

  const { data: activityType } = useQuery({
    queryKey: ["activityType", { typeId }],
    queryFn: () => ActivityTypeService.getActivityType(Number(typeId) ?? 0),
  });

  // console.log(activities);

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setActivitiesSearch(searchText));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

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

  return (
    <div className="container pe-4 mx-auto py-10">
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
        {activityType && (
          <Button className="text-lg" asChild>
            <Link to={`add?typeId=${activityType?.id}`}>
              <span>إضافة جديد</span>
              <PlusCircle />
            </Link>
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 mb-4 mt-4">
        <Input
          className="w-96"
          placeholder="بحث"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="flex gap-3 items-center">
          <Select
            dir="rtl"
            value={dateType}
            onValueChange={(v: "year" | "date") => {
              dispatch(setActivitiesDateType(v));
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
                onClick={() => dispatch(setActivitiesYear(undefined))}
                variant="outline"
                size="icon"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            {dateType === "year" ? (
              <YearSelect
                setYear={(year) => dispatch(setActivitiesYear(year))}
                year={year}
              />
            ) : (
              <div className="flex gap-2 items-center">
                <DatePicker
                  date={date.startDate}
                  setDate={(d) => dispatch(setActivitiesStartDate(d))}
                />
                <DatePicker
                  date={date.endDate}
                  setDate={(d) => dispatch(setActivitiesEndDate(d))}
                  title="تاريخ النهاية"
                />
              </div>
            )}
          </div>
          <Select
            dir="rtl"
            value={status}
            onValueChange={(v) => dispatch(setActivitiesStatus(v))}
          >
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
        <Table dir="rtl">
          <TableHeader>
            <TableRow className="*:text-right">
              <TableHead>ID</TableHead>
              <TableHead>عنوان النشاط</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>عدد الساعات</TableHead>
              <TableHead>تاريخ البداية</TableHead>
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
            ) : data && data?.data.length > 0 ? (
              data?.data.map((activity) => (
                <TableRow dir="rtl" key={activity.id}>
                  <TableCell>{activity.id}</TableCell>
                  <TableCell dir="rtl">{activity.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={"outline"}
                      className={parseActivityStatusClassName(activity.status)}
                    >
                      {activity.status ?? "غير معروف"}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.hours}</TableCell>
                  <TableCell>
                    {format(new Date(activity.startDate), "yyyy-MM-dd")}
                  </TableCell>
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

                  <TableCell className="flex items-center gap-2">
                    {/* <ActivityActions
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
                    /> */}
                    <Button asChild size="sm">
                      <Link to={`/activities/${activity.id}`}>التفاصيل</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-inherit">
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  لا يوجد أنشطة تدريبية
                </TableCell>
              </TableRow>
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

        {selectedActivityForTrainee?.id && (
          <ActivityTraineesDialog
            activityId={selectedActivityForTrainee.id}
            activityName={selectedActivityForTrainee.title}
            onClose={() => setSelectedActivityForTrainee(null)}
            refresh={() => {
              // setSearch(" ");
              // setTimeout(() => {
              //   setSearch("");
              // }, 1);
            }}
          />
        )}
        {selectedActivityForInstructor?.id && (
          <InstructorActivityDialog
            activityId={selectedActivityForInstructor.id}
            activityName={selectedActivityForInstructor.title}
            onClose={() => setSelectedActivityForInstructor(null)}
            refresh={() => {
              // setSearch(" ");
              // setTimeout(() => {
              //   setSearch("");
              // }, 1);
            }}
          />
        )}

        {data && (
          <Pagination
            page={page}
            setPage={(p) => dispatch(setActivitiesPage(p))}
            lastPage={data?.lastPage}
          />
        )}
      </div>
    </div>
  );
}
