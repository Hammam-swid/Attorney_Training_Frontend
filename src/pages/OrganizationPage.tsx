import ConfirmModal from "@/components/common/ConfirmModal";
import OrganizationForm from "@/components/OrganizationForm";
import TableSkeleton from "@/components/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationService } from "@/services/organization.service";
import { useAppSelector } from "@/store/hooks";
import {
  setOrganizationPage,
  setOrganizationSearch,
} from "@/store/organizationsSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function OrganizationPage() {
  const { page, search } = useAppSelector((state) => state.organizations);
  const [searchText, setSearchText] = useState<string>("");
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data, isLoading } = useQuery({
    queryKey: ["organization", { page }, { search }],
    queryFn: () => OrganizationService.getOrganization(page, search),
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setOrganizationSearch(searchText));
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchText]);

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>إدارة التدريب | الجهات المختصة</title>
        <meta
          name="description"
          content={`إدارة كل الجهات المختصة الخاصة بالمركز`}
        />
      </Helmet>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">الجهات المختصة</h1>

        <OrganizationForm title={"إضافة جهة جديدة"} type="add">
          <Button>
            <span>إضافة جهة جديدة</span>
            <PlusCircle />
          </Button>
        </OrganizationForm>
      </div>
      <div className="flex items-center justify-between mb-4 mt-4">
        <Input
          className="w-96"
          placeholder="بحث"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div>
        {/* <p className="font-bold text-end">
          {organizations.length + (page - 1) * 10} \ {organizationsCount}
        </p> */}
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
            {isLoading ? (
              <TableSkeleton columns={6} />
            ) : (
              data?.data?.map((organization) => (
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
                    <ConfirmModal
                      title={`هل أنت متأكد من حذف "${organization.name}"؟`}
                      mutationKey={["delete-organization"]}
                      mutationFn={() =>
                        OrganizationService.deleteOrganization(organization.id)
                      }
                      onSuccess={() => {
                        queryClient.invalidateQueries({
                          queryKey: ["organization", { page }, { search }],
                        });
                        toast.success("تمت العملية بنجاح");
                      }}
                      onError={(error) => {
                        if (error instanceof AxiosError)
                          toast.error(
                            error?.response?.data?.message || "حدث خطأ"
                          );
                        console.log(error);
                      }}
                    >
                      <Button size="sm" variant={"destructive"}>
                        <Trash />
                      </Button>
                    </ConfirmModal>
                    <OrganizationForm
                      type="edit"
                      organization={organization}
                      title={`تعديل الجهة "${organization.name}"`}
                    >
                      <Button size="sm" variant={"secondary"}>
                        <Pencil />
                      </Button>
                    </OrganizationForm>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {data && (
          <Pagination
            lastPage={data?.lastPage}
            page={page}
            setPage={(page) => dispatch(setOrganizationPage(page))}
          />
        )}
      </div>
    </div>
  );
}
