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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
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

  // Fetch trainers and organizations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [trainersRes, orgsRes] = await Promise.all([
          axios.get("/api/v1/instructors"),
          axios.get("/api/v1/organizations"),
        ]);

        setTrainers(trainersRes.data.data.instructors);
        setOrganizations(orgsRes.data.data.organizations);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/v1/instructors/${id}`);
      setTrainers(trainers.filter((trainer) => trainer.id !== id));
    } catch (error) {
      console.error("Error deleting trainer:", error);
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
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
                  ? organizations.find((org) => org.id === trainer.organization)
                      ?.name
                  : "الجهة غير موجودة"}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(trainer.id)}
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
        <AddTrainerForm
          onAddTrainer={handleAddTrainer}
          onClose={() => setShowAddForm(false)}
          organizations={organizations}
        />
      )}
      {showEditForm && currentTrainer && (
        <EditTrainerForm
          trainer={currentTrainer}
          onEditTrainer={handleEditTrainer}
          onClose={() => setShowEditForm(false)}
          organizations={organizations}
        />
      )}
      <ToastContainer
        position="top-right"
        rtl={true}
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}

interface AddTrainerFormProps {
  onClose: () => void;
  onAddTrainer: (newTrainer: Trainer) => void;
  organizations: Organization[];
}

function AddTrainerForm({
  onClose,
  onAddTrainer,
  organizations,
}: AddTrainerFormProps) {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [organization, setOrganization] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organization !== null) {
      onAddTrainer({ id: 0, name, phone, organization });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">إضافة مدرب جديد</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="organization">الجهة المنضمة</Label>
            <Select
              onValueChange={(value) => setOrganization(Number(value))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الجهة" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="ml-2"
            >
              إلغاء
            </Button>
            <Button type="submit">إضافة</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditTrainerFormProps {
  trainer: Trainer;
  onEditTrainer: (updatedTrainer: Trainer) => void;
  onClose: () => void;
  organizations: Organization[];
}

function EditTrainerForm({
  trainer,
  onEditTrainer,
  onClose,
  organizations,
}: EditTrainerFormProps) {
  const [name, setName] = useState<string>(trainer.name);
  const [phone, setPhone] = useState<string>(trainer.phone);
  const [organization, setOrganization] = useState<number>(
    trainer.organization
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditTrainer({ ...trainer, name, phone, organization });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">تعديل بيانات المدرب</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="organization">الجهة المنضمة</Label>
            <Select
              value={String(organization)}
              onValueChange={(value) => setOrganization(Number(value))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الجهة" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="ml-2"
            >
              إلغاء
            </Button>
            <Button type="submit">تحديث</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
