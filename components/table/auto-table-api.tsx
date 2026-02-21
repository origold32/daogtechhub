"use client";

import React from "react";
import Table from "@/components/table/Table";
import TableBody from "@/components/table/TableBody";
import TableHead from "@/components/table/TableHead";
import TableHeadCol from "@/components/table/TableHeadCol";
import TableBodyRow from "@/components/table/TableBodyRow";
import TableBodyCol from "@/components/table/TableBodyCol";
import TablePagination2 from "@/components/table/TablePagination2";
import { useThrottledCallback } from "@mantine/hooks";
import InputSearch from "../input-search";
import useTableDataController from "./useTableDataController";
import CurrencyAmount from "../currency-amount";
import DateFormatterToText from "../date-formatter-to-text";
import { getObjectKeyData } from "@/lib/get-object-key-data";
import InputSelectV1 from "../input-select-v1";
import { cn } from "@/lib/utils";

export type TableColProps = {
  name: string;
  type: "text" | "currency" | "date" | "custom";
  render?: (data: any, fullItem?: any) => React.ReactNode;
  dataKey: string[];
  dateMode?: "date" | "time" | "datetime";
  dateDisplay?: "human" | "short" | "long";
  className?: string;
};

export type AutoTableApiProps = {
  cols: TableColProps[];
  apiUrl?: string;
  apiDataKey?: string;
  isLoading?: boolean;
  data?: any[];
  useExternalData?: boolean;
  pageSize?: number; // default: 30
  tableWrapClassName?: string;
  tableClassName?: string;
  divClassName?: string;
  tableHeadClassName?: string;
  getRowClassName?: (row: any, index: number) => string;
  showSort?: boolean;
  showSearch?: boolean;
  sortOptions?: { value: string; content: string }[];
};

const AutoTableApi = ({
  apiUrl = "",
  cols,
  apiDataKey,
  data: externalData,
  useExternalData = false,
  isLoading: externalIsLoading = false,
  pageSize = 30,
  tableWrapClassName = "",
  tableClassName = "",
  divClassName = "",
  tableHeadClassName = "",
  getRowClassName,
  showSort = false,
  showSearch = false,
  sortOptions = [
    { value: "all", content: "All" },
    { value: "latest", content: "Latest" },
    { value: "popular", content: "Popular" },
  ],
}: AutoTableApiProps) => {
  const {
    data: fetchedData,
    isLoading: fetchIsLoading,
    onSearch,
    onNextPage,
    onPrevPage,
    page,
    total,
  } = useTableDataController({
    url: apiUrl,
    apiDataKey,
    externalData,
    pageSize,
  });

  const data = useExternalData ? externalData : fetchedData;
  const isLoading = useExternalData ? externalIsLoading : fetchIsLoading;

  const throttledSetValue = useThrottledCallback(
    (value) => onSearch(value),
    500
  );

  return (
    <div className="w-full space-y-4">
      {(showSort || showSearch) && (
        <div className="flex items-center justify-between p-3 bg-white rounded-full gap-3 flex-wrap">
          {showSort && (
            <InputSelectV1
              name="sort"
              label="Sort by"
              placeholder="Select sort option"
              items={sortOptions}
              rootClassName="min-w-[160px]"
              className="rounded-full"
            />
          )}

          {showSearch && (
            <InputSearch
              className="bg-[#F5F5F5] rounded-full"
              searchClassName="bg-[#F5F5F5] border-none"
              onChange={(e) => throttledSetValue(e.target.value)}
            />
          )}
        </div>
      )}

      <div className={cn("w-full rounded-lg", tableWrapClassName)}>
        <Table
          isLoading={isLoading}
          isEmpty={data.length === 0}
          tableClassName={tableClassName}
          divClassName={divClassName}
        >
          <TableHead className={cn("bg-[#f5f5f5]", tableHeadClassName)}>
            {cols.map(({ name }) => (
              <TableHeadCol key={name}>{name}</TableHeadCol>
            ))}
          </TableHead>
          <TableBody>
            {data.map((item: any, i: number) => (
              <TableBodyRow
                key={i}
                className={getRowClassName?.(item, i) ?? ""}
              >
                {cols.map((col, colIndex) => {
                  const value = getObjectKeyData(item, col.dataKey);

                  if (col.type === "text") {
                    let displayValue = value;

                    if (col.dataKey.includes("roles")) {
                      if (Array.isArray(value)) {
                        displayValue = value
                          .map((r) => r.replace(/_/g, " "))
                          .join(", ");
                      } else if (typeof value === "string") {
                        displayValue = value.replace(/_/g, " ");
                      }
                    }

                    return (
                      <TableBodyCol key={colIndex} className={col.className}>
                        {displayValue || "N/A"}
                      </TableBodyCol>
                    );
                  }

                  if (col.type === "currency") {
                    return (
                      <TableBodyCol key={colIndex}>
                        <CurrencyAmount
                          className={col.className}
                          curr={getObjectKeyData(item, ["currency"])}
                          amount={value}
                        />
                      </TableBodyCol>
                    );
                  }

                  if (col.type === "date") {
                    return (
                      <TableBodyCol key={colIndex}>
                        <DateFormatterToText
                          date={value}
                          mode={col.dateMode || "date"}
                          display={col.dateDisplay || "human"}
                          className={col.className}
                        />
                      </TableBodyCol>
                    );
                  }

                  if (col.type === "custom" && col.render) {
                    return (
                      <TableBodyCol key={colIndex} className={col.className}>
                        {col.render(value, item)}
                      </TableBodyCol>
                    );
                  }

                  return null;
                })}
              </TableBodyRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {total > 1 && (
        <TablePagination2
          page={page}
          total={total}
          onNext={onNextPage}
          onPrev={onPrevPage}
        />
      )}
    </div>
  );
};

export default AutoTableApi;
