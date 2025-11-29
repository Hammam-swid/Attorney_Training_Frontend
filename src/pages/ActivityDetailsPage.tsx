import { useParams } from "react-router";

export default function ActivityDetailsPage() {
  const { activityId } = useParams();
  return <div>Activity Details Page for ID: {activityId}</div>;
}
