"use client";

import useAuthPageRedirect from "@/auth/use-auth-page-redirect";
import AuthLayoutV1 from "@/components/layouts/auth/_v1-auth-layout";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  // useAuthPageRedirect();

  return <AuthLayoutV1>{children}</AuthLayoutV1>;
};

export default Layout;
