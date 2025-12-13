import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import FormDialog from "../components/TraineeFormDialog";
import { Pencil, Trash, UserPlus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TraineesService } from "@/services/trainees.service";
import Pagination from "@/components/ui/pagination";
import ConfirmModal from "@/components/common/ConfirmModal";
import { AxiosError } from "axios";
import TableSkeleton from "@/components/TableSkeleton";
import { useAppSelector } from "@/store/hooks";
import { useDispatch } from "react-redux";
import { setTraineesPage, setTraineesSearch } from "@/store/traineesSlice";

const arTypes = {
  attorney: "عضو نيابة",
  officer: "ضابط",
  employee: "موظف",
  other: "أخرى",
};

export default function TraineesPage() {
  const { search, page } = useAppSelector((state) => state.trainees);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const typeId = searchParams.get("typeId");

  const [searchText, setSearchText] = useState<string>(search);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["trainees", { page }, { search }, { type }, { typeId }],
    queryFn: () =>
      TraineesService.getTrainees(
        page,
        search,
        arTypes[type as keyof typeof arTypes] || undefined,
        typeId || undefined
      ),
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setTraineesSearch(searchText));
      dispatch(setTraineesPage(1));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  return (
    <div className="container px-5 mx-auto py-10 rtl">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">قائمة المتدربين</h1>
        {typeId && (
          <FormDialog title="إضافة متدرب جديد" type="add">
            <Button>
              <UserPlus />
              إضافة متدرب جديد
            </Button>
          </FormDialog>
        )}
      </div>
      <div className="flex items-center mb-5">
        <Label htmlFor="search" className="ml-2">
          بحث:
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="ابحث عن متدرب..."
          value={searchText}
          // onFocus={() => setPage(1)}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm m-4"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">المعرف</TableHead>
            <TableHead className="text-center">الاسم</TableHead>
            <TableHead className="text-center">رقم الهاتف</TableHead>
            <TableHead className="text-center">العنوان</TableHead>
            <TableHead className="text-center">جهة العمل</TableHead>
            <TableHead className="text-center">النوع</TableHead>
            <TableHead className="text-center">الدرجة القضائية</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={8} />
          ) : (
            data?.data.map((trainee) => (
              <TableRow key={trainee.id}>
                <TableCell className="font-medium text-center">
                  {trainee.id}
                </TableCell>
                <TableCell className="text-center">
                  {trainee.name || <span className="text-muted">//</span>}
                </TableCell>
                <TableCell className="text-center">
                  {trainee.phone || <span className="text-muted">//</span>}
                </TableCell>
                <TableCell className="text-center">
                  {trainee.address || <span className="text-muted">//</span>}
                </TableCell>
                <TableCell className="text-center">
                  {trainee.employer || <span className="text-muted">//</span>}
                </TableCell>
                <TableCell className="text-center">
                  {trainee.traineeType?.name || (
                    <span className="text-muted">//</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {trainee.payGrade || <span className="text-muted">//</span>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <ConfirmModal
                      title="هل انت متاكد من حذف هذا المتدرب؟"
                      mutationKey={["delete-trainee", { id: trainee.id }]}
                      mutationFn={() =>
                        TraineesService.deleteTrainee(trainee.id)
                      }
                      onSuccess={() => {
                        toast.success("تم حذف المتدرب بنجاح");
                        queryClient.invalidateQueries({
                          queryKey: [
                            "trainees",
                            { page },
                            { search },
                            { type },
                            { typeId },
                          ],
                        });
                      }}
                      onError={(e) => {
                        let message = "حدث خطأ أثناء حذف المتدرب";
                        if (e instanceof AxiosError) {
                          message = e.response?.data?.message || message;
                        }
                        toast.error(message);
                      }}
                    >
                      <Button size="sm" variant="destructive">
                        <Trash />
                      </Button>
                    </ConfirmModal>
                    <FormDialog
                      type="edit"
                      title={`تعديل المتدرب "${trainee.name}"`}
                      trainee={trainee}
                    >
                      <Button
                        size="sm"
                        variant={"secondary"}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        <Pencil />
                      </Button>
                    </FormDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div>
        {data && (
          <Pagination
            page={page}
            lastPage={data?.lastPage}
            setPage={(p) => dispatch(setTraineesPage(p))}
            totalCount={data.totalCount}
          />
        )}
      </div>
    </div>
  );
}
