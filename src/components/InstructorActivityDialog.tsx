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

interface InstructorActivityDialogProps {
  activityId: number;
}

export default function InstructorActivityDialog({
  activityId = 1,
}: InstructorActivityDialogProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [allInstructors, setAllInstructors] = useState<
    { label: string; value: number }[]
  >([]);
  const [selectedInstructors, setSelectedInstructors] = useState<
    { label: string; value: number }[]
  >([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchInstructors = async () => {
      const { data } = await axios.get<
        unknown,
        { data: { data: { instructors: Instructor[] } } }
      >(`/api/v1/instructors`);
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
  console.log(instructors);

  const closeDialog = () => {};
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
      <Card className="bg-background p-6">
        <CardHeader>
          {/* <CardTitle>قائمة المدربين</CardTitle> */}
          <h3 className="text-lg font-bold text-center">قائمة المدربين</h3>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="font-medium">{instructor.id}</TableCell>
                  <TableCell>{instructor.name}</TableCell>
                  <TableCell>
                    {!isEditing ? (
                      instructor.rating.toFixed(2)
                    ) : (
                      <span className="relative">
                        <Input className="w-20" value={instructor.rating} />
                        <Button
                          size={"icon"}
                          variant={"ghost"}
                          className="absolute left-0 top-0"
                          onClick={() => setIsEditing(false)}
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
                        setIsEditing(!isEditing);
                      }}
                      className="hover:bg-primary hover:text-primary-foreground"
                    >
                      {!isEditing ? <Edit /> : <Check />}
                    </Button>
                    <Button
                      size={"icon"}
                      variant={"destructive"}
                      onClick={() => {
                        console.log("delete");
                      }}
                    >
                      <Trash />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <MultiSelect
            labelledBy=""
            options={allInstructors}
            value={selectedInstructors}
            onChange={setSelectedInstructors}
          />
        </CardContent>
        <CardFooter className="flex flex-row-reverse gap-2">
          <Button>
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
