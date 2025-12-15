import { Trainee } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState, useEffect } from "react";

interface TraineesTableProps {
  trainees: Trainee[];
  fields: string[];
  type: string;
  payGrade: string;
  allFields: { label: string; value: keyof Trainee }[];
}

export default function TraineesTable({
  trainees,
  fields,
  type,
  payGrade,
  allFields,
}: TraineesTableProps) {
  const [displayedTrainees, setDisplayedTrainees] = useState<Trainee[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Initialize with the first batch of trainees
    setDisplayedTrainees(trainees.slice(0, 20));
  }, [trainees]);

  const fetchMoreData = () => {
    if (displayedTrainees.length >= trainees.length || trainees.length === 0) {
      setHasMore(false);
      return;
    }
    // Fetch next batch of trainees
    setDisplayedTrainees((prev) => [
      ...prev,
      ...trainees.slice(prev.length, prev.length + 20),
    ]);
  };

  return (
    <InfiniteScroll
      dataLength={displayedTrainees.length}
      next={fetchMoreData}
      hasMore={hasMore}
      loader={<></>} //{<Loader2 className="animate-spin" />}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">ت.</TableHead>
            {allFields
              .filter((f) => fields.includes(f.value))
              .map((field) => (
                <TableHead className="text-center" key={field.value}>
                  {field.label}
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedTrainees
            ?.filter((t) =>
              type === "all" ? true : String(t.traineeType.id) === type
            )
            .filter((t) =>
              payGrade === "all" ? true : t.payGrade === payGrade
            )
            ?.map((trainee, index) => (
              <TableRow key={trainee.id}>
                <TableCell>{index + 1}</TableCell>
                {allFields
                  .filter((f) => fields.includes(f.value))
                  .map((field) => (
                    <TableCell className="text-center" key={field.value}>
                      {(() => {
                        const value = trainee[field.value as keyof Trainee];
                        console.log(field.value);
                        if (value === null || value === undefined) {
                          return <span className="text-gray-500">//</span>;
                        }
                        // Handle TraineeType object
                        if (typeof value === "object" && "name" in value) {
                          return value.name;
                        }
                        return value;
                      })()}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </InfiniteScroll>
  );
}
