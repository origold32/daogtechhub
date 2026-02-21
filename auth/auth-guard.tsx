"use client";

import { CONST_Jwt_Storage_KeyName } from "@/const";
import { fetcher } from "@/swr";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import useSWR, { SWRConfig } from "swr";
import useAuth from "./use-auth";
import Loader3 from "@/components/loaders/loader-3";

interface AuthGuardProps {
  children: ReactNode;
  authPath: string; // /login etc
}

const AuthGuard = ({ children, authPath = "/login" }: AuthGuardProps) => {
  const { logout } = useAuth();
  const { data: response, error, isLoading } = useSWR("/auth/profile", fetcher);
  const router = useRouter();

  // Extract the actual user data from the API response
  const user = response?.data;

  useEffect(() => {
    const token = localStorage.getItem(CONST_Jwt_Storage_KeyName);
    const pathname = window.location.pathname;

    if (!token) {
      // Dynamically determine login redirect based on the path
      const isStaffPath = pathname.startsWith("/staff");
      const isStudentPath = pathname.startsWith("/student");
      const loginRedirect = isStaffPath
        ? "/login?role=staff"
        : isStudentPath
        ? "/login?role=student"
        : authPath; // fallback to "/login" or the passed authPath

      logout(loginRedirect);
      return;
    }

    if (error) {
      if (error?.statusCode === 401) {
        logout(authPath);
        return;
      }

      if (error.code === "ECONNABORTED") {
        console.warn("Request aborted (timeout)");
        return;
      }

      console.error("Unexpected error:", error);
    }

    // Optional redirect if user tries to access wrong dashboard
    if (user) {
      console.log("🔍 AuthGuard Debug:");
      console.log("- Full response object:", JSON.stringify(response, null, 2));
      console.log("- Extracted user data:", JSON.stringify(user, null, 2));
      console.log("- user.isStaff value:", user.isStaff);
      console.log("- user.isStaff type:", typeof user.isStaff);
      console.log("- Current pathname:", pathname);

      const isStaff = user.isStaff;
      console.log("- Final isStaff determination:", isStaff);

      if (isStaff && pathname.startsWith("/student")) {
        console.log(
          "🚀 Staff user accessing student area, redirecting to /staff"
        );
        router.replace("/staff");
      } else if (!isStaff && pathname.startsWith("/staff")) {
        console.log(
          "🚀 Student user accessing staff area, redirecting to /student"
        );
        router.replace("/student");
      } else {
        console.log("✅ User is in correct dashboard area");
      }
    }
  }, [user, error, authPath, logout, router, response]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader3 />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SWRConfig
      value={{
        fetcher,
        onError: (error) => {
          if (error.status === 401) {
            // Handle globally
          }
        },
        revalidateOnFocus: false, // Consider disabling if causing issues
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default AuthGuard;
