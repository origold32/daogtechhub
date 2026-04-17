"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0718] text-white px-4">
      <div className="max-w-xl text-center space-y-6 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Something went wrong</h1>
          <p className="mt-3 text-sm text-muted-lavender">We hit an unexpected error. Please try again or return to the dashboard.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => reset()} className="bg-lilac text-deep-purple">Retry</Button>
          <Button onClick={() => router.push("/")} variant="outline" className="border-white/10 text-white">Go Home</Button>
        </div>
      </div>
    </div>
  );
}
