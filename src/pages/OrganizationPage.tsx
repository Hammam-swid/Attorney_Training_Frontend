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
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
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
        <Button className="text-lg">
          <span>إضافة جديد</span>
          <PlusCircle />
        </Button>
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
                <TableCell>{organization.hostedCount}</TableCell>
                <TableCell>{organization.executedCount}</TableCell>
                <TableCell>{organization.instructorsCount}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant={"destructive"}>حذف</Button>
                  <Button variant={"secondary"}>تعديل</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

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
