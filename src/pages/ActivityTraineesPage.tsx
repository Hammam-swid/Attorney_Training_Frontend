import TraineeRating from "@/components/activities/TraineeRating";
import AddTraineesToActivityDialog from "@/components/AddTraineesToActivityDialog";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSkeleton from "@/components/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityService } from "@/services/activity.service";
import { Trainee } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router";

export default function ActivityTraineesPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<Trainee | null>(null);
  const { activityId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["trainees", { activityId }],
    queryFn: () => ActivityService.getActivityTrainees(activityId!),
  });

  const [search, setSearch] = useState<string>("");
  const [selectRating, setSelectRating] = useState<number>();

  console.log(data?.traineesForActivity);
  const { activity } = data || {};
  const trainees =
    (data?.traineesForActivity.map((t) => ({
      ...t.trainee,
      rating: t.rating,
      payGrade: t.traineePayGrade || t.trainee.payGrade,
      employer: t.traineeEmployer || t.trainee.employer,
      type: t.trainee.traineeType.name,
      isChangedEmployer:
        t.traineeEmployer && t.traineeEmployer !== t.trainee.employer,
      isChangedPayGrade:
        t.traineePayGrade && t.traineePayGrade !== t.trainee.payGrade,
    })) as Trainee[]) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة المتدربين الخاصة بــ{activity?.title}</CardTitle>
        <CardDescription>
          هنا يتم عرض كل المتدربين الخاصين بهذا النشاط
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-center justify-between mb-4">
          <Input
            placeholder="بحث"
            className="w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AddTraineesToActivityDialog
            activityId={activityId!}
            oldTrainees={trainees}
          >
            <Button variant={"default"}>
              <span>إدراج متدرب للنشاط</span>
            </Button>
          </AddTraineesToActivityDialog>
        </div>
        <Table className="max-h-96 mx-auto overflow-y-scroll ">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المعرف</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الدرجة القضائية</TableHead>
              <TableHead className="text-right">جهة العمل</TableHead>
              <TableHead className="text-right">التقييم</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-hidden max-h-96">
            {isLoading ? (
              <TableSkeleton columns={6} />
            ) : (
              trainees
                ?.filter((trainee) => {
                  if (!search) return true;
                  return trainee.name
                    .toLowerCase()
                    .includes(search.toLowerCase());
                })
                .map((trainee) => (
                  <TableRow key={trainee?.id}>
                    <TableCell className="font-medium">{trainee?.id}</TableCell>
                    <TableCell>{trainee?.name}</TableCell>
                    <TableCell>{trainee?.type}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {trainee?.payGrade || "//"}
                        {trainee.isChangedPayGrade && (
                          <Badge
                            variant={"outline"}
                            className="bg-yellow-600/20 text-yellow-600"
                          >
                            تم تغيير الدرجة
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {trainee?.employer || "//"}
                        {trainee.isChangedEmployer && (
                          <Badge
                            variant={"outline"}
                            className="bg-yellow-600/20 text-yellow-600"
                          >
                            منتقل
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    {/* <TableCell>{trainee?.type}</TableCell> */}
                    <TableCell>
                      {!isEditing || isEditing?.id !== trainee?.id ? (
                        trainee?.rating ? (
                          trainee?.rating?.toFixed(2)
                        ) : (
                          <span className="text-gray-500">لا يوجد تقييم</span>
                        )
                      ) : (
                        <span className="relative">
                          <Input
                            inputMode="numeric"
                            className="w-20"
                            value={selectRating}
                            onChange={(e) =>
                              setSelectRating(
                                e.target.value as unknown as number
                              )
                            }
                          />
                          <Button
                            size={"icon"}
                            variant={"ghost"}
                            className="absolute left-0 top-0"
                            onClick={() => setIsEditing(null)}
                          >
                            <X />
                          </Button>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TraineeRating trainee={trainee}>
                          <Button size={"icon"} variant="outline">
                            <Star className="fill-yellow-500" />
                          </Button>
                        </TraineeRating>

                        <ConfirmModal
                          mutationKey={[
                            "remove-trainee-from-activity",
                            { traineeId: trainee.id },
                          ]}
                          mutationFn={() =>
                            ActivityService.removeTraineeFromActivity(
                              activityId!,
                              trainee.id
                            )
                          }
                          title={`هل أنت متأكد من إزالة "${trainee.name}"؟`}
                          onSuccess={() => {
                            queryClient.invalidateQueries({
                              queryKey: ["trainees", { activityId }],
                            });
                            toast.success("تم حذف المتدرب بنجاح");
                          }}
                          onError={() => {
                            toast.error("حدث خطأ أثناء حذف المتدرب");
                          }}
                        >
                          <Button
                            className="hover:bg-destructive hover:text-destructive-foreground"
                            size="icon"
                            variant="outline"
                            // onClick={() => deleteTrainee(trainee)}
                          >
                            <Trash />
                          </Button>
                        </ConfirmModal>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
