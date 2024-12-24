import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Trainer {
  id: number;
  name: string;
  phone: string;
  organization: number;
}

interface Organization {
  id: number;
  name: string;
}

interface FormDialogProps {
  title: string;
  initialData: Partial<Trainer>;
  organizations: Organization[];
  onSubmit: (data: Trainer) => void;
  onClose: () => void;
}

const FormDialog: React.FC<FormDialogProps> = ({
  title,
  initialData,
  organizations,
  onSubmit,
  onClose,
}) => {
  const [name, setName] = useState<string>(initialData.name || "");
  const [phone, setPhone] = useState<string>(initialData.phone || "");
  const [organization, setOrganization] = useState<number>(
    initialData.organization || 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organization) {
      onSubmit({ id: initialData.id || 0, name, phone, organization });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="organization">الجهة المنضمة</Label>
            <Select
              value={String(organization)}
              onValueChange={(value) => setOrganization(Number(value))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الجهة" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="ml-2"
            >
              إلغاء
            </Button>
            <Button type="submit">حفظ</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormDialog;
