import ActivityForm from "@/components/ActivityForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDifferenceDays } from "@/lib/getDifferenceDays";
import { parseActivityStatusClassName } from "@/lib/parseActivityStatus";
import { ActivityService } from "@/services/activity.service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { ReactNode } from "react";
import { useParams } from "react-router";

export default function ActivityDetailsPage() {
  const { activityId } = useParams();
  const { data: activity, isLoading } = useQuery({
    queryKey: ["training-activity", { activityId }],
    queryFn: () => ActivityService.getActivityById(Number(activityId)),
  });
  return (
    <div className="p-6 space-y-6 w-full">
      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-3">
            {isLoading ? (
              <Skeleton className="h-8 w-96 rounded-full" />
            ) : (
              <>
                {activity?.title}
                <Badge
                  variant={"outline"}
                  className={parseActivityStatusClassName(
                    activity?.status as string
                  )}
                >
                  {activity?.status ?? "غير معروف"}
                </Badge>
              </>
            )}
          </CardTitle>
          {activity && (
            <ActivityForm
              activityTypeId={activity?.type.id}
              title="تعديل النشاط"
              type="edit"
              activity={activity}
            >
              <Button>
                <Pencil />
                تعديل
              </Button>
            </ActivityForm>
          )}
        </CardHeader>
        {isLoading ? (
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        ) : (
          activity && (
            <CardContent className="space-y-4">
              <Info title="نوع النشاط">{activity.type.name}</Info>
              <Info title="عدد المتدربين">
                {!activity.traineesCount ? (
                  <span className="text-gray-500">لا يوجد متدربين</span>
                ) : (
                  activity.traineesCount
                )}
              </Info>
              <Info title="المدربين">
                {activity.instructors
                  ?.map((instructor) => instructor.name)
                  .join("، ") || (
                  <span className="text-gray-500">لا يوجد مدربين</span>
                )}
              </Info>
              <Info title="مكان الانعقاد">{activity.location}</Info>
              <Info title="تاريخ البداية">
                {format(activity.startDate, "yyyy-MM-dd")}
              </Info>
              <Info title="تاريخ النهاية">
                {format(activity.endDate, "yyyy-MM-dd")}
              </Info>
              <Info title="عدد الأيام">
                {getDifferenceDays(
                  new Date(activity.endDate),
                  new Date(activity.startDate)
                )}{" "}
                <span className="text-gray-500">يوم / أيام</span>
              </Info>
              <Info title="عدد الساعات">
                {activity.hours}{" "}
                <span className="text-gray-500">ساعة / ساعات</span>
              </Info>
              <Info title="الجهة المنظمة">{activity.host.name}</Info>
              <Info title="الجهة المنفذة">{activity.executor.name}</Info>
              <Info title="تقييم النشاط">
                {activity.rating ?? (
                  <span className="text-gray-500">لا يوجد تقييم</span>
                )}
              </Info>
            </CardContent>
          )
        )}
      </Card>
    </div>
  );
}

interface InfoProps {
  title: string;
  children: ReactNode;
  description?: string;
}

function Info({ title, children, description }: InfoProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-semibold">
        {title}
        {description && (
          <span className="text-gray-400 text-xs">(description)</span>
        )}
        :{" "}
      </span>
      <span>{children}</span>
    </div>
  );
}
