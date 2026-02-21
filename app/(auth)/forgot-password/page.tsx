"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import AppLogo from "@/components/app-logo";
import TitleCatption from "@/components/title-caption";
import InputV1 from "@/components/input-v1";
import InFormLink from "@/components/layouts/auth/in-form-link";

type Props = {};

const view = ["forgot", "otp", "reset"];
const ForgotPassword = (props: Props) => {
  const [email, setEmail] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
  };
  return (
    <div className="py-4 space-y-5">
      <div className="flex flex-col items-center text-center">
        <AppLogo />

        <TitleCatption
          title="Forgot your password?"
          titleClassName="text-base text-[#555555] font-bold"
          caption="Provide your email address to start password recovery"
          className="flex flex-col items-center text-center"
        />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <InputV1
          label="Email"
          name="identifier"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete=""
          required
          rightElement={<Mail className="text-primary" size={16} />}
        />
      </form>

      <InFormLink
        mainText="Remember your password?"
        linkContent="Login Here"
        link="/login"
      />
    </div>
  );
};

export default ForgotPassword;
