import { Trainee } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { TraineesService } from "@/services/trainees.service";
import Pagination from "./ui/pagination";
import TraineeName from "./TraineeName";
import NoteFilterSelect from "./NoteFilterSelect";
import { NoteFilter } from "@/lib/noteFlag";
import { AxiosError } from "axios";

interface AddTraineesResult {
  status: "success" | "partial";
  message?: string;
  data?: {
    added: { id: number; name: string }[];
    alreadyInActivity: { id: number; name: string }[];
    notFound: number[];
    failed: { id: number; name: string; message: string }[];
  };
}

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
    searchText,
    selectedTrainees,
    setSearchText,
    setSelectedTrainees,
    trainees,
    setPage,
    page,
    lastPage,
    totalCount,
    notesFilter,
    setNotesFilter,
  } = useAddTraineesDialog(activityId);
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>قائمة كل المتدربين</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Input
            id="search"
            placeholder="البحث"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <NoteFilterSelect value={notesFilter} onChange={setNotesFilter} />
        </div>
        {selectedTrainees.length > 0 && (
          <div>تم تحديد {selectedTrainees.length} متدرب</div>
        )}
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">تحديد</TableHead>
              <TableHead className="text-center">المعرف</TableHead>
              <TableHead className="text-center">الاسم</TableHead>
              <TableHead className="text-center">نوع المتدرب</TableHead>
              <TableHead className="text-center">ملاحظة</TableHead>
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
                  (trainee) => !oldTrainees.some((t) => t.id === trainee.id),
                )
                .map((trainee) => (
                  <TableRow className="" key={trainee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTrainees.some(
                          (t) => t.id === trainee.id,
                        )}
                        // onChange={(e)=> {setSelectedTrainees(prev =>)}}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTrainees((prev) => [...prev, trainee]);
                          } else {
                            setSelectedTrainees((prev) =>
                              prev.filter((t) => t.id !== trainee.id),
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-center">{trainee.id}</TableCell>
                    <TableCell className="text-center">
                      <TraineeName trainee={trainee} />
                    </TableCell>
                    <TableCell className="text-center">
                      {trainee.traineeType.name || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {trainee.notes || "-"}
                    </TableCell>
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
        {lastPage && totalCount && (
          <Pagination
            page={page}
            setPage={setPage}
            lastPage={lastPage}
            totalCount={totalCount}
          />
        )}
        <DialogFooter className="">
          <Button
            disabled={isPending || selectedTrainees.length < 1}
            onClick={async () => await mutateAsync()}
            className="font-bold w-full"
          >
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const useAddTraineesDialog = (activityId: string) => {
  const queryClient = useQueryClient();
  const [selectedTrainees, setSelectedTrainees] = useState<Trainee[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [notesFilter, setNotesFilterState] = useState<NoteFilter>("all");
  const setNotesFilter = (value: NoteFilter) => {
    setNotesFilterState(value);
    setPage(1);
  };
  const { data, isLoading } = useQuery({
    queryKey: ["trainees", { search }, { page }, { notes: notesFilter }],
    queryFn: () =>
      TraineesService.getTrainees(page, search, undefined, undefined, 5, undefined, notesFilter),
  });
  const trainees = data?.data || [];
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["add-trainees-to-activity"],
    mutationFn: async () =>
      TraineesService.addTraineesToActivity(
        activityId,
        selectedTrainees.map((t) => t.id),
      ),
    onSuccess: (res) => {
      // the server says what really happened to each trainee
      const result = res as AddTraineesResult;
      const failedNames = result.data?.failed?.map((f) => f.name) ?? [];
      const message =
        result.message ||
        "تمت إضافة المتدربين بنجاح";
      const details = failedNames.length
        ? `${message}\nلم تتم إضافة: ${failedNames.join("، ")}`
        : message;
      if (result.status === "success" && !result.data?.alreadyInActivity?.length) {
        toast.success(details);
      } else if (result.data?.added?.length) {
        toast(details, { icon: "⚠️", duration: 6000 });
      } else {
        toast.error(details, { duration: 6000 });
      }
      queryClient.invalidateQueries({
        queryKey: ["trainees", { activityId }],
      });
      // keep selected only the trainees that could not be added, to retry
      const failedIds = new Set(result.data?.failed?.map((f) => f.id) ?? []);
      setSelectedTrainees((prev) => prev.filter((t) => failedIds.has(t.id)));
    },
    onError(error) {
      toast.error(
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ||
          "حدث خطأ أثناء إضافة المتدربين",
      );
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  return {
    notesFilter,
    setNotesFilter,
    mutateAsync,
    isPending,
    selectedTrainees,
    setSelectedTrainees,
    searchText,
    setSearchText,
    trainees,
    isLoading,
    setPage,
    page,
    lastPage: data?.lastPage,
    totalCount: data?.totalCount,
  };
};
