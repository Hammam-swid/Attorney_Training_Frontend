import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  lastPage: number;
}
export default function Pagination({
  page,
  setPage,
  lastPage,
}: PaginationProps) {
  return (
    <div className="mt-8 space-y-2">
      <hr />
      <div className="flex items-center justify-end gap-2">
        <span className="text-gray-500">
          صفحة {page} من {lastPage}
        </span>
        <Button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          variant={"ghost"}
          size={"icon"}
        >
          <ChevronRight />
        </Button>
        {Array.from({ length: lastPage }, (_, index) => index + 1).map(
          (num) => (
            <Button
              key={num}
              size={"icon"}
              onClick={() => setPage(num)}
              variant={page === num ? "default" : "ghost"}
            >
              {num}
            </Button>
          )
        )}
        <Button
          disabled={page >= lastPage}
          onClick={() => setPage(page + 1)}
          variant={"ghost"}
          size={"icon"}
        >
          <ChevronLeft />
        </Button>
      </div>
    </div>
  );
}
