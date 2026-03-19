"use client";

import customResponseApiRequest, { apiMethod } from "@/axios/make-api-request";
import { toast } from "sonner";
import { useState } from "react";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import { fetcher, logger } from ".";

interface SwrConfig extends SWRConfiguration {}

interface UseRemoteDataProps {
  url: string;
  remoteMutateUrl?: string;
  remoteMutateMethod?: apiMethod;
  options?: SwrConfig;
}

export default function useRemoteData<
  T extends Record<string, any> | undefined
>(config: UseRemoteDataProps) {
  const { data, mutate, isLoading, error, isValidating } = useSWR<T>(
    config.url,
    fetcher,
    { use: [logger], ...config.options }
  );
  const [mutating, setMutating] = useState(false);

  // ── BUG FIX: The old implementation had a cleanup effect that captured
  // `originalDataRef` and `currentDataRef` in its deps array ([data, mutate]).
  // Every time `data` changed, React ran the *previous* cleanup which called
  // mutate(originalData) — silently reverting any update the user just made.
  // The cleanup only makes sense on unmount (empty deps), and even then only
  // if you want to restore stale data on navigation — which breaks pagination,
  // filters, and real-time updates. Removed entirely. ──────────────────────

  function mutateLocalData(updatedData: T) {
    mutate(updatedData, { revalidate: false });
  }

  async function mutateRemoteData(updatedData?: T) {
    setMutating(true);
    try {
      const resp = await customResponseApiRequest({
        type: config.remoteMutateMethod || "patch",
        url: config.remoteMutateUrl || config.url,
        data: updatedData || data,
      });
      setMutating(false);
      toast.success(resp?.message);
      // Re-validate from server after successful mutation
      mutate();
    } catch (error: any) {
      setMutating(false);
      toast.error(error?.message);
    }
  }

  return {
    data,
    mutate,
    isLoading,
    isValidating,
    error,
    mutating,
    mutateLocalData,
    mutateRemoteData,
  };
}
