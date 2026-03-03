"use client";

import { useState } from "react";
import AppLogo from "@/components/reusables/app-logo";
import InputV1 from "@/components/reusables/input-v1";
import PasswordInputV1 from "@/components/reusables/password-input-v1";
import InputPhone5 from "@/components/reusables/input-phone-5";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Value } from "react-phone-number-input";
import TabsUnderline from "@/components/reusables/tab-underline";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import VerifyAccount from "@/components/layouts/auth/verify-account";
import GoBack from "@/components/reusables/go-back";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/store/authStore";

type AuthStep = "form" | "otp";
type AuthTab = "email" | "phone";

// ---------------------------------------------------------------------------
// 🧪 MOCK — remove this block when the API is ready
// Simulates the "does this user exist?" check that your login/signup endpoint will do.
// ---------------------------------------------------------------------------
const MOCK_EXISTING_USERS = ["john@example.com"];

async function mockCheckUser(identifier: string): Promise<{ exists: boolean }> {
  await new Promise((r) => setTimeout(r, 800)); // simulated latency
  return { exists: MOCK_EXISTING_USERS.includes(identifier) };
}
// ---------------------------------------------------------------------------

export default function Page() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [activeTab, setActiveTab] = useState<AuthTab>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<Value>();
  const [authStep, setAuthStep] = useState<AuthStep>("form");
  const [identifier, setIdentifier] = useState<string | Value>("");
  const [isLoading, setIsLoading] = useState(false);

  // 🧪 MOCK only — tracks existing vs new user so VerifyAccount can build the right mock user.
  // Remove when the real API returns a user object on OTP verify.
  const [isExistingUser, setIsExistingUser] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ Use state instead of DOM query — reliable regardless of render timing
    const id = activeTab === "phone" ? phone : email;

    if (!id) {
      toast.error("Enter your details");
      return;
    }

    setIsLoading(true);

    // -------------------------------------------------------------------------
    // 🧪 MOCK: replace this block with your real API call when backend is ready.
    //
    // ✅ REAL (example):
    //   const res = await api.post("/auth/login-or-signup", { identifier: id });
    //   // API should trigger OTP send and return { isExistingUser: boolean }
    //   setIsExistingUser(res.data.isExistingUser);
    // -------------------------------------------------------------------------
    const { exists } = await mockCheckUser(String(id));
    setIsExistingUser(exists);
    toast.success(
      exists
        ? "Welcome back! Check your OTP."
        : "Account created! Check your OTP.",
    );
    // -------------------------------------------------------------------------

    setIdentifier(id);
    setAuthStep("otp");
    setIsLoading(false);
  };

  const handleVerifyOtpSuccess = (data: any) => {
    // -------------------------------------------------------------------------
    // ✅ REAL: `data` will be whatever your /auth/otp-verify endpoint returns.
    // Typically: { user: User, token: string }
    // Call login() with the user object:
    //   login(data.user);
    //
    // 🧪 MOCK: VerifyAccount passes back a built mock User object directly.
    // -------------------------------------------------------------------------
    login(data as User);
    router.push("/");
  };

  const socios = [
    { name: "Google", icon: <FaGoogle size={16} /> },
    { name: "Facebook", icon: <FaFacebookF size={16} /> },
  ];

  return (
    <>
      <div className="flex flex-col items-center text-center space-y-1">
        <AppLogo />

        {authStep === "form" ? (
          <>
            <p className="text-muted-lavender text-sm">
              Use your email or phone to log in or sign up.
            </p>
            <p className="text-xs text-muted-lavender opacity-60">
              We&apos;ll log you in if you already have an account, or create
              one for you.
            </p>
          </>
        ) : (
          <>
            <p className="text-muted-lavender text-sm">
              Enter the verification code
            </p>
            <p className="text-xs text-muted-lavender opacity-60">
              Code sent to {String(identifier)}
            </p>
          </>
        )}
      </div>

      {authStep === "form" && (
        <>
          <TabsUnderline
            defaultValue="email"
            onChange={(val) => setActiveTab(val as AuthTab)}
            tabs={[
              {
                value: "email",
                valueDisplay: "Email",
                content: (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputV1
                      name="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <PasswordInputV1 name="password" required />

                    <Button
                      type="submit"
                      disabled={!email || isLoading}
                      loading={isLoading}
                      loadingText="Checking…"
                      className="w-full bg-lilac text-deep-purple hover:bg-lilac/90"
                    >
                      Continue
                    </Button>
                  </form>
                ),
              },
              {
                value: "phone",
                valueDisplay: "Phone Number",
                content: (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <InputPhone5
                      name="phone"
                      label="Phone Number"
                      value={phone}
                      onChange={setPhone}
                      required
                    />

                    <PasswordInputV1 name="password" required />

                    <Button
                      type="submit"
                      disabled={!phone || isLoading}
                      loading={isLoading}
                      loadingText="Checking…"
                      className="w-full bg-lilac text-deep-purple hover:bg-lilac/90"
                    >
                      Continue
                    </Button>
                  </form>
                ),
              },
            ]}
          />

          <div className="text-sm font-bold text-center mt-4">
            <p className="text-muted-lavender opacity-50">
              Forgot your password?
            </p>
            <Link
              href="/forgot-password"
              className="text-lilac hover:underline"
            >
              CLICK HERE to Reset Your Password
            </Link>
          </div>

          <div className="flex items-center gap-2 my-6">
            <div className="flex-1 h-px bg-muted-lavender opacity-50" />
            <span className="text-xs text-muted-lavender">Or log in with</span>
            <div className="flex-1 h-px bg-muted-lavender opacity-50" />
          </div>

          <div className="flex items-center justify-center gap-4">
            {socios.map((socio) => (
              <Button
                key={socio.name}
                type="button"
                variant="outline"
                className="rounded-full text-lilac hover:text-deep-purple"
              >
                {socio.icon}
              </Button>
            ))}
          </div>
        </>
      )}

      {authStep === "otp" && (
        <div className="mt-6 space-y-6 flex flex-col items-center w-full max-w-xs mx-auto">
          <VerifyAccount
            identifier={identifier}
            isExistingUser={isExistingUser} // 🧪 MOCK only — remove when API handles this
            onSuccess={handleVerifyOtpSuccess}
          />

          <GoBack
            onClick={() => setAuthStep("form")}
            className="text-muted-lavender hover:text-lilac text-sm"
          />
        </div>
      )}
    </>
  );
}
