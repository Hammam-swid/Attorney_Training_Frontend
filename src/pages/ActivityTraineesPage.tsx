import AddTraineesToActivityDialog from "@/components/AddTraineesToActivityDialog";
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
import api from "@/lib/api";
import { Activity, Trainee } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Trash, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router";

interface TraineeForActivity {
  id: number;
  rating: number;
  trainee: Trainee;
}

const getTrainees = async (id: string) => {
  const res = await api.get<{
    data: { activity: Activity; traineesForActivity: TraineeForActivity[] };
  }>(`/api/v1/training-activities/${id}/trainee`);
  return res.data.data;
};

export default function ActivityTraineesPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<Trainee | null>(null);
  const { activityId } = useParams();
  const { data } = useQuery({
    queryKey: ["trainees", { activityId }],
    queryFn: () => getTrainees(activityId!),
  });
  const [addTrainee, setAddTrainee] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectRating, setSelectRating] = useState<number>();

  console.log(data?.traineesForActivity);
  const { activity } = data || {};
  const trainees =
    data?.traineesForActivity.map((t) => ({
      ...t.trainee,
      rating: t.rating,
    })) || [];

  const deleteTrainee = async (trainee: Trainee) => {
    try {
      const res = await api.delete(
        `/api/v1/training-activities/${activityId}/trainee`,
        { data: { traineeId: trainee?.id } }
      );
      if (res.status === 204) {
        queryClient.invalidateQueries({
          queryKey: ["trainees", { activityId }],
        });
        toast.success("تم حذف المتدرب بنجاح");
      }
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء حذف المتدرب");
    }
  };

  const rateTrainee = async (trainee: Trainee, rating: number) => {
    try {
      const res = await api.post(
        `/api/v1/training-activities/${activityId}/trainee/rate`,
        { traineeId: trainee?.id, rating: rating }
      );
      if (res.status === 200) {
        queryClient.invalidateQueries({
          queryKey: ["trainees", { activityId }],
        });
        console.log(res);
        toast.success("تم تقييم المتدرب بنجاح");
      }
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء تقييم المتدرب");
    }
  };
  return (
    <div className="p-6 w-full">
      <div>
        {addTrainee && (
          <AddTraineesToActivityDialog
            activityId={activityId!}
            hide={() => setAddTrainee(false)}
            oldTrainees={trainees}
          />
        )}
        <h1 className="text-2xl font-bold text-right mb-4">
          قائمة المتدربين الخاصة بــ{activity?.title}
        </h1>
        <div className="flex gap-2 items-center justify-between mb-4">
          <Input
            placeholder="بحث"
            className="w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant={"default"}
            onClick={() => {
              setIsEditing(null);
              setSelectRating(0);
              setAddTrainee(true);
            }}
            className="text-lg font-bold"
            size={"lg"}
          >
            <span>إضافة متدرب</span>
          </Button>
        </div>
        <Table className="max-h-96 mx-auto overflow-y-scroll ">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المعرف</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              {/* <TableHead className="text-right">العنوان</TableHead> */}
              <TableHead className="text-right">جهة العمل</TableHead>
              {/* <TableHead className="text-right">النوع</TableHead> */}
              <TableHead className="text-right">التقييم</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-hidden max-h-96">
            {trainees
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
                  <TableCell>{trainee?.phone}</TableCell>
                  {/* <TableCell>{trainee?.address}</TableCell> */}
                  <TableCell>{trainee?.employer}</TableCell>
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
                            setSelectRating(e.target.value as unknown as number)
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
                      <Button
                        size={"icon"}
                        variant="outline"
                        className="hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          if (!isEditing) {
                            setIsEditing(trainee);
                            setSelectRating(trainee.rating || 0);
                          }
                          if (isEditing && isEditing?.id === trainee?.id) {
                            rateTrainee(trainee, selectRating || 0);
                            setIsEditing(null);
                          }
                        }}
                      >
                        {isEditing && isEditing?.id === trainee?.id ? (
                          <Check />
                        ) : (
                          <Pencil />
                        )}
                      </Button>
                      <Button
                        className="hover:bg-destructive hover:text-destructive-foreground"
                        size="icon"
                        variant="outline"
                        onClick={() => deleteTrainee(trainee)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
