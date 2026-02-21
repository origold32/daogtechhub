"use client";
import { useCallback, useEffect } from "react";
import useUrlQueryParams from "./useUpdateQuerySearchParams";

type SetQueryParamState = (value: string | number) => void;

export default function useUrlQueryState<T extends string | number>(
  paraName: string,
  defaultValue?: T,
  push?: boolean
): [T, SetQueryParamState] {
  const { setQueryParam, getQueryParam } = useUrlQueryParams();
  const queryParam = getQueryParam(paraName) as T;

  const setQueryParamState = useCallback(
    (value: string | number) => {
      console.log("setting active tab...", value, paraName);
      // Pass the push parameter here too
      setQueryParam(paraName, value, push);
    },
    [paraName, setQueryParam, push] // Add push to dependencies
  );

  useEffect(() => {
    if (
      (defaultValue !== undefined || defaultValue !== null) &&
      (queryParam === undefined || queryParam === null)
    ) {
      setQueryParam(paraName, `${defaultValue}`, push);
    }
  }, [defaultValue, paraName, push, queryParam, setQueryParam]);

  return [queryParam ?? defaultValue, setQueryParamState];
}
