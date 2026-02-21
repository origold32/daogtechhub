// swr setup: see data fetching -> https://swr.vercel.app/docs/data-fetching#fetch
// The fetcher is the very fundamental API of SWR.
// The fetcher is an async function passed as the second arg to the SWR hooks (useSWr and useSWRMutaion)
// useSWR (for get mostly, depending on fetcher implementation) and useSWRMutaion for remote mutation (eg:post, patch,delete,put)
// useSWRMutation dosen't trigger the request automatically, instead it returns trigger for you to call it to start
// The fetcher function accepts the key(url) passed to useSWR/useSWRMutation hook, as first argument
// and extra args/data for useSWRMutation only see: https://swr.vercel.app/docs/mutation#useswrmutation
// It handles *thrown error as error
// https://swr.vercel.app/examples/error-handling
// for multiple arguments for useSWR hook(maybe to pass in some data for custom post-get or get request) see: https://swr.vercel.app/docs/arguments#multiple-arguments

import makeApiRequest, { apiMethod } from "@/axios/make-api-request";
import { Arguments, Middleware, SWRHook, SWRConfig } from "swr";
type apiMethodWithoutGet = Exclude<apiMethod, "get">;

export const fetcher = async (url: string) => {
  const resp = await makeApiRequest({ type: "get", url });
  return resp;
};

// An HOC that returns the actual swr remote fetcher function
export const createFetcher = (type: apiMethod) => {
  return async function fetcher(url: string) {
    const resp = await makeApiRequest({ type: type, url });
    return resp;
  };
};
// An HOC that returns the actual swr remote mutation fetcher function
export const createRemoteMutationFetcher = (type: apiMethodWithoutGet) => {
  return async function fetcher(url: string, { arg }: { arg: any }) {
    const resp = await makeApiRequest({ type: type, url, data: arg });
    return resp;
  };
};

// SWR request logger (middleWare) see: https://swr.vercel.app/docs/middleware
export const logger: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const extendedFetcher = (...args: Arguments[]) => {
      console.log("SWR Request:", key);

      // @ts-ignore
      return fetcher(...args);
    };
    return useSWRNext(key, extendedFetcher, config);
  };
