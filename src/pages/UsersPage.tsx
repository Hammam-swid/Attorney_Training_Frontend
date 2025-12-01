import TableSkeleton from "@/components/TableSkeleton";
import ToggleUserStatus from "@/components/ToggleUserStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UsersService } from "@/services/users.service";
import { useQuery } from "@tanstack/react-query";
import { Ban, Pencil, UserPlus } from "lucide-react";
import { useState } from "react";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["users", { page }, { search }],
    queryFn: () => UsersService.getUsers(page, search),
  });
  const lastPage = data?.lastPage ?? 1;
  return (
    <div className="container pe-4 mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">المستخدمين</h1>
        <Button className="text-lg">
          <span>إضافة مستخدم</span>
          <UserPlus />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3 mb-4 mt-4">
        <Input
          className="w-96"
          placeholder="بحث"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-3 items-center">
          <Select dir="rtl">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>الحالة</SelectLabel>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">مفعل</SelectItem>
                <SelectItem value="inactive">غير مفعل</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="*:text-right">
            <TableHead>ID</TableHead>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>رقم الهاتف</TableHead>
            <TableHead>الدور</TableHead>

            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={7} />
          ) : data && data.data.length > 0 ? (
            data.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.isActive ? "مفعل" : "غير مفعل"}</TableCell>
                <TableCell>{user.phone ?? "غير موجود"}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size={"icon"} variant={"outline"}>
                      <Pencil />
                    </Button>
                    <ToggleUserStatus user={user}>
                      <Button size={"icon"} variant={"destructive"}>
                        <Ban />
                      </Button>
                    </ToggleUserStatus>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                لا يوجد مستخدمين
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination page={page} setPage={setPage} lastPage={lastPage} />
    </div>
  );
}
