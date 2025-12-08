import ActivityForm from "@/components/ActivityForm";
import { useSearchParams } from "react-router-dom";

export default function AddActivityPage() {
  const [searchParams] = useSearchParams();
  const typeId = searchParams.get("typeId");
  return (
    <div className="w-full container mx-auto p-6">
      <ActivityForm
        type="add"
        title="إضافة نشاط جديد"
        activityTypeId={Number(typeId)}
      />
    </div>
  );
}
