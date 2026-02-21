"use client";

import { CONST_Jwt_Storage_KeyName } from "@/const";
import { fetcher } from "@/swr";
import React, { ReactNode, useEffect } from "react";
import useSWR from "swr";
import useAuth from "./use-auth";

interface AuthGuardProps {
  children: ReactNode;
  authPath: string; // fallback login path
}

const AuthGuard2 = ({ children, authPath = "/login" }: AuthGuardProps) => {
  const { data, isLoading, error } = useSWR("/auth/profile", fetcher);
  const { logout } = useAuth();

  useEffect(() => {
    console.log("in auth 2 guard effect 🧨");

    const token = localStorage.getItem(CONST_Jwt_Storage_KeyName);
    const pathname = window.location.pathname;

    const isStaffPath = pathname.startsWith("/staff");
    const isStudentPath = pathname.startsWith("/student");

    const dynamicLoginRedirect = isStaffPath
      ? "/login?role=staff"
      : isStudentPath
      ? "/login?role=student"
      : authPath;

    if (!token) {
      logout(dynamicLoginRedirect);
      return;
    }

    if (error?.statusCode === 401) {
      logout(dynamicLoginRedirect);
      return;
    }
  }, [error, authPath, logout]);

  if (!data || isLoading) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard2;
