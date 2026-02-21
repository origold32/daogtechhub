"use client";

import { ReactNode, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

type MenuCardProps = DropdownMenuProps & {
  items: (ReactNode | ((val?: any) => ReactNode))[];
  itemsActions?: ((close: () => void) => void)[];
  content?: ReactNode;
  className?: string;
  dontCloseOnClickMenu?: boolean;
};

const MenuCard = ({ content, items, itemsActions = [], dontCloseOnClickMenu, className, ...dropdownMenuProps }: MenuCardProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className={cn("relative flex  justify-between p-5 *:z-10 shadow-none min-w-[250px] h-auto", className)}>
      {content}
      <DropdownMenu open={open} onOpenChange={setOpen} {...dropdownMenuProps}>
        <DropdownMenuTrigger asChild={true} className="">
          <Button variant={"ghost"} className=" h-8 w-8 bg-primary/5 hover:bg-primary/10 shrink-0" size={"icon"}>
            <EllipsisVertical className=" text-primary" size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className=" w-[200px]" onCloseAutoFocus={() => {}} align="end">
          {items.map((el, i) => {
            return (
              <DropdownMenuItem
                className=" py-2"
                onSelect={(e) => {
                  dontCloseOnClickMenu && e.preventDefault();
                  if (itemsActions && typeof itemsActions[i] === "function") {
                    itemsActions[i](() => setOpen(false));
                  }
                }}
                key={i}
              >
                {typeof el == "function" ? el("heyy") : el}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};

export default MenuCard;
