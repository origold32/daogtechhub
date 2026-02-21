import { useUrlState } from "@/hooks/useUrlState";
import { fetcher } from "@/swr";
import useSWR from "swr";
import { useMemo } from "react";

type UseTableDataControllerOptions<T> = {
  url?: string;
  apiDataKey?: string;
  externalData?: T[];
  pageSize?: number;
};

export default function useTableDataController<T = any>({
  url = "",
  apiDataKey = "data",
  externalData,
  pageSize = 30,
}: UseTableDataControllerOptions<T>) {
  const [page, setPage] = useUrlState<number>("page", 1);
  const [search, setSearch] = useUrlState<string>("search", "");

  const pageParam = Number(page) || 1;
  const searchParam = search || "";

  // ----- Remote data via API -----
  const finalUrl = url
    ? `${url}?page=${pageParam}${
        searchParam ? `&search=${encodeURIComponent(searchParam)}` : ""
      }`
    : null;

  const { data: apiData, isLoading: remoteLoading } = useSWR(
    externalData ? null : finalUrl,
    fetcher
  );

  const meta = apiData?.data?.meta;
  const apiTotalItems = meta?.total ?? 0;
  const apiLimit = meta?.limit ?? pageSize;
  const apiTotalPages = meta?.totalPages ?? Math.ceil(apiTotalItems / apiLimit);

  // ----- Local pagination for externalData -----
  const filteredExternalData = useMemo(() => {
    if (!externalData) return [];

    const lowerSearch = searchParam.toLowerCase();
    return lowerSearch
      ? externalData.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(lowerSearch)
        )
      : externalData;
  }, [externalData, searchParam]);

  const paginatedExternalData = useMemo(() => {
    const start = (pageParam - 1) * pageSize;
    const end = start + pageSize;
    return filteredExternalData.slice(start, end);
  }, [filteredExternalData, pageParam, pageSize]);

  const externalTotalPages = useMemo(
    () => Math.ceil(filteredExternalData.length / pageSize),
    [filteredExternalData, pageSize]
  );

  const isUsingExternal = !!externalData;

  const onNextPage = () => {
    const maxPages = isUsingExternal ? externalTotalPages : apiTotalPages;
    if (pageParam < maxPages) {
      setPage(pageParam + 1);
    }
  };

  const onPrevPage = () => {
    if (pageParam > 1) {
      setPage(pageParam - 1);
    }
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  // Debug logging
  // console.log("Debug Info:", {
  //   isUsingExternal,
  //   pageParam,
  //   pageParamType: typeof pageParam,
  //   pageSize,
  //   totalItems: filteredExternalData.length,
  //   totalPages: externalTotalPages,
  //   currentPageData: paginatedExternalData.length,
  //   start: (pageParam - 1) * pageSize,
  //   end: (pageParam - 1) * pageSize + pageSize,
  //   sliceStart: (pageParam - 1) * pageSize,
  //   sliceEnd: (pageParam - 1) * pageSize + pageSize,
  // });

  return {
    data: isUsingExternal
      ? paginatedExternalData
      : apiData?.data?.[apiDataKey] ?? [],
    page: pageParam,
    search: searchParam,
    totalPages: isUsingExternal ? externalTotalPages : apiTotalPages,
    totalItems: isUsingExternal ? filteredExternalData.length : apiTotalItems,
    total: isUsingExternal ? externalTotalPages : apiTotalPages,
    isLoading: isUsingExternal ? false : remoteLoading,
    onNextPage,
    onPrevPage,
    onSearch,
  };
}
