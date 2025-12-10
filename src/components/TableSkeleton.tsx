import { Skeleton } from "./ui/skeleton";
import { TableCell, TableRow } from "./ui/table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export default function TableSkeleton({
  columns,
  rows = 10,
}: TableSkeletonProps) {
  return (
    <>
      {[...Array(rows)].map((_, index) => (
        <TableRow key={index}>
          {[...Array(columns)].map((_, index) => (
            <TableCell key={index}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
