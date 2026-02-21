"use client";

import { CONST_Jwt_Storage_KeyName } from "@/const";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { fetcher } from "@/swr";

const useAuth = () => {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const login = async (token: string, forcedPath?: string) => {
    localStorage.setItem(CONST_Jwt_Storage_KeyName, token);

    if (forcedPath) {
      // If a specific path is provided, go there immediately
      router.push(forcedPath);
      return;
    }

    try {
      // Fetch user profile to determine correct redirect
      const profileResponse = await fetcher("/auth/profile");
      const user = profileResponse?.data;

      console.log("useAuth - Profile fetched:", user);
      console.log("useAuth - isStaff:", user?.isStaff);

      if (user) {
        // Update SWR cache optimistically
        await mutate("/auth/profile", profileResponse, false);

        // Redirect based on user role
        const redirectPath = user.isStaff ? "/staff" : "/student";
        console.log("useAuth - Redirecting to:", redirectPath);
        router.push(redirectPath);
      }
    } catch (error) {
      console.error("Failed to fetch profile after login:", error);
      // Fallback to student dashboard if profile fetch fails
      router.push("/student");
    }
  };

  const logout = (authPath: string) => {
    localStorage.removeItem(CONST_Jwt_Storage_KeyName);
    // clear all swr data cache
    mutate(
      (key) => true, // which cache keys are updated -> filter function to clear all swr data
      undefined, // update cache data to `undefined`
      { revalidate: false } // do not revalidate
    );

    router.push(authPath);
  };

  return { login, logout };
};

export default useAuth;
