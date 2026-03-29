// Above-fold shell: Navigation + Hero + AuthCodeRedirect interceptor
// This is a Client Component only because Navigation needs interactivity.
"use client";

import { useRef, RefObject, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "./Navigation";
import { HeroSection } from "./HeroSection";

// Intercepts ?code= / ?error= params Supabase sends to the site root
function AuthCodeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const code  = searchParams.get("code");
    const error = searchParams.get("error");
    const tokenHash = searchParams.get("token_hash");
    const query = searchParams.toString();
    if (tokenHash) {
      router.replace(`/auth/confirm?${query}`);
    } else if (code) {
      router.replace(`/auth/callback?${query}`);
    } else if (error) {
      router.replace(`/auth?${query}`);
    }
  }, [searchParams, router]);
  return null;
}

export function LandingAboveFold() {
  const heroRef      = useRef<HTMLElement>(null);
  const gadgetsRef   = useRef<HTMLElement>(null);
  const jerseysRef   = useRef<HTMLElement>(null);
  const carsRef      = useRef<HTMLElement>(null);
  const realEstateRef = useRef<HTMLElement>(null);
  const contactRef   = useRef<HTMLElement>(null);

  const navLinks = [
    { label: "Gadgets",     ref: gadgetsRef    as RefObject<HTMLElement | null> },
    { label: "Jerseys",     ref: jerseysRef    as RefObject<HTMLElement | null> },
    { label: "Cars",        ref: carsRef       as RefObject<HTMLElement | null> },
    { label: "Real Estate", ref: realEstateRef as RefObject<HTMLElement | null> },
    { label: "Contact",     ref: contactRef    as RefObject<HTMLElement | null> },
  ];

  const scrollTo = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <Suspense fallback={null}>
        <AuthCodeRedirect />
      </Suspense>
      <div className="grain-overlay" />
      <Navigation links={navLinks} />
      <HeroSection
        sectionRef={heroRef as React.RefObject<HTMLElement>}
        onExploreClick={() => scrollTo(gadgetsRef)}
      />
    </>
  );
}
