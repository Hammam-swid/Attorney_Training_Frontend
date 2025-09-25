import { useState, useEffect } from "react";
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
import FormDialog from "../components/InstructorsFormDialog";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Pencil, Trash } from "lucide-react";
import { Instructor, Organization } from "@/types";
import api from "@/lib/api";

export default function TrainerPage() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [trainers, setTrainers] = useState<Instructor[]>([]);
  const [allTrainersCount, setAllTrainersCount] = useState<number>(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentTrainer, setCurrentTrainer] = useState<Instructor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Instructor | null>(
    null
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParam = searchQuery ? `&search=${searchQuery}` : "";
        const pageParam = `?page=${page}&limit=${limit}`;

        console.log(`/api/v1/instructors${pageParam}${searchParam}`);
        const [trainersRes, orgsRes] = await Promise.all([
          api.get(`/api/v1/instructors${pageParam}${searchParam}`),
          api.get("/api/v1/organizations"),
        ]);

        setTrainers(trainersRes.data.data.instructors);
        setOrganizations(orgsRes.data.data.organizations);
        setAllTrainersCount(trainersRes.data.data.count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [searchQuery, page]);

  const handleDeleteConfirm = async () => {
    if (!trainerToDelete) return;
    try {
      await api.delete(`/api/v1/instructors/${trainerToDelete.id}`);
      setTrainers(
        trainers.filter((trainer) => trainer.id !== trainerToDelete.id)
      );
      toast.success("تم حذف المدرب بنجاح");
    } catch (error) {
      console.error("Error deleting trainer:", error);
    } finally {
      setShowDeleteConfirm(false);
      setTrainerToDelete(null);
    }
  };
  const handleAddTrainer = async (newTrainer: Instructor) => {
    try {
      const res = await api.post("/api/v1/instructors", {
        name: newTrainer.name,
        phone: newTrainer.phone,
        organization: newTrainer.organization,
      });
      setTrainers([...trainers, res.data.data.instructor]);
      toast.success("تم إضافة المدرب بنجاح");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding trainer:", error);
    }
  };

  const handleEditTrainer = async (updatedTrainer: Instructor) => {
    try {
      console.log(updatedTrainer);
      const res = await api.patch(`/api/v1/instructors/${updatedTrainer.id}`, {
        name: updatedTrainer.name,
        phone: updatedTrainer.phone,
        organization: updatedTrainer.organization,
      });
      setTrainers(
        trainers.map((trainer) =>
          trainer.id === updatedTrainer.id ? res.data.data.instructor : trainer
        )
      );
      toast.success("تم تعديل المتدرب بنجاح");
      setShowEditForm(false);
      setCurrentTrainer(null);
    } catch (error) {
      console.error("Error updating trainer:", error);
    }
  };

  return (
    <div className="container mx-auto py-10 rtl">
      <h1 className="text-3xl font-bold mb-5">قائمة المدربين</h1>
      <div className="flex justify-between items-center mb-5">
        <Button onClick={() => setShowAddForm(true)}>إضافة مدرب جديد</Button>
        <div className="flex items-center">
          <Label htmlFor="search" className="ml-2">
            بحث:
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="ابحث عن مدرب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // التحديث التلقائي
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
          {trainers.map((trainer) => (
            <TableRow key={trainer.id}>
              <TableCell className="font-medium">{trainer.id}</TableCell>
              <TableCell>{trainer.name}</TableCell>
              <TableCell>{trainer.phone}</TableCell>
              <TableCell>
                {trainer?.organization?.name || (
                  <span className="text-sm text-muted">الجهة غير موجودة</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => {
                    setTrainerToDelete(trainer);
                    setShowDeleteConfirm(true);
                  }}
                  variant="destructive"
                  className="ml-2"
                >
                  <span>حذف</span>
                  <Trash />
                </Button>
                <Button
                  size="sm"
                  variant={"secondary"}
                  className="hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    setCurrentTrainer(trainer);
                    setShowEditForm(true);
                  }}
                >
                  <span>تعديل</span>
                  <Pencil />
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
          disabled={trainers.length + limit * (page - 1) >= allTrainersCount}
          variant="outline"
          className="mx-1"
        >
          التالي
        </Button>
      </div>
      {showAddForm && (
        <FormDialog
          title="إضافة مدرب جديد"
          initialData={{}}
          organizations={organizations}
          onSubmit={handleAddTrainer}
          onClose={() => setShowAddForm(false)}
        />
      )}
      {showEditForm && currentTrainer && (
        <FormDialog
          title="تعديل بيانات المدرب"
          initialData={currentTrainer}
          organizations={organizations}
          onSubmit={handleEditTrainer}
          onClose={() => setShowEditForm(false)}
        />
      )}
      {/* <ToastContainer
        position="top-right"
        rtl={true}
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      /> */}
      {showDeleteConfirm && trainerToDelete && (
        <DeleteConfirmModal
          item={trainerToDelete}
          itemName="المدرب"
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setTrainerToDelete(null);
          }}
        />
      )}
    </div>
  );
}
