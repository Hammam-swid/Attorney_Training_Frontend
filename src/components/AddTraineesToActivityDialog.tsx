import { Trainee } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

interface Props {
  activityId: string;
  oldTrainees: Trainee[];
  hide: () => void;
}

const getTrainees = async (search: string, page: number) => {
  const searchQuery = search ? `&search=${search}` : "";
  const res = await axios.get<{
    data: { trainees: Trainee[] };
  }>(`/api/v1/trainees?page=${page}&limit=10${searchQuery}`);
  console.log(res);
  return res.data.data;
};

export default function AddTraineesToActivityDialog({
  activityId,
  oldTrainees,
  hide,
}: Props) {
  const {
    addTrainees,
    isLoading,
    search,
    selectedTrainees,
    setSearch,
    setSelectedTrainees,
    trainees,
    setPage,
    page,
  } = useAddTraineesDialog(activityId);
  return (
    <div
      onClick={(
        e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
          target: HTMLDivElement;
        }
      ) => e.target?.id === "trainees-dialog-overlay" && hide()}
      id="trainees-dialog-overlay"
      className="fixed inset-0 bg-black/50 h-screen z-50 flex items-center justify-center"
    >
      <Card className="p-3 w-[35rem] max-h-[70vh] overflow-y-scroll min-h-96">
        <h2 className="text-xl text-center font-bold mb-3">
          قائمة كل المتدربين
        </h2>
        <div className="flex items-center gap-3">
          <Input
            id="search"
            placeholder="البحث"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => addTrainees()} className="font-bold">
            تأكيد
          </Button>
        </div>
        {selectedTrainees.length > 0 && (
          <div>تم تحديد {selectedTrainees.length} متدرب</div>
        )}
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">تحديد</TableHead>
              <TableHead className="text-right">المعرف</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <Loader2 className="animate-spin mx-auto text-primary w-16 h-16" />
                </TableCell>
              </TableRow>
            ) : trainees && trainees.length > 0 ? (
              trainees
                ?.filter(
                  (trainee) => !oldTrainees.some((t) => t.id === trainee.id)
                )
                .map((trainee) => (
                  <TableRow className="" key={trainee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTrainees.some(
                          (t) => t.id === trainee.id
                        )}
                        // onChange={(e)=> {setSelectedTrainees(prev =>)}}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTrainees((prev) => [...prev, trainee]);
                          } else {
                            setSelectedTrainees((prev) =>
                              prev.filter((t) => t.id !== trainee.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">{trainee.id}</TableCell>
                    <TableCell className="text-right">{trainee.name}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <span>لا يوجد نتائج</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-center items-center">
          <Button
            variant="outline"
            className="w-24"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            className="w-24"
            onClick={() => setPage((prev) => prev + 1)}
          >
            التالي
          </Button>
        </div>
      </Card>
    </div>
  );
}

const useAddTraineesDialog = (activityId: string) => {
  const queryClient = useQueryClient();
  const [selectedTrainees, setSelectedTrainees] = useState<Trainee[]>([]);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useQuery({
    queryKey: ["trainees", { search }, { page }],
    queryFn: () => getTrainees(search, page),
  });
  const trainees = data?.trainees || [];
  const addTrainees = async () => {
    try {
      const traineesIds = selectedTrainees.map((trainee) => trainee.id);
      const res = await axios.post(
        `/api/v1/training-activities/${activityId}/trainee`,
        {
          traineesIds,
        }
      );
      if (res.status === 200) {
        toast.success("تمت إضافة المتدربين بنجاح");
        queryClient.invalidateQueries({
          queryKey: ["trainees", { activityId }],
        });
      }
      // setTrainees(data.data.activity.trainees);
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء إضافة المتدربين");
    }
    console.log(selectedTrainees.map((trainee) => trainee.id));
  };

  return {
    addTrainees,
    selectedTrainees,
    setSelectedTrainees,
    search,
    setSearch,
    trainees,
    isLoading,
    setPage,
    page,
  };
};
