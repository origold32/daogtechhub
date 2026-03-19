import { ReactNode } from "react";
import AuthLayoutV1 from "@/components/layouts/auth/_v1-auth-layout";

type Props = { children: ReactNode };

export default function AuthLayout({ children }: Props) {
  return <AuthLayoutV1>{children}</AuthLayoutV1>;
}
