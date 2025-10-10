import { Instructor } from "@/types";
import { Combobox } from "./ui/comboBox";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";

interface Item {
  label: string;
  value: string;
}

interface InstructorsComboboxProps {
  instructor: Item;
  setInstructor: (v: Item) => void;
}

export default function InstructorsCombobox({
  instructor,
  setInstructor,
}: InstructorsComboboxProps) {
  const [search, setSearch] = useState("");
  const { data: instructors, isLoading } = useQuery({
    queryKey: ["instructors", { page: 1 }, { search }],
    queryFn: async () => {
      const res = await api.get<{
        data: { instructors: Instructor[]; count: number };
      }>(`/api/v1/instructors?search=${search}&page=1`);
      return res.data.data.instructors;
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
      item={instructor}
      setItem={setInstructor}
    />
  );
}
