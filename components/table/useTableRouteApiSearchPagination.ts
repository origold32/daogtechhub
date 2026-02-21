"use client";

import useUrlQueryParams from "@/hooks/useUpdateQuerySearchParams";
import { getObjectKeyData } from "@/lib/get-object-key-data";
import { fetcher } from "@/swr";
// import queryFunction from "@/react-query/queryFunction";
// import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

export function useTableRouteApiSearchPagination(baseUrl: string, apiListKeyPath: string[] = ["data", "data"]) {
  const { setQueryParam } = useUrlQueryParams();
  const searchParams = useSearchParams();

  const search = searchParams?.get("search") || "";
  const page = searchParams?.get("page") || 1;

  // split and seprate any query if any on the base url provided
  const baseUrlQuery = new URLSearchParams(baseUrl.split("?")[1]).toString();
  console.log("base URL query", baseUrlQuery, baseUrl.split("?"));
  const baseUrlPathname = baseUrl.split("?")[0];

  const apiQuery = `page=${page}&limit=10`;
  let url = `${baseUrlPathname}?${apiQuery}`;
  if (baseUrlQuery) {
    url += `&${baseUrlQuery}`;
  }
  console.log("base url path name", url);

  const { data: apiData, isLoading } = useSWR(url, fetcher);
  // console.log("query is", apiData, apiData?.data?.data);
  console.log("query is", apiData, getObjectKeyData(apiData, apiListKeyPath));

  const data = getObjectKeyData(apiData, apiListKeyPath) ?? [];

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParam("search", e.target.value);
  };
  const updatePage = (page: string) => {
    setQueryParam("page", page);
  };

  const onNextPage = () => {
    setQueryParam("page", `${+page + 1}`);
  };
  const onPrevPage = () => {
    if (+page > 1) {
      setQueryParam("page", `${+page - 1}`);
    }
  };

  return {
    data,
    isLoading,
    search,
    onSearchInputChange,
    page,
    updatePage,
    onNextPage,
    onPrevPage,
  };
}
