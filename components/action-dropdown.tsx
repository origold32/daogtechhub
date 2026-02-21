"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoEllipsisHorizontal } from "react-icons/io5";

export type DropdownAction = {
  name: string;
  icon: React.ElementType;
  onClick: (id: string) => void;
  color?: string;
};

export default function ActionDropdown({
  id,
  actions,
}: {
  id: string;
  actions: DropdownAction[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title="Actions"
          className="flex justify-center items-center p-2 hover:bg-gray-100 rounded-md transition-colors focus:ring-2 focus:ring-primary-5 focus:outline-none"
        >
          <IoEllipsisHorizontal />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={8}
      >
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => action.onClick(id)}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <action.icon size={14} color={action.color || "currentColor"} />
            {action.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
