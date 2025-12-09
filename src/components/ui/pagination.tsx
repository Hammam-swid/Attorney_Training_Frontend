import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  lastPage: number;
  totalCount: number;
}
export default function Pagination({
  page,
  setPage,
  lastPage,
  totalCount,
}: PaginationProps) {
  if (lastPage === 1) return null;
  return (
    <div className="mt-8 space-y-2">
      <hr />
      <div className="flex items-center justify-between gap-2">
        <span>
          الإجمالي: <span className="font-semibold">{totalCount}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            صفحة {page} من {lastPage}
          </span>
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            variant={"ghost"}
            size={"icon"}
            className="rounded-xl"
          >
            <ChevronRight />
          </Button>
          {Array.from({ length: lastPage }, (_, index) => index + 1)
            .filter(
              (num) =>
                num <= 3 ||
                num === lastPage ||
                num === page ||
                page === num - 1 ||
                page === num + 1
            )
            .map((num) => (
              <Button
                key={num}
                size={"icon"}
                onClick={() => setPage(num)}
                variant={page === num ? "default" : "ghost"}
                className="rounded-xl"
              >
                {num}
              </Button>
            ))}
          <Button
            disabled={page >= lastPage}
            onClick={() => setPage(page + 1)}
            variant={"ghost"}
            size={"icon"}
            className="rounded-xl"
          >
            <ChevronLeft />
          </Button>
        </div>
      </div>
    </div>
  );
}
