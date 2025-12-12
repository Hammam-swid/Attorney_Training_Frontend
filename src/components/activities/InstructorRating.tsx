import { Instructor } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { ActivityService } from "@/services/activity.service";
import toast from "react-hot-toast";
import { useState } from "react";

interface Props {
  instructor: Instructor;
  children: React.ReactNode;
}

export default function InstructorRating({ instructor, children }: Props) {
  const queryClient = useQueryClient();
  const { activityId } = useParams();
  const [open, setOpen] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["rate-instructor", { activityId }, instructor.id],
    mutationFn: (values: { rating: number | undefined }) =>
      ActivityService.rateInstructor(
        activityId!,
        instructor.id,
        values.rating!
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructors", "for-activity", { activityId }],
      });
      toast.success("تم تقييم المدرب");
      setOpen(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تقييم المدرب");
    },
  });

  const formik = useFormik<{ rating: number | undefined }>({
    initialValues: {
      rating: instructor.rating || undefined,
    },
    validationSchema: Yup.object({
      rating: Yup.number()
        .required("التقييم مطلوب")
        .min(1, "التقييم يجب أن يكون أكبر من 1")
        .max(100, "التقييم يجب أن يكون أصغر من 100")
        .typeError("التقييم يجب أن يكون رقماً"),
    }),
    onSubmit: async (values) => {
      await mutateAsync(values);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تقييم المدرب "{instructor.name}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <Input
            id="rating"
            name="rating"
            value={formik.values.rating}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.rating && formik.errors.rating && (
            <p className="text-sm text-destructive">{formik.errors.rating}</p>
          )}
          <DialogFooter>
            <Button disabled={isPending} type="submit" className="w-full mt-3">
              <span>تقييم</span>
              <Check />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
