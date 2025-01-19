import React, { useState, useEffect, useMemo } from "react";
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
import axios from "axios";
import { toast } from "react-hot-toast";
import FormDialog from "../components/InstructorsFormDialog";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

interface Trainer {
  id: number;
  name: string;
  phone: string;
  organization: number;
}

interface Organization {
  id: number;
  name: string;
}

export default function TrainersPage() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTrainer, setCurrentTrainer] = useState<Trainer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const searchParam = searchQuery
          ? `?search=${encodeURIComponent(searchQuery)}`
          : "";

        const [trainersRes, orgsRes] = await Promise.all([
          axios.get(`/api/v1/instructors${searchParam}`),
          axios.get("/api/v1/organizations"),
        ]);

        setTrainers(trainersRes.data.data.instructors);
        console.log(trainersRes.data.data.instructors);
        setOrganizations(orgsRes.data.data.organizations);
        console.log(orgsRes.data.data.organizations);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!trainerToDelete) return;
    try {
      await axios.delete(`/api/v1/instructors/${trainerToDelete.id}`);
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
  const handleAddTrainer = async (newTrainer: Trainer) => {
    try {
      const res = await axios.post("/api/v1/instructors", {
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

  const handleEditTrainer = async (updatedTrainer: Trainer) => {
    try {
      const res = await axios.patch(
        `/api/v1/instructors/${updatedTrainer.id}`,
        {
          name: updatedTrainer.name,
          phone: updatedTrainer.phone,
          organization: updatedTrainer.organization,
        }
      );
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

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainer) =>
      Object.values(trainer).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [trainers, searchQuery]);

  const pageCount = Math.ceil(filteredTrainers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTrainers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, pageCount)));
  };

  if (loading) {
    return <div className="text-center">جاري التحميل...</div>;
  }

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
            <TableHead className="text-right">الجهة المنضمة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((trainer) => (
            <TableRow key={trainer.id}>
              <TableCell className="font-medium">{trainer.id}</TableCell>
              <TableCell>{trainer.name}</TableCell>
              <TableCell>{trainer.phone}</TableCell>
              <TableCell>
                {organizations.find((org) => org.id === trainer.organization)
                  ?.name || "الجهة غير موجودة"}
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
                  حذف
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setCurrentTrainer(trainer);
                    setShowEditForm(true);
                  }}
                >
                  تعديل
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-center">
        <Button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          className="mx-1"
        >
          السابق
        </Button>
        <Button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === pageCount}
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
