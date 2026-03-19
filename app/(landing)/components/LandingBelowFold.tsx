// Below-fold: all product sections + why + contact + footer
// Lazy-loaded via Suspense in the parent page — keeps LCP fast.
"use client";

import { useRef, RefObject } from "react";
import { Smartphone, Star, Gauge, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductSection } from "./ProductSection";
import { WhySection } from "./WhySection";
import { ContactSection } from "./ContactSection";
import { WhatsAppFloat } from "./WhatsAppFloat";
import FooterSection from "./FooterSection";

export function LandingBelowFold() {
  const router = useRouter();

  const gadgetsRef    = useRef<HTMLElement>(null);
  const jerseysRef    = useRef<HTMLElement>(null);
  const carsRef       = useRef<HTMLElement>(null);
  const realEstateRef = useRef<HTMLElement>(null);
  const contactRef    = useRef<HTMLElement>(null);

  return (
    <>
      <ProductSection
        ref={gadgetsRef}
        slug="gadgets"
        title="GADGETS"
        description="Phones, laptops, accessories—tested, genuine, ready."
        ctaLabel="Shop Gadgets"
        onCta={() => router.push("/gadgets")}
        icon={<Smartphone className="w-7 h-7 text-lilac" />}
        imageSrc="/images/gadgets_phone.jpg"
        imageAlt="Gadgets"
        zClass="z-20"
        gradientPosition="circle_at_70%_45%"
      />

      <ProductSection
        ref={jerseysRef}
        slug="jerseys"
        title="JERSEYS"
        description="Club kits, player editions, drops—authentic and fast."
        ctaLabel="Browse Jerseys"
        onCta={() => router.push("/jerseys")}
        icon={<Star className="w-7 h-7 text-lilac" />}
        imageSrc="/images/jerseys_shirt.jpg"
        imageAlt="Jerseys"
        zClass="z-30"
        gradientPosition="circle_at_28%_55%"
      />

      <ProductSection
        ref={carsRef}
        slug="cars"
        title="CARS"
        description="Sedans, SUVs, trucks—inspected & luxury vehicles, clear paperwork, ready to drive."
        ctaLabel="View Cars"
        onCta={() => router.push("/cars")}
        icon={<Gauge className="w-7 h-7 text-lilac" />}
        imageSrc="/images/cars_vehicle.jpg"
        imageAlt="Cars"
        zClass="z-40"
        gradientPosition="circle_at_68%_48%"
      />

      <ProductSection
        ref={realEstateRef}
        slug="realestate"
        title="REAL ESTATE"
        description="Homes, land, rentals—verified listings and honest guidance."
        ctaLabel="See Listings"
        onCta={() => router.push("/realestate")}
        icon={<Home className="w-7 h-7 text-lilac" />}
        imageSrc="/images/realestate_house.jpg"
        imageAlt="Real Estate"
        zClass="z-50"
        gradientPosition="circle_at_30%_52%"
      />

      <WhySection />
      <ContactSection ref={contactRef} />
      <FooterSection />
      <WhatsAppFloat />
    </>
  );
}
