import { ReactNode, useState } from "react";
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
import { Activity } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActivityService } from "@/services/activity.service";
import toast from "react-hot-toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

interface Props {
  children: ReactNode;
  activity: Activity;
}

export default function ActivityRating({ children, activity }: Props) {
  const { formik, open, setOpen } = useActivityRating(activity);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تقييم النشاط</DialogTitle>
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
            <Button type="submit" className="w-full mt-3">
              <span>تقييم</span>
              <Check />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const useActivityRating = (activity: Activity) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationKey: ["rating-activity", { activityId: activity.id }],
    mutationFn: (rating: number | undefined) =>
      ActivityService.rateActivity(activity.id, rating),
    onSuccess: () => {
      toast.success("تم تقييم النشاط بنجاح");
      queryClient.invalidateQueries({
        queryKey: ["training-activity", { activityId: String(activity.id) }],
      });
      setOpen(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التقييم");
      setOpen(false);
    },
  });
  const formik = useFormik<{ rating: number | undefined }>({
    initialValues: {
      rating: activity.rating || undefined,
    },
    validationSchema: Yup.object({
      rating: Yup.number()
        .required("التقييم مطلوب")
        .min(1, "التقييم يجب أن يكون أكبر من 1")
        .max(100, "التقييم يجب أن يكون أصغر من 100")
        .typeError("التقييم يجب أن يكون رقماً"),
    }),
    onSubmit: async (values) => {
      await mutateAsync(values.rating);
    },
  });
  return { formik, open, setOpen };
};
