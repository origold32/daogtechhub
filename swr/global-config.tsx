"use client";
import { ReactNode } from "react";
import { SWRConfig } from "swr";

export default function SWRGlobalConfigProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        errorRetryCount: 0,          // Don't retry failed requests at all
        revalidateOnFocus: false,    // Don't refetch when tab regains focus
        revalidateOnReconnect: false,// Don't refetch on reconnect
        dedupingInterval: 5000,      // Cache requests for 5s — prevents duplicate calls
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          // Never retry 401/404/403
          if ([401, 403, 404].includes(error?.statusCode)) return;
          if (retryCount >= 1) return;
          revalidate({ retryCount });
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
