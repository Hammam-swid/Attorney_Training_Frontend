import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useEffect, useState } from "react";
import { Trainee } from "@/types";
import axios from "axios";
import { Button } from "./ui/button";
import { Trash, UserPlus, X } from "lucide-react";
import { Input } from "./ui/input";
import { MultiSelect } from "react-multi-select-component";
import toast from "react-hot-toast";

interface TraineeDialogProps {
  activityId: number;
  onClose: () => void;
}

export default function ActivityTraineesDialog({
  activityId,
  onClose,
}: TraineeDialogProps) {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [allTrainees, setAllTrainees] = useState<
    { label: string; value: number }[]
  >([]);
  const [selectedTrainees, setSelectedTrainees] = useState<
    { label: string; value: number }[]
  >([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchingAllTrainees = async () => {
      const { data } = await axios.get<
        unknown,
        { data: { data: { trainees: Trainee[] } } }
      >(`/api/v1/trainees/activity/${activityId}`);
      console.log(data);
      setAllTrainees(
        data.data.trainees.map((trainee) => ({
          label: trainee.name,
          value: trainee.id,
        }))
      );
    };
    fetchingAllTrainees();
  }, [activityId]);

  useEffect(() => {
    const fetchingTrainees = async () => {
      const { data } = await axios.get(
        `/api/v1/training-activities/${activityId}/trainee`
      );
      setTrainees(data.data.activity.trainees);
    };
    fetchingTrainees();
  }, [activityId]);

  const addTrainees = async () => {
    try {
      const traineesIds = selectedTrainees.map((trainee) => trainee.value);
      const res = await axios.post(
        `/api/v1/training-activities/${activityId}/trainee`,
        {
          traineesIds,
        }
      );
      if (res.status === 200) {
        setTrainees(res.data.data.activity.trainees);
        toast.success("تمت إضافة المتدربين بنجاح");
      }
      // setTrainees(data.data.activity.trainees);
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء إضافة المتدربين");
    }
    console.log(selectedTrainees.map((trainee) => trainee.value));
  };

  const deleteTrainee = async (trainee: Trainee) => {
    try {
      const res = await axios.delete(
        `/api/v1/training-activities/${activityId}/trainee`,
        { data: { traineeId: trainee.id } }
      );
      if (res.status === 200) {
        setTrainees(res.data.data.activity.trainees);
        toast.success("تم حذف المتدرب بنجاح");
      }
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء حذف المتدرب");
    }
  };
  const closeDialog = () => {
    setSearch("");
    setSelectedTrainees([]);
    setAllTrainees([]);
    setTrainees([]);
    onClose();
  };
  return (
    <div
      onClick={(
        e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
          target: HTMLDivElement;
        }
      ) => e.target.id === "trainees-dialog-overlay" && closeDialog()}
      id="trainees-dialog-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 h-screen z-50 flex items-center justify-center"
    >
      <Card className="p-6 bg-background">
        <CardHeader>
          <h3 className="text-center text-lg font-bold">قائمة المتدربين</h3>
        </CardHeader>
        <CardContent>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث عن متدرب"
          />
          <Table className="min-w-96">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المعرف</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">جهة العمل</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainees
                ?.filter((trainee) => {
                  if (!search) return true;
                  return trainee.name
                    .toLowerCase()
                    .includes(search.toLowerCase());
                })
                .map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-medium">{trainee.id}</TableCell>
                    <TableCell>{trainee.name}</TableCell>
                    <TableCell>{trainee.phone}</TableCell>
                    <TableCell>{trainee.address}</TableCell>
                    <TableCell>{trainee.employer}</TableCell>
                    <TableCell>{trainee.type}</TableCell>
                    <TableCell>
                      <Button
                        className="hover:bg-destructive hover:text-destructive-foreground"
                        size="icon"
                        variant="outline"
                        onClick={() => deleteTrainee(trainee)}
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <MultiSelect
            className="multi-select"
            options={allTrainees}
            value={selectedTrainees}
            onChange={setSelectedTrainees}
            labelledBy="label"
            isLoading={!allTrainees}
          />
          <div className="flex flex-row-reverse mt-4 gap-2">
            <Button onClick={addTrainees}>
              <span>إضافة</span>
              <UserPlus />
            </Button>
            <Button
              className="hover:text-destructive"
              variant="outline"
              onClick={closeDialog}
            >
              <span>إغلاق</span>
              <X />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
