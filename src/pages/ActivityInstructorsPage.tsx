import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, Trash, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityService } from "@/services/activity.service";
import { useParams } from "react-router";
import AddInstructorToActivityDialog from "@/components/AddInstructorToActivityDialog";
import ConfirmModal from "@/components/common/ConfirmModal";
import InstructorRating from "@/components/activities/InstructorRating";

export default function ActivityInstructorsPage() {
  const { activityId } = useParams();
  const queryClient = useQueryClient();
  const { data: activity } = useQuery({
    queryKey: ["training-activity", { activityId }],
    queryFn: () => ActivityService.getActivityById(Number(activityId)),
  });

  const { data } = useQuery({
    queryKey: ["instructors", "for-activity", { activityId }],
    queryFn: () => ActivityService.getActivityInstructors(activityId as string),
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>قائمة المدربين الخاصة بـ{activity?.title}</CardTitle>
        {activityId && data && (
          <AddInstructorToActivityDialog
            activityId={activityId}
            oldInstructors={data}
          >
            <Button>
              <UserPlus />
              تعيين مدرب جديد للنشاط
            </Button>
          </AddInstructorToActivityDialog>
        )}
      </CardHeader>
      <CardContent>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المعرف</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell className="font-medium">{instructor.id}</TableCell>
                  <TableCell>{instructor.name}</TableCell>
                  <TableCell>
                    {instructor.rating ? (
                      instructor?.rating?.toFixed(2)
                    ) : (
                      <span className="text-gray-500">لا يوجد تقييم</span>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <InstructorRating instructor={instructor}>
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        <Star className="fill-yellow-500" />
                      </Button>
                    </InstructorRating>
                    <ConfirmModal
                      title={`هل أنت متأكد من إزالة المدرب "${instructor.name}"؟`}
                      mutationKey={["remove-instructor-from activity"]}
                      mutationFn={() =>
                        ActivityService.removeInstructorFromActivity(
                          String(activity?.id),
                          instructor.id
                        )
                      }
                      onSuccess={() => {
                        toast.success("تمت الإزالة بنجاح");
                        queryClient.invalidateQueries({
                          queryKey: ["instructors"],
                        });
                      }}
                      onError={() => {
                        toast.error("حدث خطأ أثناء تنفيذ العملية");
                      }}
                    >
                      <Button size={"icon"} variant={"destructive"}>
                        <Trash />
                      </Button>
                    </ConfirmModal>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
