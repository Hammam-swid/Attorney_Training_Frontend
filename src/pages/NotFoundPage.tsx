import { CircleX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex justify-center items-center w-full h-full min-h-screen">
      <h2 className="text-3xl font-bold">
        <CircleX size={'48'} className="text-red-500 inline-block me-2"/>
        هذه الصفحة غير موجودة
        <span className="ms-2">404</span>
      </h2>
    </div>
  );
}
