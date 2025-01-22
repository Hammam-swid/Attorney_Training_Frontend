import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity } from "@/types";
import axios from "axios";
import { Download } from "lucide-react";
import { useLayoutEffect, useState } from "react";

const allFields = [
  { label: "العنوان", value: "title" },
  { label: "عدد الساعات", value: "hours" },
  { label: "مكان الانعقاد", value: "location" },
  { label: "الحالة", value: "status" },
  { label: "النوع", value: "type" },
  { label: "تاريخ البداية", value: "startDate" },
  { label: "تاريخ النهاية", value: "endDate" },
  { label: "الجهة المنفذة", value: "executor" },
  { label: "الجهة المنظمة", value: "host" },
  { label: "المدربون", value: "instructors" },
  { label: "تقييم المدربين", value: "instructorRatings" },
  { label: "عدد المتدربين", value: "trainees" },
  { label: "تقييم النشاط", value: "rating" },
];

export default function OrganizationActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"executed" | "hosted" | "">("");
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));

  useLayoutEffect(() => {
    const fetchActivities = async () => {
      const res = await axios.get(
        `/api/v1/reports/organizations/activities${
          search ? `?search=${search}` : ""
        }${type ? `&type=${type}` : ""}`
      );
      setActivities(res.data.data.activities);
    };
    fetchActivities();
  }, [type, search]);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="ابحث عن جهة"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          className="w-[300px]"
        />

        <Button>
          <span>تصدير</span>
          <Download />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">ت. </TableHead>
            {allFields
              .filter((f) => fields.includes(f.value))
              .map((f) => (
                <TableHead key={f.value} className="text-right">
                  {f.label}
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity, index) => (
            <TableRow key={activity.id}>
              <TableCell className="text-right">{index + 1}</TableCell>
              {allFields
                ?.filter((field) => fields.includes(field.value))
                ?.map((field) => (
                  <TableCell key={field.value}>
                    {field.value === "title"
                      ? activity[field.value]
                      : field.value === "hours"
                      ? activity[field.value] + " ساعة"
                      : field.value === "location"
                      ? activity[field.value]
                      : field.value === "status"
                      ? activity[field.value]
                      : field.value === "startDate"
                      ? new Date(activity[field.value]).toLocaleDateString()
                      : field.value === "endDate"
                      ? new Date(activity[field.value]).toLocaleDateString()
                      : field.value === "type"
                      ? activity?.type?.name
                      : field.value === "rating"
                      ? activity?.rating || (
                          <span className="text-gray-400 dark:text-gray-600">
                            لا يوجد تقييم
                          </span>
                        )
                      : field.value === "executor"
                      ? activity?.executor?.name
                      : field.value === "host"
                      ? activity?.host?.name
                      : field.value === "instructors"
                      ? activity?.instructors
                          ?.map((instructor) => instructor.name)
                          ?.join(", ") || (
                          <span className="text-gray-400 dark:text-gray-600">
                            لا يوجد مدربين
                          </span>
                        )
                      : field.value === "instructorRatings"
                      ? activity.instructors
                          ?.map((instructor) => instructor.rating)
                          ?.join(", ") || (
                          <span className="text-gray-400 dark:text-gray-600">
                            لا يوجد تقييمات
                          </span>
                        )
                      : field.value === "trainees"
                      ? activity?.traineesCount || (
                          <span className="text-gray-400 dark:text-gray-600">
                            لا يوجد متدربين
                          </span>
                        )
                      : null}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
