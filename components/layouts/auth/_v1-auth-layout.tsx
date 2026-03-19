// Minimal centered auth layout — no marketing panel, just the form.
// Scrollable so it works on mobile with the full registration form too.
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function AuthLayoutV1({ children }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-10 px-4 relative overflow-y-auto"
      style={{ background: "#1a0b2e" }}
    >
      {/* Subtle top glow — doesn't compete with the form */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 45% at 50% -5%, rgba(212,165,255,0.1) 0%, transparent 65%)",
        }}
      />

      {/* Card — max-width keeps it tight on desktop */}
      <div className="relative w-full max-w-[400px] z-10 my-auto">
        {children}
      </div>

      <p className="mt-8 mb-2 text-[11px] text-white/15 z-10 shrink-0">
        © {new Date().getFullYear()} DAOG Tech Hub · All rights reserved
      </p>
    </div>
  );
}
