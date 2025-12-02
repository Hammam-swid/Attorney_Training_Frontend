import OrganizationForm from "@/components/OrganizationForm";
import SureModal from "@/components/SureModal";
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
import api from "@/lib/api";
import { OrganizationService } from "@/services/organization.service";
import { useAppSelector } from "@/store/hooks";
import {
  setOrganizationPage,
  setOrganizationSearch,
} from "@/store/organizationsSlice";
import { useQuery } from "@tanstack/react-query";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

interface SureModalType {
  title: string;
  description: ReactElement;
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OrganizationPage() {
  const { page, search } = useAppSelector((state) => state.organizations);
  const [searchText, setSearchText] = useState<string>("");
  const dispatch = useDispatch();
  const [sureModal, setSureModal] = useState<SureModalType>({
    title: "",
    description: <></>,
    show: false,
    onConfirm: () => {},
    onCancel: () => {},
  });
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
                    <Button
                      size="sm"
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
                          onConfirm: async () => {
                            try {
                              const res = await api.delete(
                                `/api/v1/organizations/${organization.id}`
                              );
                              toast.success("تم حذف الجهة بنجاح");
                            } catch (error) {
                              console.log(error);
                              toast.error("حدث خطأ أثناء حذف الجهة");
                            }
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
                      <Trash />
                    </Button>
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
        <SureModal
          title={sureModal.title}
          description={sureModal.description}
          show={sureModal.show}
          onConfirm={sureModal.onConfirm}
          onCancel={sureModal.onCancel}
        />

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
