import { Trainee } from "@/types";
import { Combobox } from "./ui/comboBox";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";

interface Item {
  label: string;
  value: string;
}

interface TraineesComboboxProps {
  trainee: Item;
  setTrainee: (v: Item) => void;
}

export default function TraineesCombobox({
  trainee,
  setTrainee,
}: TraineesComboboxProps) {
  const [search, setSearch] = useState("");
  const { data: instructors, isLoading } = useQuery({
    queryKey: ["trainees", { page: 1 }, { search }],
    queryFn: async () => {
      const res = await api.get<{
        data: { trainees: Trainee[]; count: number };
      }>(`/api/v1/trainees?search=${search}&page=1&limit=10`);
      return res.data.data.trainees;
    },
  });
  return (
    <Combobox
      data={
        instructors?.map((i) => ({ label: i.name, value: i.id.toString() })) ||
        []
      }
      title="اختر المدرب"
      isLoading={isLoading}
      search={search}
      setSearch={setSearch}
      item={trainee}
      setItem={setTrainee}
    />
  );
}
