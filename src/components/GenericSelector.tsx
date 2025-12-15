import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useQuery } from "@tanstack/react-query";
import TableSkeleton from "./TableSkeleton";
import { Checkbox } from "./ui/checkbox";
import Pagination from "./ui/pagination";

interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
}

interface GenericSelectorPropsBase<T> {
  children: ReactNode;
  queryKey: string;
  queryFn: (
    page: number,
    search: string
  ) => Promise<{
    data: T[];
    lastPage: number;
    totalCount: number;
  }>;
  columns: Column<T>[];
  title: string;
  searchPlaceholder?: string;
  noDataMessage?: string;
  getItemId: (item: T) => number | string;
  limit?: number;
}

interface MultipleSelectionProps<T> extends GenericSelectorPropsBase<T> {
  multiple: true;
  selectedItems: T[];
  setSelectedItems: Dispatch<SetStateAction<T[]>>;
}

interface SingleSelectionProps<T> extends GenericSelectorPropsBase<T> {
  multiple?: false;
  selectedItems: T | null;
  setSelectedItems: Dispatch<SetStateAction<T | null>>;
}

type GenericSelectorProps<T> =
  | MultipleSelectionProps<T>
  | SingleSelectionProps<T>;

export default function GenericSelector<T>(props: GenericSelectorProps<T>) {
  const {
    children,
    selectedItems,
    setSelectedItems,
    queryKey,
    queryFn,
    columns,
    title,
    searchPlaceholder = "بحث",
    noDataMessage = "لا توجد بيانات",
    getItemId,
    limit = 5,
    multiple = false,
  } = props;
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState(search);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, { page }, { search }],
    queryFn: () => queryFn(page, search),
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchText);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const handleRowClick = (item: T) => {
    if (multiple) {
      // Multiple selection mode
      (setSelectedItems as Dispatch<SetStateAction<T[]>>)((prev) => {
        const itemId = getItemId(item);
        if ((prev as T[]).some((i) => getItemId(i) === itemId)) {
          return (prev as T[]).filter((i) => getItemId(i) !== itemId);
        } else {
          return [...(prev as T[]), item];
        }
      });
    } else {
      // Single selection mode
      (setSelectedItems as Dispatch<SetStateAction<T | null>>)(item);
      setOpen(false); // Close dialog after selection
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <div>
            <div className="flex items-center justify-between gap-3 mb-4 mt-4">
              <Input
                placeholder={searchPlaceholder}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div>
              <Table dir="rtl">
                <TableHeader>
                  <TableRow className="*:text-right">
                    <TableHead></TableHead>
                    {columns.map((column, index) => (
                      <TableHead key={index}>{column.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody dir="rtl">
                  {isLoading ? (
                    <TableSkeleton columns={columns.length + 1} rows={limit} />
                  ) : data && data?.data.length > 0 ? (
                    data?.data.map((item) => (
                      <TableRow
                        onClick={() => handleRowClick(item)}
                        dir="rtl"
                        key={getItemId(item)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={
                              multiple
                                ? (selectedItems as T[]).some(
                                    (i) => getItemId(i) === getItemId(item)
                                  )
                                : selectedItems !== null &&
                                  getItemId(selectedItems as T) ===
                                    getItemId(item)
                            }
                          />
                        </TableCell>
                        {columns.map((column, index) => (
                          <TableCell key={index} dir="rtl">
                            {column.accessor(item)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-inherit">
                      <TableCell
                        colSpan={columns.length + 1}
                        className="text-center text-muted-foreground"
                      >
                        {noDataMessage}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {data && (
                <Pagination
                  page={page}
                  setPage={setPage}
                  lastPage={data?.lastPage}
                  totalCount={data.totalCount}
                />
              )}
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
