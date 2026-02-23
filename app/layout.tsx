import type { Metadata } from "next";
import { Inter, Nunito, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { DrawerProvider } from "@/components/drawer-manager";
import { DialogProvider } from "@/components/dialog-manager";
import Loader3 from "@/components/loaders/loader-3";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["700", "800"] });
const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DAOG TECH HUB",
  description:
    "Your go-to store for all gadgets, accessories, jerseys, cars and real estate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className=" scroll_hide overscroll-contain">
      <body
        className={cn(
          nunito.className,
          inter.className,
          montserrat.className,
          "overflow-x-hidden",
        )}
      >
        <Suspense
          fallback={
            <div className="flex h-screen w-screen items-center justify-center">
              <Loader3 />
            </div>
          }
        >
          <DialogProvider>
            <DrawerProvider>{children}</DrawerProvider>
          </DialogProvider>
        </Suspense>
        <Toaster richColors position="top-right" duration={1000} />
      </body>
    </html>
  );
}
