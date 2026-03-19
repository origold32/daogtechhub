// hooks/usePWA.ts
// Registers the service worker and exposes PWA helpers:
// - install prompt (add to home screen)
// - push notification subscription
// - offline status

"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [isOnline,       setIsOnline]       = useState(true);
  const [isInstallable,  setIsInstallable]  = useState(false);
  const [isInstalled,    setIsInstalled]    = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [swRegistered,   setSwRegistered]   = useState(false);
  const [pushEnabled,    setPushEnabled]    = useState(false);

  // ── Register SW ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        setSwRegistered(true);
        console.info("[PWA] Service worker registered:", reg.scope);
      })
      .catch((err) => console.warn("[PWA] SW registration failed:", err));
  }, []);

  // ── Online/offline status ─────────────────────────────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // ── Install prompt ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Push notification status ──────────────────────────────────────────────
  useEffect(() => {
    if (!("Notification" in window)) return;
    setPushEnabled(Notification.permission === "granted");
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
    return outcome === "accepted";
  }, [deferredPrompt]);

  const requestPushPermission = useCallback(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;
    const perm = await Notification.requestPermission();
    setPushEnabled(perm === "granted");
    return perm === "granted";
  }, []);

  return {
    isOnline,
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    swRegistered,
    pushEnabled,
    install,
    requestPushPermission,
  };
}
