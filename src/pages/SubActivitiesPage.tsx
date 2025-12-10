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
import { Move, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
// import jsLingua from "jslingua";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ActivityService } from "@/services/activity.service";
import TableSkeleton from "@/components/TableSkeleton";
import Pagination from "@/components/ui/pagination";
import { getDifferenceDays } from "@/lib/getDifferenceDays";
import { Badge } from "@/components/ui/badge";
import { parseActivityStatusClassName } from "@/lib/parseActivityStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MoveSubActivities from "@/components/activities/MoveSubActivities";

export default function SubActivitiesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const parentId = useParams().activityId;
  const [searchText, setSearchText] = useState<string>(search);
  const { data: parent } = useQuery({
    queryKey: ["training-activity", { activityId: parentId }],
    queryFn: () => ActivityService.getActivityById(Number(parentId)),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["activities", { parentId }, { page }, { search }],
    queryFn: () =>
      ActivityService.getActivities(
        null,
        page,
        search,
        undefined,
        undefined,
        undefined,
        undefined,
        Number(parentId) || undefined
      ),
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchText);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-3xl font-bold">
          قائمة الأنشطة الفرعية
        </CardTitle>

        <div className="flex items-center gap-4">
          <Button className="text-lg" asChild>
            <Link
              to={`/activities/add?parentId=${parentId}&typeId=${parent?.type.id}`}
            >
              <PlusCircle />
              <span>إضافة نشاط فرعي جديد</span>
            </Link>
          </Button>
          {parent && (
            <MoveSubActivities parent={parent}>
              <Button variant={"outline"} className="text-lg">
                <Move />
                <span>نقل نشاط</span>
              </Button>
            </MoveSubActivities>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3 mb-4 mt-4">
          <Input
            className="w-96"
            placeholder="بحث"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
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
                <TableHead>المدرب/المدربون</TableHead>
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
                        className={parseActivityStatusClassName(
                          activity.status
                        )}
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

          {data && (
            <Pagination
              page={page}
              setPage={setPage}
              lastPage={data?.lastPage}
              totalCount={data.totalCount}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
