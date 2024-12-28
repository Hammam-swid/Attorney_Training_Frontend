import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormDialogProps {
  title: string;
  initialData: Partial<Trainee>;
  onSubmit: (data: Trainee) => void;
  onClose: () => void;
}

interface Trainee {
  id: number;
  name: string;
  phone: string;
  address: string;
  employer: string;
  type: string;
}

const FormDialog: React.FC<FormDialogProps> = ({
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<Trainee>>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.phone &&
      formData.address &&
      formData.employer &&
      formData.type
    ) {
      onSubmit(formData as Trainee);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl">
      <div className="bg-background p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="employer">جهة العمل</Label>
            <Input
              id="employer"
              name="employer"
              value={formData.employer || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="type">النوع</Label>
            <Input
              id="type"
              name="type"
              value={formData.type || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-start">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" className="ml-2">
              حفظ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDialog;
