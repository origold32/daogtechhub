"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function useUrlQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("search param change", searchParams);
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set(name, value);
      console.log("create ig querystring", name, value, params.toString());

      return params.toString();
    },
    [searchParams]
  );

  // wrapped
  const setQueryParam = useCallback(
    (name: string, value: string | number, push?: boolean): void => {
      console.log("in query updateder", name, value);
      if (push) {
        router.push(pathname + "?" + createQueryString(name, `${value}`), { scroll: false });
      } else {
        router.replace(pathname + "?" + createQueryString(name, `${value}`), { scroll: false });
      }
    },
    [createQueryString, router, pathname]
  );

  const getQueryParam = useCallback(
    (name: string): string | null | undefined => {
      return searchParams?.get(name);
    },
    [searchParams]
  );

  return { setQueryParam, getQueryParam };
}
