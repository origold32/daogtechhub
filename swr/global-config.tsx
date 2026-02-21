import React, { ReactNode } from "react";
import { SWRConfig } from "swr";

type Props = {
  children: ReactNode;
};

const SWRGlobalConfigProvider = (props: Props) => {
  return (
    <SWRConfig value={{ errorRetryCount: 1, revalidateOnFocus: false }}>
      {props.children}
    </SWRConfig>
  );
};

export default SWRGlobalConfigProvider;
