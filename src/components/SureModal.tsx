import React, { ReactElement } from "react";
import { Button } from "./ui/button";
import { Trash, X } from "lucide-react";

interface props {
  title: string;
  description: ReactElement;
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SureModal({
  title,
  description,
  show,
  onCancel,
  onConfirm,
}: props) {
  return (
    show && (
      <div
        onClick={(
          e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
            target: HTMLDivElement;
          }
        ) => e.target.id === "sure-modal-overlay" && onCancel()}
        id="sure-modal-overlay"
        className="fixed inset-0 bg-black bg-opacity-50 h-screen w-screen flex items-center justify-center z-50"
      >
        <div className="bg-background p-6 rounded-md">
          <h3 className="font-bold text-lg text-center mb-2">{title}</h3>
          {description}
          <div className="flex flex-row-reverse gap-2 mt-6">
            <Button onClick={onConfirm}>
              <span>نعم</span>
              <Trash />
            </Button>
            <Button
              className="hover:text-red-500"
              variant={"outline"}
              onClick={onCancel}
            >
              <span>إلغاء</span>
              <X />
            </Button>
          </div>
        </div>
      </div>
    )
  );
}
