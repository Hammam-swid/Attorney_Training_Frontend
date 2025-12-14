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
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Activity } from "@/types";
import { ActivityService } from "@/services/activity.service";
import { useQuery } from "@tanstack/react-query";
import TableSkeleton from "../TableSkeleton";
import { Checkbox } from "../ui/checkbox";
import Pagination from "../ui/pagination";

interface Props {
  children: ReactNode;
  selectedActivities: Activity[];
  setSelectedActivities: Dispatch<SetStateAction<Activity[]>>;
}
export default function ActivitiesSelector({
  children,
  selectedActivities,
  setSelectedActivities,
}: Props) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState(search);
  const { data, isLoading } = useQuery({
    queryKey: ["activities", { page }, { search }],
    queryFn: () =>
      ActivityService.getActivities(
        null,
        page,
        search,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        5
      ),
  });
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchText);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);
  const handleRowClick = (activity: Activity) => {
    setSelectedActivities((prev) => {
      if (prev.some((a) => a.id === activity.id)) {
        return prev.filter((a) => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>اختيار أنشطة</DialogTitle>

          <div>
            <div className="flex items-center justify-between gap-3 mb-4 mt-4">
              <Input
                placeholder="بحث"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div>
              <Table dir="rtl">
                <TableHeader>
                  <TableRow className="*:text-right">
                    <TableHead></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>عنوان النشاط</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody dir="rtl">
                  {isLoading ? (
                    <TableSkeleton columns={3} rows={5} />
                  ) : data && data?.data.length > 0 ? (
                    data?.data.map((activity) => (
                      <TableRow
                        onClick={() => handleRowClick(activity)}
                        dir="rtl"
                        key={activity.id}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedActivities.some(
                              (a) => a.id === activity.id
                            )}
                          />
                        </TableCell>
                        <TableCell dir="rtl">{activity.id}</TableCell>
                        <TableCell dir="rtl">{activity.title}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="hover:bg-inherit">
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        لا يوجد أنشطة تدريبية
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
