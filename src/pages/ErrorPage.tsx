import { CircleAlert } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="flex justify-center items-center w-full text-2xl font-bold gap-2">
      <CircleAlert className="text-red-500" />
      <span>حدث خطأ ما</span>
    </div>
  );
}
