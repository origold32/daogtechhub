// axios/index.ts
import { AxiosRequestConfig, AxiosError } from "axios";
import { CONST_Jwt_Storage_KeyName } from "@/const";

const Axios = require("axios").default;

export const axiosBaseInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_SWAGGER_API_BASE_URL,
});

// Add a request interceptor
axiosBaseInstance.interceptors.request.use(
  function (config: AxiosRequestConfig) {
    const token = localStorage?.getItem(CONST_Jwt_Storage_KeyName);

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);

        console.log("JWT Expiry:", new Date(exp * 1000).toLocaleString());
        console.log("Current Time:", new Date(now * 1000).toLocaleString());
        console.log("Token is expired?", now > exp);
        console.log("JWT Payload:", payload);
        console.log("JWT Token:", token);
      } catch (e) {
        console.warn("Invalid JWT format", e);
      }

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // ✅ Only set Content-Type to JSON if not FormData
    const isFormData = config.data instanceof FormData;
    if (!isFormData && !config.headers?.["Content-Type"]) {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }

    return config;
  },
  function (error: AxiosError) {
    return Promise.reject(error);
  }
);
