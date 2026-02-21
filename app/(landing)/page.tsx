"use client";

import { useRef, RefObject } from "react";
import { Smartphone, Star, Gauge, Home } from "lucide-react";

import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { ProductSection } from "./components/ProductSection";
import { WhySection } from "./components/WhySection";
import { ContactSection } from "./components/ContactSection";
import { WhatsAppFloat } from "./components/WhatsAppFloat";

const WA_LINK = "https://wa.me/2348102557217";

// CSS to add to your global stylesheet
// .section-full { min-height: 100vh; position: relative; }

export default function Page() {
  // Refs for nav scroll-to and hero CTA
  const heroRef = useRef<HTMLElement>(null);
  const gadgetsRef = useRef<HTMLElement>(null);
  const jerseysRef = useRef<HTMLElement>(null);
  const carsRef = useRef<HTMLElement>(null);
  const realEstateRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const navLinks = [
    { label: "Gadgets", ref: gadgetsRef as RefObject<HTMLElement | null> },
    { label: "Jerseys", ref: jerseysRef as RefObject<HTMLElement | null> },
    { label: "Cars", ref: carsRef as RefObject<HTMLElement | null> },
    {
      label: "Real Estate",
      ref: realEstateRef as RefObject<HTMLElement | null>,
    },
    { label: "Contact", ref: contactRef as RefObject<HTMLElement | null> },
  ];

  const scrollTo = (ref: RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative">
      <div className="grain-overlay" />

      <Navigation links={navLinks} />

      <HeroSection
        sectionRef={heroRef}
        onExploreClick={() => scrollTo(gadgetsRef)}
      />

      <ProductSection
        ref={gadgetsRef}
        slug="gadgets"
        title="GADGETS"
        description="Phones, laptops, accessories—tested, genuine, ready."
        ctaLabel="Shop Gadgets"
        onCta={() => window.open(WA_LINK, "_blank")}
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
        onCta={() => window.open(WA_LINK, "_blank")}
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
        description="Sedans, SUVs, trucks—inspected, clear paperwork, ready to drive."
        ctaLabel="View Cars"
        onCta={() => window.open(WA_LINK, "_blank")}
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
        onCta={() => window.open(WA_LINK, "_blank")}
        icon={<Home className="w-7 h-7 text-lilac" />}
        imageSrc="/images/realestate_house.jpg"
        imageAlt="Real Estate"
        zClass="z-50"
        gradientPosition="circle_at_30%_52%"
      />

      <WhySection />

      <ContactSection ref={contactRef} />

      <WhatsAppFloat />
    </div>
  );
}
