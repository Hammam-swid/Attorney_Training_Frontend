import { ActivityDomainsService } from "@/services/activity-domains.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ActivityDomainForm from "@/components/activity-domains/ActivityDomainForm";
import ConfirmModal from "@/components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function ActivityDomainsPage() {
  const { data: domains, isLoading } = useQuery({
    queryKey: ["activity-domains"],
    queryFn: ActivityDomainsService.getDomains,
  });

  const queryClient = useQueryClient();

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex flex-col gap-3">
          <CardTitle>مجالات الأنشطة التدريبية</CardTitle>
          <CardDescription>
            هنا يمكنك إضافة وتعديل مجالات الأنشطة
          </CardDescription>
        </div>
        <ActivityDomainForm type="add">
          <Button>
            <PlusCircle />
            إضافة مجال جديد
          </Button>
        </ActivityDomainForm>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-20" />
              ))
            : domains?.map((domain) => (
                <div
                  key={domain.id}
                  className="p-4 border rounded-md flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{domain.name}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {domain.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ActivityDomainForm type="edit" domain={domain}>
                      <Button variant="outline" size="icon">
                        <Pencil />
                      </Button>
                    </ActivityDomainForm>
                    <ConfirmModal
                      mutationKey={[
                        "delete-activity-domain",
                        { id: domain.id },
                      ]}
                      mutationFn={() =>
                        ActivityDomainsService.deleteDomain(domain.id)
                      }
                      title={`هل أنت متأكد من حذف المجال ${domain.name}؟`}
                      description={`هذا المجال سيتم حذفه نهائيًا`}
                      onSuccess={() => {
                        toast.success("تم حذف المجال");
                        queryClient.invalidateQueries({
                          queryKey: ["activity-domains"],
                        });
                      }}
                      onError={() => {
                        toast.error("حدث خطأ أثناء حذف المجال");
                      }}
                    >
                      <Button variant="destructive" size="icon">
                        <Trash />
                      </Button>
                    </ConfirmModal>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
