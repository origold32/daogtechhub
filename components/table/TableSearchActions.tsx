"use client";

import { FolderUp, FolderUpIcon, Search, SortAsc } from "lucide-react";
import React, { useState } from "react";
import { axiosBaseInstance } from "@/axios";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/downloadFile";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ITableSearchActions {
  tabData: unknown; // Replace 'unknown' with a more specific type if possible
  isSortActive?: boolean;
  showSort?: boolean;
  exportUrl?: string;
  onSortChange?: () => void; // Function accepting an event parameter
  type?: string;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // Function accepting an event parameter
  searchValue?: string;
}

const TableSearchActions = ({
  tabData,
  isSortActive,
  showSort = false,
  onSortChange = () => {},
  exportUrl = "/users/export-users-data",
  type = "",
  className,
  onChange = () => {},
  searchValue,
}: ITableSearchActions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log("is sort active", isSortActive);

  const getCSVData = async (range: number[] = [1, 2]) => {
    setIsOpen(false);
    setLoading(true);
    const query = range
      ? `?from=${range[0]}&to=${range[1]}&tab=${tabData}`
      : `?tab=${tabData}`;
    try {
      const resp = await axiosBaseInstance.get(`${exportUrl}${query}`);
      console.log("resp is", resp, resp?.data);
      toast.success(resp.message);
      downloadCSV(`${resp?.data}`, type);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message ?? error.message);
    }
  };

  return (
    <div className={` !overflow-y-hidden/ flex items-cente gap-4 ${className}`}>
      {showSort ? (
        <button
          onClick={() => onSortChange()}
          className={`flex items-center px-3 py-2 text-sm gap-2 border-[#BDBDBD] border font-semibold  rounded-lg ${
            isSortActive ? " !bg-color-primary !text-white" : " text-black/60"
          }`}
        >
          <SortAsc size={18} />
          <span className=" ">Sortby: Latest</span>
        </button>
      ) : null}

      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          size={18}
          type="search"
          onChange={onChange}
          value={searchValue}
          className="w-full rounded-lg bg-background pl-8 md:max-w-[400px] "
        />
      </div>
      {exportUrl ? (
        <Button className="ml-auto" variant="outline">
          <FolderUpIcon size={18} className="mr-2" /> Export
        </Button>
      ) : null}
    </div>
  );
};

export default TableSearchActions;
