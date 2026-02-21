import { ReactNode } from "react";

import AuthContentContainer from "./_auth-content-container";
import AppLogo from "@/components/app-logo";

type Props = { children: ReactNode };

export default function AuthLayoutV1({ children }: Props) {
  return (
    <div className='min-h-screen bg-[url("/images/lasu-view.png")] bg-cover bg-center flex flex-col items-center justify-center relative'>
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* <div className="bg-white p-6 z-[9999] flex flex-col items-center">
        <AppLogo /> */}

      <AuthContentContainer>
        <div className="space-y-4 bg-white p-6 rounded-md z-10">{children}</div>
      </AuthContentContainer>
      {/* </div> */}
    </div>
  );
}
