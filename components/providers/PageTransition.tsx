"use client";
// nextjs-toploader is already in package.json.
// It shows a slim progress bar on navigation WITHOUT remounting the page tree.
// The previous version used key={pathname} which forced full DOM destruction on every nav.
import NextTopLoader from "nextjs-toploader";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader
        color="#d4a5ff"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px #d4a5ff,0 0 5px #b67ee8"
        zIndex={9999}
      />
      {children}
    </>
  );
}
