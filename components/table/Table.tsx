"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import useOverflowCheck from "@/hooks/useOverflowCheck";
import { ChevronRight, LoaderIcon } from "lucide-react";
import EmptyState from "../empty-state";

const Table = ({
  isLoading,
  isEmpty,
  children,
  tableClassName,
  divClassName,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  tableClassName?: string;
  divClassName?: string;
  children: ReactNode;
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const { isOverflowing, scrollToEnd, scrollToStart, isAtEdge } =
    useOverflowCheck(tableRef);
  // console.log("is Overflowing", isOverflowing);
  // console.log("is at edge", isAtEdge, isAtEdge?.isAtStartX);

  useEffect(() => {
    if (!isLoading) {
      // console.log(" stoped loading scrolling sto start");
      scrollToStart(2, 2);
    }
  }, [isLoading, scrollToStart]);
  return (
    <div className="relative min-h-[200px]">
      {isLoading ? (
        <div
          className={
            "absolute inset-0 z-50 min-h-[200px] p-4 bg-white/40 flex justify-center pt-[50px]/ "
          }
        >
          <LoaderIcon className=" animate-spin" />
        </div>
      ) : null}

      {!isAtEdge?.isAtStartX ? (
        <div className=" absolute inset-y-0 left-0  w-[30px] /bg-white  grid /bg-gradient-to-l from-transparent to-white justify-start items-center z-10 ">
          <button
            onClick={() => scrollToStart()}
            className=" active:scale-[.9] transition-all -translate-x-2 border w-[40px] h-[40px] rounded-full bg-white shadow-sm flex items-center justify-center"
            title="Scroll to start"
          >
            <ChevronRight className=" rotate-180" />
          </button>
        </div>
      ) : null}
      {!isAtEdge?.isAtEndX ? (
        <div className=" absolute inset-y-0 right-0  w-[30px] /bg-white  grid bg-gradient-to-r from-transparent to-white justify-end items-center z-10 ">
          <button
            onClick={() => scrollToEnd()}
            className=" active:scale-[.9] transition-all  translate-x-2 border w-[40px] h-[40px] rounded-full bg-white shadow-sm flex items-center justify-center"
            title="Scroll to end"
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}

      <div
        ref={tableRef}
        className={`/relative overflow-x-auto  /scroll_hide ${divClassName}`}
      >
        <table className={`w-full min-w-max  ${tableClassName}`}>
          {children}
        </table>

        {isEmpty ? (
          <div className=" min-h-[200px] flex items-center">
            {" "}
            <EmptyState className={" rounded-none "} title={"No Data!"} />{" "}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Table;
