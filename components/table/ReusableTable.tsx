"use client";

import * as React from "react";
import TableHeadCol from "./TableHeadCol";
import { useTableRouteApiSearchPagination } from "./useTableRouteApiSearchPagination";
import TableSearchActions from "./TableSearchActions";
import Table from "./Table";
import TableHead from "./TableHead";
import TableBodyRow from "./TableBodyRow";
import TableBodyCol from "./TableBodyCol";
import TableBody from "./TableBody";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Package } from "lucide-react";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { extractFirstLetters } from "@/lib/text";
import TablePagination2 from "./TablePagination2";

export interface TableHeadCol {
  name: string;
  dataKey: string;
  userNameType?: {
    dataKeyName: string;
    dataKeyUsername: string;
  };
  iconType?: {
    icon?: React.ReactNode;
    suffix?: string;
  };
  viewType?: boolean;
}

export interface ReusabelTableProps {
  tableApiUrl: string;
  rowLink?: string;
  rowLinkDataKey?: string;
  tableHeadCols: TableHeadCol[];
  addSerialNum?: boolean;
  addView?: boolean;
}

export function ReusabelTable({ addSerialNum = true, addView = true, ...props }: ReusabelTableProps) {
  const tableHeadColsNames: string[] = props.tableHeadCols?.map((col) => col.name);
  addSerialNum ? tableHeadColsNames.unshift("S/N") : null;
  addView ? tableHeadColsNames.push("") : null;

  const { data, isLoading, search, onSearchInputChange, page, updatePage, onNextPage, onPrevPage } = useTableRouteApiSearchPagination(props.tableApiUrl);
  return (
    <div className=" ">
      <TableSearchActions searchValue={search} onChange={onSearchInputChange} tabData={{ data: "" }} className="mb-10" />

      <Table isLoading={isLoading} isEmpty={data.length == 0}>
        <TableHead>
          {tableHeadColsNames.map((colName: string) => {
            return <TableHeadCol key={colName}>{colName}</TableHeadCol>;
          })}
        </TableHead>
        <TableBody>
          {data?.map((el: any, i: number) => {
            return (
              <TableBodyRow link={props.rowLink ? `${props.rowLink}/${el[props.rowLinkDataKey || "id"]}` : ""} key={i}>
                {addSerialNum ? <TableBodyCol>{i + 1}</TableBodyCol> : null}
                {props.tableHeadCols.map((col) => {
                  if (col.userNameType) {
                    return (
                      <TableBodyCol key={col.dataKey}>
                        <div className="flex items-center gap-2">
                          <Avatar className=" w-28 h-28 rounded-lg border-4 border-white relative">
                            <AvatarImage src={el[col.userNameType.dataKeyUsername] ?? "https://github.com/shadcn.png"} />
                            <AvatarFallback className=" text-lg bg-stone-300">{extractFirstLetters(el[col.userNameType.dataKeyUsername])}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs text-gray-brand6 font-medium">{el[col.userNameType.dataKeyName]}</p>
                            <p className="text-gray-brand5  text-xs font-normal">@ {el[col.userNameType.dataKeyUsername]}</p>
                          </div>
                        </div>
                      </TableBodyCol>
                    );
                  }
                  if (col.iconType) {
                    return (
                      <TableBodyCol key={col.iconType.suffix}>
                        <div className="flex items-center gap-2">
                          {col.iconType.icon}
                          <span>
                            {el[col.dataKey]}
                            <span className="ml-[2px]">{col.iconType.suffix}</span>{" "}
                          </span>
                        </div>
                      </TableBodyCol>
                    );
                  }

                  if (col.dataKey) {
                    return <TableBodyCol key={el[col.dataKey]}>{el[col.dataKey]}</TableBodyCol>;
                  }
                })}
                {addView ? (
                  <TableBodyCol key={"view"}>
                    <div className="flex items-center text-orange-brand gap-2">
                      <span>
                        <Package />
                      </span>
                      <span>View</span>
                    </div>
                  </TableBodyCol>
                ) : null}
              </TableBodyRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination2 page={page} total={3} onNext={onNextPage} onPrev={onPrevPage} />
    </div>
  );
}
