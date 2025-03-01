import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Instructor } from "@/types";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Check, Edit, Plus, Trash, X } from "lucide-react";
import { Input } from "./ui/input";
import { MultiSelect } from "react-multi-select-component";
import toast from "react-hot-toast";

interface InstructorActivityDialogProps {
  activityId: number;
  activityName: string;
  onClose: () => void;
  refresh: () => void;
}

export default function InstructorActivityDialog({
  activityId = 1,
  activityName,
  onClose,
  refresh,
}: InstructorActivityDialogProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [allInstructors, setAllInstructors] = useState<
    { label: string; value: number }[]
  >([]);
  const [selectedInstructors, setSelectedInstructors] = useState<
    { label: string; value: number }[]
  >([]);
  const [isEditing, setIsEditing] = useState<Instructor | null>(null);
  const [selectRating, setSelectRating] = useState<number>();

  useEffect(() => {
    const fetchInstructors = async () => {
      const { data } = await axios.get<
        unknown,
        { data: { data: { instructors: Instructor[] } } }
      >(`/api/v1/instructors/all`);
      console.log(data);
      setAllInstructors(
        data.data.instructors
          .filter(
            (instructor) => !instructors.some((i) => i.id === instructor.id)
          )
          .map((instructor) => ({
            label: instructor.name,
            value: instructor.id,
          }))
      );
    };
    fetchInstructors();
  }, [activityId, instructors]);
  console.log(allInstructors);

  useEffect(() => {
    const fetchInstructors = async () => {
      const { data } = await axios.get<
        unknown,
        { data: { data: { instructors: Instructor[] } } }
      >(`/api/v1/training-activities/${activityId}/instructor`);
      console.log(data);
      setInstructors(data.data.instructors);
    };
    fetchInstructors();
  }, [activityId]);

  const addInstructor = async () => {
    try {
      const { data } = await axios.post(
        `/api/v1/training-activities/${activityId}/instructor`,
        {
          instructorIds: selectedInstructors.map(
            (instructor) => instructor.value
          ),
        }
      );
      console.log(data);
      setInstructors((prev) => [
        ...prev.filter((i) => instructors.some((s) => s.id !== i.id)),
        ...data.data.instructors,
      ]);
      toast.success("تمت الإضافة بنجاح");
      setSelectedInstructors([]);
      refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteInstructor = async (instructor: Instructor) => {
    const { data } = await axios.delete(
      `/api/v1/training-activities/${activityId}/instructor`,
      { data: { instructorId: instructor.id } }
    );
    console.log(data);
    setInstructors((prev) => prev.filter((i) => i.id !== instructor.id));
    toast.success("تمت الإزالة بنجاح");
    refresh();
  };

  const rateInstructor = async (instructor: Instructor, rating: number) => {
    try {
      const res = await axios.patch(
        `/api/v1/training-activities/${activityId}/instructor/rate`,
        {
          instructorId: instructor.id,
          rating,
        }
      );
      if (res.status === 200) {
        setInstructors((prev) =>
          prev.map((i) =>
            i.id === instructor.id ? { ...i, rating: +rating } : i
          )
        );
        toast.success("تم تقييم المدرب بنجاح");
        refresh();
      }
    } catch (error) {
      console.log(error);
      toast.error("حدث خطأ أثناء تقييم المدرب");
    }
  };

  const closeDialog = () => {
    onClose();
    setIsEditing(null);
    setSelectedInstructors([]);
    setAllInstructors([]);
    setInstructors([]);
  };
  return (
    <div
      onClick={(
        e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
          target: HTMLDivElement;
        }
      ) => e.target.id === "instructors-dialog-overlay" && closeDialog()}
      id="instructors-dialog-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 h-screen z-50 flex items-center justify-center"
    >
      <Card
        className="bg-background max-h-[80vh]"
        style={{
          scrollbarWidth: "thin",
        }}
      >
        <CardHeader>
          {/* <CardTitle>قائمة المدربين</CardTitle> */}
          <h3 className="text-lg font-bold text-center">
            قائمة المدربين الخاصة بـ{activityName}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="max-h-72 mb-8 overflow-y-scroll">
            <Table className="min-w-96">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المعرف</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell className="font-medium">
                      {instructor.id}
                    </TableCell>
                    <TableCell>{instructor.name}</TableCell>
                    <TableCell>
                      {!isEditing || isEditing.id !== instructor.id ? (
                        instructor.rating ? (
                          instructor?.rating?.toFixed(2)
                        ) : (
                          <span className="text-gray-500">لا يوجد تقييم</span>
                        )
                      ) : (
                        <span className="relative">
                          <Input
                            inputMode="numeric"
                            className="w-20"
                            value={selectRating}
                            onChange={(e) =>
                              setSelectRating(
                                e.target.value as unknown as number
                              )
                            }
                          />
                          <Button
                            size={"icon"}
                            variant={"ghost"}
                            className="absolute left-0 top-0"
                            onClick={() => setIsEditing(null)}
                          >
                            <X />
                          </Button>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        onClick={() => {
                          if (!isEditing) {
                            setIsEditing(instructor);
                            setSelectRating(instructor.rating || 0);
                          }
                          if (isEditing && isEditing.id === instructor.id) {
                            rateInstructor(instructor, selectRating || 0);
                            setIsEditing(null);
                          }
                        }}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        {!isEditing || isEditing.id !== instructor.id ? (
                          <Edit />
                        ) : (
                          <Check />
                        )}
                      </Button>
                      <Button
                        size={"icon"}
                        variant={"destructive"}
                        onClick={() => {
                          deleteInstructor(instructor);
                        }}
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <MultiSelect
            labelledBy=""
            options={allInstructors}
            value={selectedInstructors}
            onChange={setSelectedInstructors}
          />
        </CardContent>
        <CardFooter className="flex flex-row-reverse gap-2">
          <Button
            disabled={
              isEditing || selectedInstructors.length <= 0 ? true : false
            }
            onClick={() => addInstructor()}
          >
            <span>إضافة</span>
            <Plus />
          </Button>
          <Button
            variant={"outline"}
            className="hover:text-destructive"
            onClick={closeDialog}
          >
            <span>إغلاق</span>
            <X />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
