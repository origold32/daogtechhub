"use client";

import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Zap } from "lucide-react";

interface HeroSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  onExploreClick: () => void;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const lineVariants = {
  hidden: { y: 32, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeUpVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { x: 80, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const badgeVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export function HeroSection({ sectionRef, onExploreClick }: HeroSectionProps) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-deep-purple"
      style={{ minHeight: "100vh" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_55%,rgba(212,165,255,0.18),transparent_55%)]" />

      <div
        className="relative flex items-center px-6 lg:px-[9vw]"
        style={{ minHeight: "100vh" }}
      >
        {/* Left: text */}
        <motion.div
          className="w-full lg:w-[44vw] py-24 lg:py-0"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.p
            variants={fadeUpVariants}
            className="text-muted-lavender text-xs uppercase tracking-[0.18em] mb-4"
          >
            DAOG TECH HUB
          </motion.p>

          <h1 className="heading-xl font-heading text-soft-white mb-6 overflow-hidden">
            <motion.span variants={lineVariants} className="block">
              EVERYTHING
            </motion.span>
            <motion.span variants={lineVariants} className="block">
              YOU WANT
            </motion.span>
          </h1>

          <motion.p
            variants={fadeUpVariants}
            className="text-muted-lavender text-lg lg:text-xl max-w-md mb-8"
          >
            Gadgets, jerseys, cars & homes—curated and delivered.
          </motion.p>

          <motion.button
            variants={fadeUpVariants}
            onClick={onExploreClick}
            className="btn-primary"
          >
            Explore Products
          </motion.button>
        </motion.div>

        {/* Right: card — flex sibling, no absolute positioning */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={controls}
          className="hidden lg:flex lg:flex-col ml-auto"
          style={{ width: "34vw" }}
        >
          <div className="glass-card p-8 relative" style={{ height: "72vh" }}>
            <motion.div
              variants={badgeVariants}
              className="icon-badge absolute -top-4 -right-4 animate-float"
            >
              <Zap className="w-7 h-7 text-lilac" />
            </motion.div>
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img
                src="/images/hero_phone.jpg"
                alt="Featured Product"
                className="w-full h-full object-contain"
              />
              <p className="text-muted-lavender text-sm mt-4">
                Featured: Latest Drop
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
