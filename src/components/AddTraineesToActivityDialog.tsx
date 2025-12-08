import { Trainee } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { Input } from "./ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { TraineesService } from "@/services/trainees.service";

interface Props {
  activityId: string;
  children: ReactNode;
  oldTrainees: Trainee[];
  onSuccess?: () => void;
}

export default function AddTraineesToActivityDialog({
  activityId,
  oldTrainees,
  children,
}: Props) {
  const {
    isPending,
    mutateAsync,
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
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>قائمة كل المتدربين</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Input
            id="search"
            placeholder="البحث"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            disabled={isPending || selectedTrainees.length < 1}
            onClick={async () => await mutateAsync()}
            className="font-bold"
          >
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
      </DialogContent>
    </Dialog>
  );
}

const useAddTraineesDialog = (activityId: string) => {
  const queryClient = useQueryClient();
  const [selectedTrainees, setSelectedTrainees] = useState<Trainee[]>([]);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useQuery({
    queryKey: ["trainees", { search }, { page }],
    queryFn: () => TraineesService.getTrainees(page, search),
  });
  const trainees = data?.data || [];
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["add-trainees-to-activity"],
    mutationFn: async () =>
      TraineesService.addTraineesToActivity(
        activityId,
        selectedTrainees.map((t) => t.id)
      ),
    onSuccess: () => {
      toast.success("تمت إضافة المتدربين بنجاح");
      queryClient.invalidateQueries({
        queryKey: ["trainees", { activityId }],
      });
      setSelectedTrainees([]);
    },
    onError() {
      toast.error("حدث خطأ أثناء إضافة المتدربين");
    },
  });

  return {
    mutateAsync,
    isPending,
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
