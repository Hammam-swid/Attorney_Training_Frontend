import { Instructor } from "@/types";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { fetchInstructors } from "@/services/instructors.service";
import Pagination from "./ui/pagination";
import { ActivityService } from "@/services/activity.service";

interface Props {
  activityId: string;
  children: ReactNode;
  oldInstructors: Instructor[];
}

export default function AddInstructorToActivityDialog({
  activityId,
  oldInstructors,
  children,
}: Props) {
  const {
    isPending,
    mutateAsync,
    isLoading,
    search,
    selectedInstructors,
    setSearch,
    setSelectedInstructors,
    instructors,
    setPage,
    page,
    lastPage,
    totalCount,
  } = useAddInstructorsDialog(activityId);

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>قائمة كل المدربين</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Input
            id="search"
            placeholder="البحث"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selectedInstructors.length > 0 && (
          <div>تم تحديد {selectedInstructors.length} مدرب</div>
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
            ) : instructors && instructors.length > 0 ? (
              instructors
                ?.filter(
                  (instructor) =>
                    !oldInstructors.some((i) => i.id === instructor.id)
                )
                .map((instructor) => (
                  <TableRow className="" key={instructor.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedInstructors.some(
                          (i) => i.id === instructor.id
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedInstructors((prev) => [
                              ...prev,
                              instructor,
                            ]);
                          } else {
                            setSelectedInstructors((prev) =>
                              prev.filter((i) => i.id !== instructor.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {instructor.id}
                    </TableCell>
                    <TableCell className="text-right">
                      {instructor.name}
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
            disabled={isPending || selectedInstructors.length < 1}
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

const useAddInstructorsDialog = (activityId: string) => {
  const queryClient = useQueryClient();
  const [selectedInstructors, setSelectedInstructors] = useState<Instructor[]>(
    []
  );
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: ["instructors", { search }, { page }],
    queryFn: () => fetchInstructors(page, 5, search),
  });

  const instructors = data?.data || [];

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["add-instructors-to-activity"],
    mutationFn: async () =>
      ActivityService.addInstructorsToActivity(
        activityId,
        selectedInstructors.map((i) => i.id)
      ),
    onSuccess: () => {
      toast.success("تمت إضافة المدربين بنجاح");
      queryClient.invalidateQueries({
        queryKey: ["instructors"],
      });
      setSelectedInstructors([]);
    },
    onError() {
      toast.error("حدث خطأ أثناء إضافة المدربين");
    },
  });

  return {
    mutateAsync,
    isPending,
    selectedInstructors,
    setSelectedInstructors,
    search,
    setSearch,
    instructors,
    isLoading,
    setPage,
    page,
    lastPage: data?.lastPage,
    totalCount: data?.totalCount,
  };
};
