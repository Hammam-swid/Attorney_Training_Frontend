import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Icon from "@/components/ui/Icon";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { AxiosError } from "axios";
import EditTypeModal from "@/components/EditTypeModal";
import AddTypeModal from "@/components/AddTypeModal";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityTypeService } from "@/services/actvitiy-type.service";
import ConfirmModal from "@/components/common/ConfirmModal";

type IconName = keyof typeof dynamicIconImports;

export default function ActivityTypesPage() {
  const queryClient = useQueryClient();
  const { data: activityTypes } = useQuery({
    queryKey: ["activity-types"],
    queryFn: ActivityTypeService.getActivityTypes,
  });

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle>أنواع الأنشطة التدريبية</CardTitle>
        <AddTypeModal>
          <Button>
            <span>إضافة نوع جديد</span>
            <PlusCircle />
          </Button>
        </AddTypeModal>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activityTypes?.map((type, index) => (
            <div key={index} className="flex items-center border p-4 rounded">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <Icon
                    name={
                      type.iconName
                        ? (type.iconName as IconName)
                        : "notepad-text"
                    }
                  />
                </AvatarFallback>
              </Avatar>
              <div className="ms-4 space-y-1">
                <p className="text-sm font-medium leading-none">{type.name}</p>
              </div>

              <div className="flex items-center gap-2 ms-auto">
                <EditTypeModal type={type}>
                  <Button
                    className="hover:bg-primary hover:text-primary-foreground"
                    variant="outline"
                    size="icon"
                  >
                    <Pencil />
                  </Button>
                </EditTypeModal>
                <ConfirmModal
                  mutationKey={["delete-activity-type", { id: type.id }]}
                  mutationFn={() =>
                    ActivityTypeService.deleteActivityType(type.id)
                  }
                  title={`هل أنت متأكد من حذف "${type.name}"؟`}
                  onSuccess={() => {
                    toast.success("تم حذف النوع بنجاح");
                    queryClient.invalidateQueries({
                      queryKey: ["activity-types"],
                    });
                  }}
                  onError={(error) => {
                    const message =
                      error instanceof AxiosError
                        ? error?.response?.data?.message
                        : null;

                    toast.error(message || "حدث خطأ ما");
                  }}
                >
                  <Button
                    className="hover:bg-destructive hover:text-destructive-foreground"
                    variant="outline"
                    size="icon"
                  >
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
