import ActivityForm from "@/components/ActivityForm";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityService } from "@/services/activity.service";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";

export default function EditActivityPage() {
  const [searchParams] = useSearchParams();
  const activityTypeId = searchParams.get("type");
  const { activityId } = useParams();
  const { data: activity, isLoading } = useQuery({
    queryKey: ["training-activity", { activityId }],
    queryFn: () => ActivityService.getActivityById(Number(activityId)),
  });
  return (
    <div className="w-full container mx-auto p-6">
      {isLoading ? (
        <Skeleton className="w-full h-96" />
      ) : activity ? (
        <ActivityForm
          type="edit"
          title="تعديل النشاط"
          activityTypeId={Number(activityTypeId)}
          activity={activity}
        />
      ) : (
        <p className="text-destructive">النشاط غير موجود</p>
      )}
    </div>
  );
}
