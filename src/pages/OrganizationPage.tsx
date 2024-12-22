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
import axios from "axios";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState<number>(1);
  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const res = await axios.get(`/api/v1/organizations?page=${page}`);
        if (res.status === 200) setOrganizations(res.data.data.organizations);
        console.log(res.data.data);
      } catch (error) {
        console.log(error);
      }
      // console.log(organizations);
    };
    getOrganizations();
  }, [page]);
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
        <Input className="w-96" placeholder="بحث" />
        {/* <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>الحالة</SelectLabel>
              <SelectItem value="الكل">الكل</SelectItem>
              <SelectItem value="نشطة">نشطة</SelectItem>
              <SelectItem value="مكتملة">مكتملة</SelectItem>
              <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select> */}
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
          <Button variant={"ghost"}>السابق</Button>
          <Button variant={"ghost"}>التالي</Button>
        </div>
      </div>
    </div>
  );
}
