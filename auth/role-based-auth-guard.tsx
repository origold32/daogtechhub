"use client";

import { CONST_Jwt_Storage_KeyName } from "@/const";
import { fetcher } from "@/swr";
import { ReactNode, useEffect } from "react";
import useSWR, { SWRConfig } from "swr";
import useAuth from "./use-auth";
import Loader3 from "@/components/loaders/loader-3";

interface RoleBasedAuthGuardProps {
  children: ReactNode;
  authPath?: string;
  requiredRole?: "staff" | "student";
  unauthorizedPath?: string;
}

const RoleBasedAuthGuard = ({
  children,
  authPath = "/login",
  requiredRole,
  unauthorizedPath = "/unauthorized",
}: RoleBasedAuthGuardProps) => {
  const { logout } = useAuth();
  const { data: response, error, isLoading } = useSWR("/auth/profile", fetcher);

  // Extract the actual user data from the API response
  const user = response?.data;

  useEffect(() => {
    const token = localStorage.getItem(CONST_Jwt_Storage_KeyName);
    if (!token) {
      logout(authPath);
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
  }, [error, authPath, logout]);

  useEffect(() => {
    // Role-based access control
    if (user && requiredRole) {
      const userIsStaff = user.isStaff;
      const hasRequiredRole =
        requiredRole === "staff" ? userIsStaff : !userIsStaff;

      // console.log("RoleBasedAuthGuard Debug:");
      // console.log("- User data:", user);
      // console.log("- userIsStaff:", userIsStaff);
      // console.log("- requiredRole:", requiredRole);
      // console.log("- hasRequiredRole:", hasRequiredRole);

      if (!hasRequiredRole) {
        // Redirect to appropriate login page based on their actual role
        const correctLoginPath = userIsStaff
          ? "/login?role=staff"
          : "/login?role=student";
        logout(correctLoginPath);
        return;
      }
    }
  }, [user, requiredRole, logout]);

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
            logout(authPath);
          }
        },
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default RoleBasedAuthGuard;
