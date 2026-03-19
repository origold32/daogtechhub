"use client";

import { ReactNode } from "react";
import { DrawerProvider }    from "@/components/reusables/drawer-manager";
import { DialogProvider }    from "@/components/reusables/dialog-manager";
import { ThemeProvider }     from "@/components/providers/ThemeProvider";
import { PageTransition }    from "@/components/providers/PageTransition";
import { CartDrawer }        from "@/components/cart/CartDrawer";
import { NotificationBanner } from "@/components/notifications/NotificationBanner";
import SWRGlobalConfigProvider from "@/swr/global-config";
import { Toaster }           from "sonner";
import { useSessionHydration, useCartSync } from "@/hooks/useSupabase";
import { usePWA } from "@/hooks/usePWA";
import { CookieBanner } from "@/components/ui/CookieBanner";

// Hydrate session + cart + register PWA service worker
function AppSync() {
  useSessionHydration();
  useCartSync();
  usePWA(); // registers SW, handles install prompt, tracks online status
  return null;
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SWRGlobalConfigProvider>
      <ThemeProvider>
        <DialogProvider>
          <DrawerProvider>
            <AppSync />
            <NotificationBanner />
            <CartDrawer />
            <PageTransition>
              {children}
            </PageTransition>
          </DrawerProvider>
        </DialogProvider>
      </ThemeProvider>
      <Toaster richColors position="top-right" duration={3500} />
      <CookieBanner />
    </SWRGlobalConfigProvider>
  );
}
