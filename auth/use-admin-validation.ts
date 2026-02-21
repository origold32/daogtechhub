"use client";

import { CONST_Jwt_Storage_KeyName } from "@/const";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "./use-auth";

interface UseAdminValidationProps {
  redirectOnFail?: string;
  unauthorizedPath?: string;
}

// Helper function to decode JWT token (without verification)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const useAdminValidation = ({
  redirectOnFail = "/login",
  unauthorizedPath = "/unauthorized",
}: UseAdminValidationProps = {}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { user, isLoading } = useUser();

  useEffect(() => {
    const validateAccess = () => {
      const token = localStorage.getItem(CONST_Jwt_Storage_KeyName);

      // No token
      if (!token) {
        logout(redirectOnFail);
        return;
      }

      // Check if user is staff first (basic requirement for admin access)
      if (!isLoading && user) {
        if (!user.isStaff) {
          // Non-staff trying to access admin area - redirect to student login
          logout("/login?role=student");
          return;
        }
      }

      // Try to get roles from JWT token first
      const decodedToken = decodeJWT(token);

      let userRoles = null;

      if (decodedToken && decodedToken.roles) {
        userRoles = decodedToken.roles;
      }

      // If we have roles from JWT, use them
      if (userRoles && Array.isArray(userRoles)) {
        const isAdmin = userRoles.includes("SUPER_ADMIN");

        if (!isAdmin) {
          router.push(unauthorizedPath);
          setIsAuthorized(false);
          setIsValidating(false);
          return;
        }

        setIsAuthorized(true);
        setIsValidating(false);
        return;
      }

      // Fallback to user profile data if available
      // Still loading user data
      if (isLoading) {
        return;
      }

      // No user data after loading completed
      if (!user && !isLoading) {
        logout(redirectOnFail);
        return;
      }

      // User data loaded, check role (fallback)
      if (user) {
        // First check if user is staff
        if (!user.isStaff) {
          logout("/login?role=student");
          return;
        }

        const profileRoles = user.roles;

        if (Array.isArray(profileRoles)) {
          const isAdmin = profileRoles.includes("SUPER_ADMIN");

          if (!isAdmin) {
            router.push(unauthorizedPath);
            setIsAuthorized(false);
            setIsValidating(false);
            return;
          }

          setIsAuthorized(true);
          setIsValidating(false);
        } else {
          // Staff but no specific admin role - could be allowed or denied based on your requirements
          // For now, redirecting to unauthorized
          router.push(unauthorizedPath);
          setIsAuthorized(false);
          setIsValidating(false);
        }
      }
    };

    validateAccess();
  }, [user, isLoading, router, logout, redirectOnFail, unauthorizedPath]);

  return {
    isValidating: isValidating || isLoading,
    isAuthorized,
    user,
  };
};

export default useAdminValidation;
