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
import { FormikHelpers } from "formik";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { ReactElement, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-hot-toast";

interface SureModalType {
  title: string;
  description: ReactElement;
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface OrganizationFormArgs {
  title: string;
  show: boolean;
  orgName?: string;
  hideForm: () => void;
  onSubmit: (
    values: { name: string },
    helpers: FormikHelpers<{ name: string }>
  ) => void;
}

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [organizationsCount, setOrganizationsCount] = useState<number>(0);
  const [sureModal, setSureModal] = useState<SureModalType>({
    title: "",
    description: <></>,
    show: false,
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [organizationForm, setOrganizationForm] =
    useState<OrganizationFormArgs>({
      title: "",
      show: false,
      hideForm: () => {},
      onSubmit: () => {},
    });
  const handleForm = (type: string, org?: Organization) => {
    if (type === "add") {
      setOrganizationForm({
        title: "إضافة جهة",
        show: true,
        hideForm: () => {
          setOrganizationForm({
            title: "",
            show: false,
            hideForm: () => {},
            onSubmit: () => {},
          });
        },
        onSubmit: async (values, helpers) => {
          try {
            const res = await axios.post("/api/v1/organizations", values);
            if (res.status === 201) {
              setOrganizations([...organizations, res.data.data.organization]);
              setOrganizationForm({
                title: "",
                show: false,
                hideForm: () => {},
                onSubmit: () => {},
              });
              helpers.resetForm();
              toast.success("تمت الإضافة بنجاح");
            }
          } catch (error) {
            console.log(error);
          }
          console.log(values);
        },
      });
    } else if (type === "edit") {
      console.log("the org: ", org);
      setOrganizationForm({
        title: "تعديل جهة",
        orgName: org?.name || "",
        show: true,
        hideForm: () => {
          setOrganizationForm({
            title: "",
            orgName: "",
            show: false,
            hideForm: () => {},
            onSubmit: () => {},
          });
        },
        onSubmit: async (values, helpers) => {
          try {
            const res = await axios.patch(
              `/api/v1/organizations/${org?.id}`,
              values
            );
            console.log(res);
            if (res.status === 200) {
              setOrganizations((prev) =>
                prev.map((org) =>
                  org.id === res.data.data.organization.id
                    ? res.data.data.organization
                    : org
                )
              );
              setOrganizationForm({
                title: "",
                orgName: "",
                show: false,
                hideForm: () => {},
                onSubmit: () => {},
              });
              helpers.resetForm();
              toast.success("تم التعديل بنجاح");
            }
          } catch (error) {
            console.log(error);
          }
          console.log(values);
        },
      });
    }
  };

  useEffect(() => {
    const getOrganizations = async () => {
      try {
        const res = await axios.get(
          `/api/v1/organizations?page=${page}&search=${search}`
        );
        if (res.status === 200) {
          setOrganizations(res.data.data.organizations);
          const count = res?.data?.data?.count;
          if (count !== organizationsCount) setOrganizationsCount(count);
        }
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
      <Helmet>
        <title>إدارة المتدربين | الجهات المختصة</title>
        <meta
          name="description"
          content={`إدارة كل الجهات المختصة الخاصة بالمركز`}
        />
      </Helmet>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">الجهات المختصة</h1>
        <Button
          onClick={() => {
            handleForm("add");
          }}
          className=""
        >
          <span>إضافة جهة جديدة</span>
          <PlusCircle />
        </Button>
        <AddOrganizationForm
          title={organizationForm.title}
          show={organizationForm.show}
          hideForm={organizationForm.hideForm}
          onSubmit={organizationForm.onSubmit}
          orgName={organizationForm.orgName}
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
        <p className="font-bold text-end">
          {organizations.length + (page - 1) * 10} \ {organizationsCount}
        </p>
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
                            const res = await axios.delete(
                              `/api/v1/organizations/${organization.id}`
                            );
                            toast.success("تم حذف الجهة بنجاح");
                            if (res.status === 204) {
                              setOrganizations((prev) =>
                                prev.filter((org) => org.id !== organization.id)
                              );
                            }
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
                    <span>حذف</span>
                    <Trash />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleForm("edit", organization)}
                    variant={"secondary"}
                  >
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
          <Button
            disabled={
              organizations.length + (page - 1) * 10 >= organizationsCount
            }
            onClick={() => handlePage("next")}
            variant={"ghost"}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
