import { ReactNode } from "react";

import AuthContentContainer from "./_auth-content-container";

type Props = { children: ReactNode };

export default function AuthLayoutV1({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div className="grain-overlay" />

      <AuthContentContainer>
        <div className="space-y-4 glass-card p-6 rounded-md z-10">
          {children}
        </div>
      </AuthContentContainer>
    </div>
  );
}
