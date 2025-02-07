import {
  MoreHorizontal,
  Pencil,
  Trash,
  TrendingUp,
  Users,
  Users2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";

interface ActivityActionsProps {
  handleEdit: () => void;
  handleDelete: () => void;
  handleInstructors: () => void;
  handleTrainees: () => void;
  handleRating: () => void;
}

export default function ActivityActions({
  handleDelete,
  handleEdit,
  handleInstructors,
  handleTrainees,
  handleRating,
}: ActivityActionsProps) {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger>
        <Button size={"icon"} variant={"secondary"}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuGroup className="*:cursor-pointer *:flex *:gap-2 *:items-center *:justify-between space-y-2 *:p-2 *:rounded-md hover:*:bg-primary hover:*:text-primary-foreground *:transition-colors">
          <DropdownMenuItem onClick={handleEdit}>
            <span>تعديل</span>
            <Pencil className="w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleInstructors}>
            <span> قائمة المدربين </span>
            <Users2 className="w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTrainees}>
            <span> قائمة المتدربين </span>
            <Users className="w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRating}>
            <span>تقييم النشاط</span>
            <TrendingUp className="w-4 h-4" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="bg-destructive text-destructive-foreground"
            onClick={handleDelete}
          >
            <span>حذف</span>
            <Trash className="w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
