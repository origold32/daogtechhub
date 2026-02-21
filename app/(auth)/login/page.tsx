"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { createRemoteMutationFetcher } from "@/swr";
import { useUrlState } from "@/hooks/useUrlState";
import Image from "next/image";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import InputV1 from "@/components/input-v1";
import useAuth from "@/auth/use-auth";
import InFormLink from "@/components/layouts/auth/in-form-link";
import AppLogo from "@/components/app-logo";
import PasswordInputV1 from "@/components/password-input-v1";

type UserRole = "student" | "staff";

export default function Page() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useUrlState<UserRole>("role", "student");
  const { login } = useAuth();

  const { trigger: loginTrigger, isMutating: loggingIn } = useSWRMutation(
    "/auth/login",
    createRemoteMutationFetcher("post"),
    {
      onSuccess: (data) => {
        login(data?.data?.token);
        toast.success("Login successful!");
      },
    }
  );

  const isFormValid = identifier.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await loginTrigger({
        candidateId: identifier,
        password,
      });
    } catch {
      toast.error("Login failed. Please try again.");
    }
  };

  const isStaff = role === "staff";
  const labelText = isStaff ? "Email Address" : "Matric Number";
  const placeholderText = isStaff
    ? "Enter your email"
    : "Enter your matric number";
  const inputType = isStaff ? "email" : "number";

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <AppLogo />

        <p className="text-[#555555] font-bold">
          {isStaff
            ? "Fulltime Medical Staff Sign In"
            : "Fulltime Undergraduate Students Sign In"}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputV1
          label={labelText}
          name="identifier"
          type={inputType}
          pattern={isStaff ? undefined : "[0-9]+"}
          inputMode={isStaff ? "email" : "numeric"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={placeholderText}
          autoComplete=""
          required
        />

        <PasswordInputV1
          label="Password"
          name="password"
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full"
        />

        <div className="text-sm font-bold text-[#555555] text-center">
          <p>Forgot your password?</p>
          <Link
            href="/forgot-password"
            className="text-[#506CA4] hover:underline"
          >
            CLICK HERE to Reset Your Password.
          </Link>
        </div>

        <div className="grid gap-4 grid-cols-2">
          <Button
            type="submit"
            disabled={loggingIn || !isFormValid}
            className={cn(
              "bg-[#324C80] text-white hover:bg-[#29548F] cursor-pointer w-full"
            )}
          >
            {loggingIn ? "Logging in..." : "Login"}
          </Button>
          <Link href="/" className="w-full">
            <Button className="w-full bg-[#E67E22] hover:bg-[#e67d22cd] cursor-pointer transition">
              Home
            </Button>
          </Link>
        </div>
      </form>

      {!isStaff && (
        <InFormLink
          mainText="New Student?"
          linkContent="Register Here"
          link="/medical-registration"
        />
      )}
    </>
  );
}
