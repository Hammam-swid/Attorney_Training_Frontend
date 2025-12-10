import { useDispatch } from "react-redux";
import { setPage, setSearchQuery } from "../store/instructorSlice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { Pencil, Trash, UserPlus2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import Pagination from "@/components/ui/pagination";

export default function InstructorsPage() {
  const dispatch = useDispatch();
  const { page, searchQuery } = useAppSelector((state) => state.instructors);
  const [searchText, setSearchText] = useState(searchQuery);

  const [showForm, setShowForm] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<Instructor | null>(null);
  const limit = 10;

  const queryClient = useQueryClient();

  const { data: instructorsData } = useQuery<PaginatedData<Instructor>, Error>({
    queryKey: ["instructors", { page }, { searchQuery }],
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setSearchQuery(searchText));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  return (
    <div className="container mx-auto py-10 rtl">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold mb-5">قائمة المدربين</h1>
        <Button
          onClick={() => {
            setCurrentTrainer(null);
            setShowForm(true);
          }}
        >
          <UserPlus2 />
          إضافة مدرب جديد
        </Button>
      </div>
      <div className="flex items-center">
        <Label htmlFor="search" className="ml-2">
          بحث:
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="ابحث عن مدرب..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm m-4"
        />
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
                  title={`هل أنت متأكد من حذف المدرب ${trainer.name}؟`}
                  mutationKey={["deleteInstructor", trainer.id]}
                  mutationFn={() => deleteMutation.mutateAsync(trainer.id)}
                  onError={() => {
                    toast.error("حدث خطأ أثناء حذف المدرب");
                  }}
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

      {instructorsData && (
        <Pagination
          page={page}
          lastPage={instructorsData?.lastPage}
          totalCount={instructorsData?.totalCount}
          setPage={(newPage) => dispatch(setPage(newPage))}
        />
      )}

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
