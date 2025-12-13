import { useDispatch } from "react-redux";
import { setPage, setSearchQuery } from "../store/instructorSlice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { InstructorService } from "@/services/instructors.service";
import { OrganizationService } from "@/services/organization.service";
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
import InstructorForm from "@/components/InstructorsFormDialog";
import ConfirmModal from "@/components/common/ConfirmModal";

export default function InstructorsPage() {
  const dispatch = useDispatch();
  const { page, searchQuery } = useAppSelector((state) => state.instructors);
  const [searchText, setSearchText] = useState(searchQuery);
  const queryClient = useQueryClient();

  const { data: instructorsData } = useQuery<PaginatedData<Instructor>, Error>({
    queryKey: ["instructors", { page }, { searchQuery }],
    queryFn: () => InstructorService.fetchInstructors(page, 10, searchQuery),
  });

  const { data: organizations } = useQuery<Organization[], Error>({
    queryKey: ["organizations"],
    queryFn: OrganizationService.getAllOrganization,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => InstructorService.removeInstructor(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["instructors"] }),
  });

  useEffect(() => {
    const timeout = setTimeout(() => dispatch(setSearchQuery(searchText)), 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  if (!organizations) return null;

  return (
    <div className="container mx-auto py-10 px-2">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold mb-5">قائمة المدربين</h1>
        <InstructorForm
          title="إضافة مدرب جديد"
          type="add"
          organizations={organizations}
        >
          <Button>
            <UserPlus2 />
            إضافة مدرب جديد
          </Button>
        </InstructorForm>
      </div>

      <div className="flex items-center mb-4">
        <Label htmlFor="search" className="ml-2">
          بحث:
        </Label>
        <Input
          id="search"
          placeholder="ابحث عن مدرب..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm m-4"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المعرف</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead>الجهة التابع لها</TableHead>
            <TableHead>الإجراءات</TableHead>
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
                  onError={() => toast.error("حدث خطأ أثناء حذف المدرب")}
                >
                  <Button size="sm" variant="destructive">
                    <Trash />
                  </Button>
                </ConfirmModal>
                <InstructorForm
                  title={`تعديل بيانات ${trainer.name}`}
                  type="edit"
                  instructor={trainer}
                  organizations={organizations}
                >
                  <Button size="sm" variant="secondary">
                    <Pencil />
                  </Button>
                </InstructorForm>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {instructorsData && (
        <Pagination
          page={page}
          lastPage={instructorsData.lastPage}
          totalCount={instructorsData.totalCount}
          setPage={(newPage) => dispatch(setPage(newPage))}
        />
      )}
    </div>
  );
}
