import { Skeleton } from "./ui/skeleton";
import { TableCell, TableRow } from "./ui/table";

interface TableSkeletonProps {
  columns: number;
}

export default function TableSkeleton({ columns }: TableSkeletonProps) {
  return (
    <>
      {[...Array(10)].map((_, index) => (
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
