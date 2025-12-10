import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ReactNode, useEffect, useState } from "react";
import { Activity } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityService } from "@/services/activity.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import TableSkeleton from "../TableSkeleton";
import Pagination from "../ui/pagination";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import toast from "react-hot-toast";

interface Props {
  parent: Activity;
  children: ReactNode;
}

export default function MoveSubActivities({ parent, children }: Props) {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState(search);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const { data, isLoading } = useQuery({
    queryKey: ["activities", { page }, { search }, { notParentId: parent.id }],
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
        parent.id,
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

  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["move-sub-activities", parent.id],
    mutationFn: () =>
      ActivityService.moveSubActivities(
        parent.id,
        selectedActivities.map((a) => a.id)
      ),
    onSuccess: () => {
      setSelectedActivities([]);
      setPage(1);
      setSearch("");
      setSearchText("");
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
      setOpen(false);
      toast.success("تم نقل الأنشطة بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء نقل الأنشطة");
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>نقل أنشطة إلى "{parent.title}" كأنشطة فرعية</DialogTitle>

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
        <DialogFooter>
          <Button
            disabled={selectedActivities.length === 0 || isPending}
            onClick={async () => await mutateAsync()}
            className="w-full"
          >
            نقل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
