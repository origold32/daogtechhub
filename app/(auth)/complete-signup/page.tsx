"use client";

import InputV1 from "@/components/input-v1";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createRemoteMutationFetcher } from "@/swr";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

export default function Page() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const router = useRouter();
  // POST  /staffs/validate-invite  how do i implement tbis? this is what is in the example schema {"code": "3998494"}
  const [tokenValid, setTokenValid] = useState(false);

  const { trigger: validateInviteTrigger, isMutating: validatingInvite } =
    useSWRMutation(
      "/staffs/validate-invite",
      createRemoteMutationFetcher("post"),
      {
        onSuccess: () => {
          setTokenValid(true);
        },
        onError: (error) => {
          toast.error("Invalid or expired invitation token.");
          router.push("/login?role=staff");
        },
      }
    );
  const { trigger: completeSignupTrigger, isMutating: completingSignup } =
    useSWRMutation(
      "/staffs/signup/complete",
      createRemoteMutationFetcher("post"),
      {
        onSuccess: () => {
          toast.success("Signup completed successfully!");
          router.push("/login?role=staff");
        },
        onError: () => {
          toast.error("Create Password failed. Please try again.");
        },
      }
    );

  useEffect(() => {
    if (token) {
      validateInviteTrigger({ code: token });
    } else {
      toast.error("Missing token in URL.");
      router.push("/login?role=staff");
    }
  }, [router, token, validateInviteTrigger]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) {
      toast.error("Missing token in the URL.");
      return;
    }

    await completeSignupTrigger({ password, token });
  };

  return (
    <>
      <div className="flex flex-col items-center text-[#555555] text-center">
        <Image src="/images/favicon.png" alt="" width={150} height={150} />
        <p className="font-bold">Complete your signup</p>
        <p className="text-sm">Please set a password to complete signup</p>
      </div>

      <form className="space-y-4 my-4" onSubmit={handleSubmit}>
        <div className="relative">
          <InputV1
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            className="pr-10"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <InputV1
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            className="pr-10"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
            tabIndex={-1}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={
            completingSignup ||
            password.length < 6 ||
            password !== confirmPassword
          }
          className={cn(
            "bg-[#324C80] text-white hover:bg-[#29548F] cursor-pointer w-full"
          )}
        >
          {completingSignup ? "Completing Signup..." : "Complete Signup"}
        </Button>
      </form>
    </>
  );
}

// "use client";

// import InputV1 from "@/components/input-v1";
// import { Button } from "@/components/ui/button";
// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { FaEyeSlash, FaEye } from "react-icons/fa";
// import { toast } from "sonner";

// export default function Page() {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const router = useRouter();

//   // Hardcoded token (instead of waiting for query param)
//   const token = "HARDCODED123TOKEN";

//   const [completingSignup, setCompletingSignup] = useState(false);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     // Simulate success
//     setCompletingSignup(true);
//     setTimeout(() => {
//       toast.success("Signup completed successfully!");
//       router.push("/auth/login?role=staff");
//     }, 1000);
//   };

//   return (
//     <>
//       <div className="flex flex-col items-center text-[#555555] text-center">
//         <Image src="/images/favicon.png" alt="" width={150} height={150} />
//         <p className="font-bold">Complete your signup</p>
//         <p className="text-sm">Please set a password to complete signup</p>
//       </div>

//       <form className="space-y-4 my-4" onSubmit={handleSubmit}>
//         <div className="relative">
//           <InputV1
//             label="Password"
//             name="password"
//             type={showPassword ? "text" : "password"}
//             value={password}
//             className="pr-10"
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter your password"
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword((prev) => !prev)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
//             tabIndex={-1}
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </button>
//         </div>

//         <div className="relative">
//           <InputV1
//             label="Confirm Password"
//             name="confirmPassword"
//             type={showConfirmPassword ? "text" : "password"}
//             value={confirmPassword}
//             className="pr-10"
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             placeholder="Re-enter your password"
//           />
//           <button
//             type="button"
//             onClick={() => setShowConfirmPassword((prev) => !prev)}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
//             tabIndex={-1}
//           >
//             {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//           </button>
//         </div>

//         <Button
//           type="submit"
//           disabled={
//             completingSignup ||
//             password.length < 6 ||
//             password !== confirmPassword
//           }
//           className={cn(
//             "bg-[#324C80] text-white hover:bg-[#29548F] cursor-pointer w-full"
//           )}
//         >
//           {completingSignup ? "Completing Signup..." : "Complete Signup"}
//         </Button>
//       </form>
//     </>
//   );
// }
