import { ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Input } from "./input";

interface Item {
  label: string;
  value: string;
}

interface ComboboxProps {
  title?: string;
  data: { label: string; value: string }[];
  isLoading: boolean;
  search: string;
  setSearch: (s: string) => void;
  item: Item;
  setItem: (v: Item) => void;
}

export function Combobox({
  title,
  search,
  setSearch,
  data,
  isLoading,
  item,
  setItem,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  console.log("the data recieved is: ", data);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          <span className="max-w-20 block whitespace-nowrap text-nowrap text-ellipsis overflow-hidden">
            {item.value
              ? data.find((item) => item.value === item.value)?.label
              : title || "اختر أحد الخيارات"}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        {/* <Command value={value}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="ابحث هنا..."
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>لا خيارات موجودة.</CommandEmpty>
            {data?.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                {item.label}
                <Check
                  className={cn(
                    "ml-auto",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command> */}
        <Input
          className="p-0 h-5 rounded-sm  focus:outline"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="space-y-1 mt-2">
          {isLoading ? (
            <Loader2 className=" block mx-auto my-1 text-primary animate-spin" />
          ) : (
            data.map((item) => (
              <li
                onClick={() => setItem(item)}
                key={item.value}
                className={`cursor-pointer hover:bg-muted px-2 ${
                  item.value === item.value && "bg-muted"
                }`}
              >
                {item.label}
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
