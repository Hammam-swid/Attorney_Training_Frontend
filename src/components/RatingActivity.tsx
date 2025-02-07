import { Activity } from "@/types";
import { Card, CardContent, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { useFormik } from "formik";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";

interface RatingActivityProps {
  activity: Activity;
  onCancel: () => void;
  updateRating: (activityId: number, rating: number) => void;
}

function RatingActivity({
  activity,
  onCancel,
  updateRating,
}: RatingActivityProps) {
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
      try {
        const res = await axios.post(
          `/api/v1/training-activities/${activity.id}/rate`,
          {
            rating: values.rating,
          }
        );
        if (res.status === 200) {
          toast.success("تم تقييم النشاط بنجاح");
          updateRating(activity.id, values.rating!);
          onCancel();
        }
      } catch (error) {
        console.log(error);
        toast.error("حدث خطأ أثناء التقييم");
      }
    },
  });
  return (
    <div
      onClick={(
        e: React.MouseEvent<HTMLDivElement, MouseEvent> & {
          target: HTMLDivElement;
        }
      ) => e.target.id === "rating-activity-overlay" && onCancel()}
      id="rating-activity-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 h-screen w-screen flex items-center justify-center z-50"
    >
      <Card className="p-3">
        <CardTitle>
          تقييم <span>{activity.title}</span>
        </CardTitle>
        <CardContent className="mt-5">
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
            <Button type="submit" className="w-full mt-3">
              <span>تقييم</span>
              <Check />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RatingActivity;
