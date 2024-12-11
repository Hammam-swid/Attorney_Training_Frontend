import { useSearchParams } from "react-router-dom";

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  return <div className="p-6">the type is {type}</div>;
}
