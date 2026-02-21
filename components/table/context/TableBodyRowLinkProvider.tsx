"use client";

import { ReactNode, createContext, useContext } from "react";

interface ITableBodyRowLink {
  link: string | undefined;
}

export const ContextTableBodyRowLink = createContext<ITableBodyRowLink>({
  link: undefined,
});

export const ProviderTableBodyRowLink = ({ link, children }: { link: string; children: ReactNode }) => {
  return <ContextTableBodyRowLink.Provider value={{ link }}>{children}</ContextTableBodyRowLink.Provider>;
};

export function useTableRowLink() {
  const context = useContext(ContextTableBodyRowLink);
  // console.log("context is", context);
  if (!context) {
    throw new Error("if you need table row have a link, useTableRowLink must be used within a ContextTableRowLink Provider");
    return;
  }

  return context;
}
