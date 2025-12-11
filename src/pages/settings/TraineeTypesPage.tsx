import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TraineeTypeService } from "@/services/trainee-types.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import TraineeTypeForm from "@/components/traineeTypes/TraineeTypeForm";
import ConfirmModal from "@/components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function TraineeTypesPage() {
  const { data: traineesTypes, isLoading } = useQuery({
    queryKey: ["trainee-types"],
    queryFn: TraineeTypeService.getTraineeTypes,
  });
  const queryClient = useQueryClient();
  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex flex-col gap-3">
          <CardTitle>أنواع المتدربين</CardTitle>
          <CardDescription>
            هنا يمكنك إضافة وتعديل أنواع المتدربين
          </CardDescription>
        </div>
        <TraineeTypeForm type="add">
          <Button>
            <PlusCircle />
            إضافة نوع جديد
          </Button>
        </TraineeTypeForm>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-20" />
              ))
            : traineesTypes?.map((type) => (
                <div
                  key={type.id}
                  className="p-4 border rounded-md flex items-center justify-between"
                >
                  <Link to={`/trainees?typeId=${type.id}`}>
                    <p className="font-semibold">{type.name}</p>
                    <p className="text-sm text-muted-foreground">
                      عدد المتدربين: {type.traineeCount}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2">
                    <TraineeTypeForm type="edit" traineeType={type}>
                      <Button variant="outline" size="icon">
                        <Pencil />
                      </Button>
                    </TraineeTypeForm>
                    <ConfirmModal
                      mutationKey={["delete-trainee-type", { id: type.id }]}
                      mutationFn={() =>
                        TraineeTypeService.deleteTraineeType(type.id)
                      }
                      title={`هل أنت متأكد من حذف نوع المتدرب ${type.name}؟`}
                      description={`هذا النوع سيتم حذفه نهائيًا`}
                      onSuccess={() => {
                        toast.success("تم حذف نوع المتدرب");
                        queryClient.invalidateQueries({
                          queryKey: ["trainee-types"],
                        });
                      }}
                      onError={() => {
                        toast.error("حدث خطأ أثناء حذف نوع المتدرب");
                      }}
                    >
                      <Button variant="destructive" size="icon">
                        <Trash />
                      </Button>
                    </ConfirmModal>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
