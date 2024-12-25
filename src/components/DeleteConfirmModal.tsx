import React from "react";
import { Button } from "@/components/ui/button";

// تعريف أنواع الـ Props للمكون DeleteConfirmModal
interface DeleteConfirmModalProps<T> {
  item: T;
  itemName: string;
  onConfirm: () => void;
  onClose: () => void;
}

// مكون DeleteConfirmModal العام
function DeleteConfirmModal<T>({
  item,
  itemName,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps<T>) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center rtl">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">تأكيد الحذف</h2>
        <p className="mb-6">
          هل أنت متأكد أنك تريد حذف {itemName}{" "}
          <span className="font-bold">{(item as any).name}</span>؟
        </p>
        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="ml-2"
          >
            إلغاء
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            حذف
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
