// axios/make-api-request.ts
import { axiosBaseInstance } from "@/axios";
import { AxiosRequestConfig } from "axios";

const apiMethods = {
  GET: "get",
  POST: "post",
  PATCH: "patch",
  PUT: "put",
  DELETE: "delete",
} as const;

type apiMethods = typeof apiMethods;
export type apiMethod =
  | apiMethods["GET"]
  | apiMethods["POST"]
  | apiMethods["PATCH"]
  | apiMethods["PUT"]
  | apiMethods["DELETE"];

interface MakeApiRequest {
  type: apiMethod;
  url: string;
  data?: Partial<Record<string, any>>;
  config?: AxiosRequestConfig;
}

export default async function makeApiRequest({
  type,
  url = "",
  data = {},
  config = {},
}: MakeApiRequest): Promise<any> {
  try {
    let resp = await axiosBaseInstance({
      url,
      method: type,
      ...(data instanceof FormData ? { data } : { data: { ...data } }),
      ...config,
    });

    // console.log("response is", resp);
    return {
      ...resp.data,
      message: resp.data?.message || "Success!",
      status: true,
    };
  } catch (error: any) {
    console.log("there was an error", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      //   console.log(error.response.data);
      //   console.log(error.response.status);
      //   console.log(error.response.headers);
      // console.log("in post datta util", error.response);
      // const nonRedirectPaths = ["/login", "/", "/about"];
      // if (error.response.status == 401 && !nonRedirectPaths.includes(window.location.pathname)) {
      //   window.location.assign(new URL("/login", window.origin));
      //   console.log("a 401 error occured");
      //   return;
      // }
      throw {
        ...error.response.data,
        message:
          error.response.data?.message ??
          "Something went wrong. Pls try again later - No server error message",
        status: false,
        statusCode: error.response.status,
      };
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(
        "The request was made but no response was received and error code",
        error.request,
        error.code
      );

      throw {
        ...error,
        message:
          "Request was made but no response was received. Pls check your internet or try again.",
        status: false,
        statusCode: error.request.status,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(
        "Something happened in setting up the request that triggered an Error",
        error.message
      );
      throw { ...error, message: error.message, status: false };
    }
  }
}
