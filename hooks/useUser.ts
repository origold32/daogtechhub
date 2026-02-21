import { fetcher } from "@/swr";
import useSWR from "swr";

const useUser = () => {
  const { data: response, error, isLoading, mutate } = useSWR("/auth/profile", fetcher);
  
  // Extract the actual user data from the API response
  const user = response?.data;

  return {
    user,
    isLoading,
    error,
    response, // Keep the full response available if needed
    mutateUser: mutate
  };
};

export default useUser;