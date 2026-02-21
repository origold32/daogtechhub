"use client";
import React from "react";
import { useThrottledCallback } from "@mantine/hooks";
import InputSearch from "./input-search";
import useTableDataController from "./table/useTableDataController";
import Loader3 from "./loaders/loader-3";
import TablePagination2 from "@/components/table/TablePagination2";
import { SmartAvatar } from "./smart-avatar";
import InputSelectV1 from "./input-select-v1";
import { cn } from "@/lib/utils";

export type AnalyticsItemProps = {
  id: string | number;
  avatar?: {
    text?: string;
    image?: string;
  };
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | number | React.ReactNode;
  valueColor?: string;
  extra?: React.ReactNode;
};

export type AutoAnalyticsApiProps<T> = {
  apiUrl?: string;
  apiDataKey?: string;
  data?: T[];
  useExternalData?: boolean;
  renderItem: (item: T, index: number) => AnalyticsItemProps;
  pageSize?: number; // default: 30
  isLoading?: boolean;
  emptyMessage?: string;
  showSearch?: boolean;
  showSort?: boolean;
  sortOptions?: { value: string; label: string }[];
  className?: string;
  itemClassName?: string;
  wrapperClassName?: string;
  hasFilter?: boolean;
  filterModes?: { title: string; value: string }[];
  filterKey?: string; // default: "role"
  getRowClassName?: (row: any, index: number) => string;
};

const AutoAnalyticsApi = <T,>({
  apiUrl = "",
  apiDataKey,
  data: externalData,
  useExternalData = false,
  isLoading: externalIsLoading = false,
  renderItem,
  emptyMessage = "No data available",
  showSearch = false,
  showSort = false,
  sortOptions = [
    { value: "all", label: "All" },
    { value: "latest", label: "Latest" },
    { value: "popular", label: "Popular" },
  ],
  className = "",
  itemClassName = "",
  wrapperClassName = "",
  getRowClassName,
  hasFilter = false,
  filterModes = [],
  filterKey = "role",
  pageSize = 30,
}: AutoAnalyticsApiProps<T>) => {
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

  const data = useExternalData ? fetchedData : fetchedData;
  const isLoading = useExternalData ? externalIsLoading : fetchIsLoading;

  const throttledSetValue = useThrottledCallback(
    (value) => onSearch(value),
    500
  );

  // Helper function to safely convert ReactNode to string
  const getStringFromReactNode = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return node.toString();
    if (React.isValidElement(node) && typeof node.props.children === "string") {
      return node.props.children;
    }
    return ""; // fallback for complex ReactNodes
  };

  const renderAnalyticsItem = (item: T, index: number) => {
    const analyticsItem = renderItem(item, index);

    const rowClass = getRowClassName?.(item, index) ?? "";

    return (
      <div
        key={analyticsItem.id}
        className={cn(
          "flex items-center justify-between p-4",
          rowClass,
          itemClassName
        )}
      >
        <div className="flex items-center space-x-3">
          {analyticsItem.avatar && (
            <SmartAvatar
              data={analyticsItem.avatar}
              src={analyticsItem.avatar.image}
              alt={getStringFromReactNode(analyticsItem.title)}
              getKey={() => analyticsItem.id.toString()}
              getInitialsName={() =>
                analyticsItem.avatar?.text ||
                getStringFromReactNode(analyticsItem.title)
              }
              avatarSizeClassName="w-10 h-10"
              fallbackTextClassName="text-sm"
              nameClassName="font-semibold"
            />
          )}

          <div>
            <p className="font-medium text-gray-900">{analyticsItem.title}</p>
            {analyticsItem.subtitle && (
              <p className="text-sm text-gray-500">{analyticsItem.subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={cn(
              "font-semibold",
              analyticsItem.valueColor || "text-green-600"
            )}
          >
            {analyticsItem.value}
          </div>
          {analyticsItem.extra && analyticsItem.extra}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn("p-4")}>
        <Loader3 />
      </div>
    );
  }

  const groupedData = hasFilter
    ? filterModes.map((mode) => ({
        title: mode.title,
        value: mode.value,
        items:
          data?.filter(
            (item: T) =>
              ((item as Record<string, unknown>)?.[filterKey || "role"] || "")
                .toString()
                .toLowerCase() === mode.value.toString().toLowerCase()
          ) || [],
      }))
    : [];

  return (
    <div className={cn("w-full space-y-4", className)}>
      {(showSearch || showSort) && (
        <div
          className={cn(
            "flex items-center justify-between p-3 bg-white rounded-full gap-3 flex-wrap"
          )}
        >
          {showSort && (
            <InputSelectV1
              name="sort"
              label="Sort by"
              placeholder="Select sort option"
              items={sortOptions.map((opt) => ({
                value: opt.value,
                content: opt.label,
              }))}
              rootClassName="min-w-[160px]"
            />
          )}

          {showSearch && (
            <InputSearch
              className={cn("bg-[#F5F5F5] rounded-full")}
              searchClassName={cn("bg-[#F5F5F5] border-none")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                throttledSetValue(e.target.value)
              }
            />
          )}
        </div>
      )}

      {hasFilter ? (
        <div className={cn("space-y-8")}>
          {groupedData
            .filter((section) => section.items.length > 0)
            .map((section) => (
              <div key={section.value}>
                <h2 className={cn("text-lg font-semibold mb-3 text-gray-700")}>
                  {section.title}
                </h2>
                <div
                  className={cn(
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 space-x-0 space-y-0",
                    wrapperClassName
                  )}
                >
                  {section.items.map((item: T, index: number) =>
                    renderAnalyticsItem(item, index)
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 space-x-0 space-y-0",
            wrapperClassName
          )}
        >
          {data && data.length > 0 ? (
            data.map((item: T, index: number) =>
              renderAnalyticsItem(item, index)
            )
          ) : (
            <div className={cn("col-span-full text-center py-8 text-gray-500")}>
              {emptyMessage}
            </div>
          )}
        </div>
      )}

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

export default AutoAnalyticsApi;
