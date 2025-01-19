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
import FormDialog from "../components/TraineeFormDialog";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
interface Trainee {
  id: number;
  name: string;
  phone: string;
  address: string;
  employer: string;
  type: string;
}

export default function TraineesPage() {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTrainee, setCurrentTrainee] = useState<Trainee | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [traineeToDelete, setTraineeToDelete] = useState<Trainee | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const searchParam = searchQuery
          ? `?search=${encodeURIComponent(searchQuery)}`
          : "";

        const res = await axios.get(`/api/v1/trainees${searchParam}`);
        setTrainees(res.data.data.trainees);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!traineeToDelete) return;
    try {
      await axios.delete(`/api/v1/trainees/${traineeToDelete.id}`);
      setTrainees(
        trainees.filter((trainee) => trainee.id !== traineeToDelete.id)
      );
      toast.success("تم حذف المتدرب بنجاح");
    } catch (error) {
      console.error("Error deleting trainee:", error);
    } finally {
      setShowDeleteConfirm(false);
      setTraineeToDelete(null);
    }
  };

  const handleAddTrainee = async (newTrainee: Trainee) => {
    try {
      const res = await axios.post("/api/v1/trainees", newTrainee);
      setTrainees([...trainees, res.data.data.trainee]);
      toast.success("تم إضافة المتدرب بنجاح");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding trainee:", error);
    }
  };

  const handleEditTrainee = async (updatedTrainee: Trainee) => {
    try {
      const res = await axios.patch(
        `/api/v1/trainees/${updatedTrainee.id}`,
        updatedTrainee
      );
      setTrainees(
        trainees.map((trainee) =>
          trainee.id === updatedTrainee.id ? res.data.data.trainee : trainee
        )
      );
      toast.success("تم تعديل المتدرب بنجاح");
      setShowEditForm(false);
      setCurrentTrainee(null);
    } catch (error) {
      console.error("Error updating trainee:", error);
    }
  };

  const filteredTrainees = useMemo(() => {
    return trainees.filter((trainee) =>
      Object.values(trainee).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [trainees, searchQuery]);

  const pageCount = Math.ceil(filteredTrainees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTrainees.slice(
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
      <h1 className="text-3xl font-bold mb-5">قائمة المتدربين</h1>
      <div className="flex justify-between items-center mb-5">
        <Button onClick={() => setShowAddForm(true)}>إضافة متدرب جديد</Button>
        <div className="flex items-center">
          <Label htmlFor="search" className="ml-2">
            بحث:
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="ابحث عن متدرب..."
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
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">جهة العمل</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((trainee) => (
            <TableRow key={trainee.id}>
              <TableCell className="font-medium">{trainee.id}</TableCell>
              <TableCell>{trainee.name}</TableCell>
              <TableCell>{trainee.phone}</TableCell>
              <TableCell>{trainee.address}</TableCell>
              <TableCell>{trainee.employer}</TableCell>
              <TableCell>{trainee.type}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => {
                    setTraineeToDelete(trainee);
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
                    setCurrentTrainee(trainee);
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
          title="إضافة متدرب جديد"
          initialData={{}}
          onSubmit={handleAddTrainee}
          onClose={() => setShowAddForm(false)}
        />
      )}
      {showEditForm && currentTrainee && (
        <FormDialog
          title="تعديل بيانات المتدرب"
          initialData={currentTrainee}
          onSubmit={handleEditTrainee}
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
      {showDeleteConfirm && traineeToDelete && (
        <DeleteConfirmModal
          item={traineeToDelete}
          itemName="المتدرب"
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setTraineeToDelete(null);
          }}
        />
      )}
    </div>
  );
}
