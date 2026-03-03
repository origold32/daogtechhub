// app/(auth)/layout.tsx

"use client";

import { ReactNode } from "react";
import AuthLayoutV1 from "@/components/layouts/auth/_v1-auth-layout";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return <AuthLayoutV1>{children}</AuthLayoutV1>;
};

export default Layout;
