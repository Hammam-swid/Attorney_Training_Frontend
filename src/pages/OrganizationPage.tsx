import AddOrganizationForm from "@/components/AddOrganizationForm";
import SureModal from "@/components/SureModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Organization } from "@/types";
import axios from "axios";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";

interface SureModalType {
  title: string;
  description: ReactElement;
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [sureModal, setSureModal] = useState<SureModalType>({
    title: "",
    description: <></>,
    show: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const res = await axios.get(
          `/api/v1/organizations?page=${page}&search=${search}`
        );
        if (res.status === 200) setOrganizations(res.data.data.organizations);
        console.log(res.data.data);
      } catch (error) {
        console.log(error);
      }
      // console.log(organizations);
    };
    getOrganizations();
  }, [page, search]);

  const handlePage = (type: string) => {
    if (type === "prev") {
      setPage((prev) => prev - 1);
    } else if (type === "next") {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">الجهات المختصة</h1>
        <Button onClick={() => setShowAddForm(true)} className="text-lg">
          <span>إضافة جديد</span>
          <PlusCircle />
        </Button>
        <AddOrganizationForm
          show={showAddForm}
          hideForm={() => setShowAddForm(false)}
        />
      </div>
      <div className="flex items-center justify-between mb-4 mt-4">
        <Input
          className="w-96"
          placeholder="بحث"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div>
        <Table className="flex-1">
          <TableHeader>
            <TableRow className="*:text-right">
              <TableHead>معرف الجهة</TableHead>
              <TableHead>اسم الجهة</TableHead>
              <TableHead>عدد الأنشطة التي تم تنفيذها</TableHead>
              <TableHead>عدد الأنشطة التي تم تنظيمها</TableHead>
              <TableHead>عدد المدربين التابعين لها</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations?.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell>{organization.id}</TableCell>
                <TableCell dir="rtl">{organization.name}</TableCell>
                <TableCell>
                  {organization.hostedCount ? (
                    organization.hostedCount
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">
                      لا يوجد أنشطة
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {organization.executedCount ? (
                    organization.executedCount
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">
                      لا يوجد أنشطة
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {organization.instructorsCount ? (
                    organization.instructorsCount
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">
                      لا يوجد مدربين
                    </span>
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSureModal({
                        title: "حذف الجهة",
                        description: (
                          <p>
                            هل أنت متأكد من حذف{" "}
                            <span className="font-bold">
                              {organization.name}
                            </span>
                            ؟
                          </p>
                        ),
                        show: true,
                        onConfirm: () => {
                          setSureModal({
                            title: "",
                            description: <></>,
                            show: false,
                            onConfirm: () => {},
                            onCancel: () => {},
                          });
                        },
                        onCancel: () => {
                          setSureModal({
                            title: "",
                            description: <></>,
                            show: false,
                            onConfirm: () => {},
                            onCancel: () => {},
                          });
                        },
                      });
                    }}
                    variant={"destructive"}
                  >
                    <span>حذف</span>
                    <Trash />
                  </Button>
                  <Button variant={"secondary"}>
                    <span>تعديل</span>
                    <Pencil />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <SureModal
          title={sureModal.title}
          description={sureModal.description}
          show={sureModal.show}
          onConfirm={sureModal.onConfirm}
          onCancel={sureModal.onCancel}
        />

        <div className="flex items-center justify-center mt-4 gap-2">
          <Button
            onClick={() => handlePage("prev")}
            disabled={page <= 1}
            variant={"ghost"}
          >
            السابق
          </Button>
          <Button onClick={() => handlePage("next")} variant={"ghost"}>
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
