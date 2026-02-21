import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export function useUrlState<T extends string | number | null>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();

  let rawValue = searchParams.get(key);
  const value =
    rawValue === null || rawValue === "" ? undefined : (rawValue as T);

  const setValue = useCallback(
    (newValue: T) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newValue === null || newValue === "") {
        params.delete(key);
      } else {
        params.set(key, String(newValue));
      }

      const search = params.toString();
      const query = search ? `?${search}` : "";

      router.push(`${window.location.pathname}${query}`);
    },
    [key, router, searchParams]
  );

  return [value ?? defaultValue, setValue];
}
