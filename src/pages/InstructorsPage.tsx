import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FormDialog from "@/components/InstructorsFormDialog";
import ConfirmModal from "../components/common/ConfirmModal";
import { Instructor, Organization, PaginatedData } from "@/types";
import {
  fetchInstructors,
  fetchOrganizations,
  createInstructor,
  editInstructor,
  removeInstructor,
} from "@/services/instructors.service";
import { toast } from "react-hot-toast";

export default function TrainerPage() {
  const [showForm, setShowForm] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<Instructor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
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

  const createMutation = useMutation({
    mutationFn: (trainer: Partial<Instructor>) => createInstructor(trainer),
    onSuccess: () => {
      toast.success("تمت إضافة المدرب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      setShowForm(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة المدرب");
    },
  });

  const editMutation = useMutation({
    mutationFn: (trainer: Instructor) => editInstructor(trainer),
    onSuccess: () => {
      toast.success("تم تعديل بيانات المدرب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
      setShowForm(false);
      setCurrentTrainer(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تعديل المدرب");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => removeInstructor(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["instructors"] }),
  });

  const handleAdd = (trainer: Partial<Instructor>) =>
    createMutation.mutate(trainer);
  const handleEdit = (trainer: Instructor) => editMutation.mutate(trainer);

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
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <TableCell className="font-medium">{trainer.id}</TableCell>
              <TableCell>{trainer.name}</TableCell>
              <TableCell>{trainer.phone}</TableCell>
              <TableCell>
                {trainer.organization?.name || (
                  <span className="text-sm text-muted">الجهة غير موجودة</span>
                )}
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
                  className="hover:bg-primary hover:text-primary-foreground"
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
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          variant="outline"
          className="mx-1"
        >
          السابق
        </Button>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={
            (instructorsData?.data.length || 0) + limit * (page - 1) >=
            (instructorsData?.totalCount || 0)
          }
          variant="outline"
          className="mx-1"
        >
          التالي
        </Button>
      </div>

      {showForm && organizations && (
        <FormDialog
          title={currentTrainer ? "تعديل بيانات المدرب" : "إضافة مدرب جديد"}
          initialData={currentTrainer || {}}
          organizations={organizations}
          onSubmit={currentTrainer ? handleEdit : handleAdd}
          onClose={() => {
            setShowForm(false);
            setCurrentTrainer(null);
          }}
          isLoading={
            currentTrainer ? editMutation.isPending : createMutation.isPending
          }
        />
      )}
    </div>
  );
}
