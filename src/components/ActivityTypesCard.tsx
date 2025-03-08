import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ActivityType } from "@/types";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Icon from "./ui/Icon";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Button } from "./ui/button";
import { CircleAlert, Pencil, PlusCircle, Trash } from "lucide-react";
import axios from "axios";
import SureModal from "./SureModal";
import EditTypeModal from "./EditTypeModal";
import AddTypeModal from "./AddTypeModal";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addType, removeType, updateType } from "@/store/uiSlice";

type IconName = keyof typeof dynamicIconImports;

export default function ActivityTypesCard() {
  // const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [addingType, setAddingType] = useState(false);

  const activityTypes = useAppSelector((state) => state.ui.activityTypes);
  const dispatch = useAppDispatch();
  // useEffect(() => {
  //   const fetchActivityTypes = async () => {
  //     try {
  //       const { data } = await axios.get("/api/v1/activity-types");
  //       setActivityTypes(data?.data?.types);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchActivityTypes();
  // }, []);

  async function deleteType(type: ActivityType) {
    try {
      const res = await axios.delete(`/api/v1/activity-types/${type.id}`);
      if (res.status === 204) {
        dispatch(removeType(type));
        toast.success("تم حذف النوع بنجاح");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "حدث خطأ ما");
    }
  }

  const [sureModal, setSureModal] = useState<{
    title: string;
    description: React.ReactElement;
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    title: "",
    description: <></>,
    show: false,
    onConfirm: () => {},
    onCancel: () => {},
  });

  function hideSureModal() {
    setSureModal({
      title: "",
      description: <></>,
      show: false,
      onConfirm: () => {},
      onCancel: () => {},
    });
  }

  // const updateUi = (types) => {
  //   dispatch(setUiTypes([...activityTypes]));
  // };
  return (
    <Card>
      <SureModal
        show={sureModal.show}
        description={sureModal.description}
        onCancel={sureModal.onCancel}
        onConfirm={sureModal.onConfirm}
        title={sureModal.title}
      />
      <CardHeader>
        <CardTitle>أنواع الأنشطة التدريبية</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activityTypes.map((type, index) => (
            <div key={index} className="flex items-center">
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
              <div className="ms-auto font-medium">#{index + 1}</div>
              <div className="flex items-center gap-2 ms-4">
                <Button
                  onClick={() => setSelectedType(type)}
                  className="hover:bg-primary hover:text-primary-foreground"
                  variant="outline"
                  size="icon"
                >
                  <Pencil />
                </Button>
                <Button
                  className="hover:bg-destructive hover:text-destructive-foreground"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setSureModal({
                      title: "حذف نوع نشاط",
                      description: (
                        <p>
                          <p>
                            هل أنت متأكد من حذف{" "}
                            <span className="font-bold">{type.name}</span>؟
                          </p>
                          <p className="text-xs text-red-400 mt-2">
                            <CircleAlert className="inline-block me-1 w-4 h-4" />
                            سيتم حذف كل الأنشطة المندرجة تحت{" "}
                            <span>{type.name}</span>
                          </p>
                        </p>
                      ),
                      show: true,
                      onConfirm: () => deleteType(type),
                      onCancel: () => hideSureModal(),
                    })
                  }
                >
                  <Trash />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setAddingType(true)}>
            <span>إضافة</span>
            <PlusCircle />
          </Button>
        </div>
      </CardContent>
      {selectedType && (
        <EditTypeModal
          type={selectedType}
          onClose={() => setSelectedType(null)}
          onEdit={(newType: ActivityType) => {
            dispatch(updateType(newType));
          }}
        />
      )}
      {addingType && (
        <AddTypeModal
          onClose={() => setAddingType(false)}
          onAdd={(newType: ActivityType) => {
            dispatch(addType(newType));
          }}
        />
      )}
    </Card>
  );
}
