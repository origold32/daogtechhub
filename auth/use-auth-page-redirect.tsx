import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useAuthPageRedirect = (shouldRedirect: boolean = true) => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Only redirect if explicitly told to and user data is loaded
    if (shouldRedirect && user && !isLoading) {
      const redirectLink = user.isStaff ? "/staff" : "/student";
      console.log("useAuthPageRedirect: User data:", user);
      console.log("useAuthPageRedirect: isStaff:", user.isStaff);
      console.log("useAuthPageRedirect: redirecting to...", redirectLink);
      router.push(redirectLink);
    }
  }, [user, router, shouldRedirect, isLoading]);

  return { user, isLoading };
};

export default useAuthPageRedirect;
