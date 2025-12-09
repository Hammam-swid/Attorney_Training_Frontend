import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/index";
import { setPage, setSearchQuery } from "../store/instructorSlice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import FormDialog from "@/components/InstructorsFormDialog";
import ConfirmModal from "../components/common/ConfirmModal";
import {
  fetchInstructors,
  fetchOrganizations,
  removeInstructor,
} from "@/services/instructors.service";
import { Instructor, Organization, PaginatedData } from "@/types";
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
import { Pencil, Trash } from "lucide-react";

export default function InstructorsPage() {
  const dispatch = useDispatch();
  const page = useSelector((state: RootState) => state.instructors.page);
  const searchQuery = useSelector(
    (state: RootState) => state.instructors.searchQuery
  );

  const [showForm, setShowForm] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<Instructor | null>(null);
  const limit = 10;

  const queryClient = useQueryClient();

  const { data: instructorsData } = useQuery<PaginatedData<Instructor>, Error>({
    queryKey: ["instructors", page, searchQuery],
    queryFn: () => fetchInstructors(page, limit, searchQuery),
  });

  const { data: organizations } = useQuery<Organization[], Error>({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => removeInstructor(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["instructors"] }),
  });

  return (
    <div className="container mx-auto py-10 rtl">
      <h1 className="text-3xl font-bold mb-5">قائمة المدربين</h1>

      <div className="flex justify-between items-center mb-5">
        <Button
          onClick={() => {
            setCurrentTrainer(null);
            setShowForm(true);
          }}
        >
          إضافة مدرب جديد
        </Button>

        <div className="flex items-center">
          <Label htmlFor="search" className="ml-2">
            بحث:
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="ابحث عن مدرب..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="max-w-sm m-4"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">المعرف</TableHead>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">رقم الهاتف</TableHead>
            <TableHead className="text-right">الجهة التابع لها</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructorsData?.data.map((trainer) => (
            <TableRow key={trainer.id}>
              <TableCell>{trainer.id}</TableCell>
              <TableCell>{trainer.name}</TableCell>
              <TableCell>{trainer.phone}</TableCell>
              <TableCell>
                {trainer.organization?.name || "الجهة غير موجودة"}
              </TableCell>

              <TableCell className="flex gap-2">
                <ConfirmModal
                  title={`هل أنت متأكد من حذف المدرب ${trainer.name}?`}
                  mutationKey={["deleteInstructor", trainer.id]}
                  mutationFn={() => deleteMutation.mutateAsync(trainer.id)}
                >
                  <Button size="sm" variant="destructive">
                    حذف <Trash />
                  </Button>
                </ConfirmModal>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setCurrentTrainer(trainer);
                    setShowForm(true);
                  }}
                >
                  تعديل <Pencil />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => dispatch(setPage(page - 1))}
          disabled={page <= 1}
          variant="outline"
        >
          السابق
        </Button>

        <Button
          onClick={() => dispatch(setPage(page + 1))}
          disabled={
            (instructorsData?.data.length || 0) + limit * (page - 1) >=
            (instructorsData?.totalCount || 0)
          }
          variant="outline"
        >
          التالي
        </Button>
      </div>

      {showForm && organizations && (
        <FormDialog
          title={currentTrainer ? "تعديل بيانات المدرب" : "إضافة مدرب جديد"}
          initialData={currentTrainer || {}}
          organizations={organizations}
          onClose={() => {
            setShowForm(false);
            setCurrentTrainer(null);
          }}
        />
      )}
    </div>
  );
}
