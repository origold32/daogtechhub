"use client";

import customResponseApiRequest, { apiMethod } from "@/axios/make-api-request";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
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
  const originalDataRef = useRef<T>();
  const currentDataRef = useRef<T>();

  useEffect(() => {
    console.log("first use effect");
    if (!originalDataRef.current && data) {
      originalDataRef.current = data;
      console.log("setting original data", data);
    }
  }, [data, mutate]);

  useEffect(() => {
    console.log("second use effect");
    return () => {
      if (originalDataRef.current && currentDataRef.current) {
        if (
          JSON.stringify(originalDataRef.current) !==
          JSON.stringify(currentDataRef.current)
        ) {
          mutate(originalDataRef.current, { revalidate: false });
          console.log(
            "resetting data to original... originalData, data",
            originalDataRef.current,
            currentDataRef.current,
            data
          );
        }
      }
    };
  }, [data, mutate]);

  function mutateLocalData(updatedData: T) {
    mutate(updatedData, { revalidate: false });
    currentDataRef.current = updatedData;
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
      originalDataRef.current = data;
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
