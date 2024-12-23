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
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// import jsLingua from "jslingua";
import axios from "axios";

interface Instructor {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Activity {
  id: number;
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
  location: string;
  instructors: Instructor[];
  hours: number;
  traineesCount: number;
  host: string;
  executor: string;
}

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  // console.log(activities);
  useEffect(() => {
    const getActivities = async () => {
      try {
        const res = await axios.get(
          `/api/v1/training-activities/type/${type}?page=${page}&search=${search}`
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
  }, [type, search, page]);

  const [status, setStatus] = useState("الكل");
  // console.log(type);
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{"الأنشطة التدريبية"}</h1>
        <Button className="text-lg">
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
              <TableHead>المدرب/المدربون</TableHead>
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
                  <TableCell>
                    {!activity.traineesCount ? (
                      <span className="text-gray-400">لا يوجد متدربين</span>
                    ) : (
                      activity.traineesCount
                    )}
                  </TableCell>
                  <TableCell>{activity.host}</TableCell>
                  <TableCell>{activity.executor}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant={"secondary"}>تعديل</Button>
                    <Button variant={"destructive"}>حذف</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
