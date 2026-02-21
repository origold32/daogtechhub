import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const AuthContentContainer = ({ children }: Props) => {
  return (
    <div className="grid md:flex items-center justify-center w-full">
      {children}
    </div>
  );
};

export default AuthContentContainer;
