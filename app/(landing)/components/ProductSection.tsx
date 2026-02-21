"use client";

import { forwardRef, ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ProductSectionProps {
  slug: string;
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
  icon: ReactNode;
  imageSrc: string;
  imageAlt: string;
  zClass: string;
  gradientPosition?: string;
}

const textVariants = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const bodyVariants = {
  hidden: { x: -40, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.12 },
  },
};

const cardVariants = {
  hidden: { x: 80, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const badgeVariants = {
  hidden: { scale: 0.4, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 },
  },
};

export const ProductSection = forwardRef<HTMLElement, ProductSectionProps>(
  function ProductSection(
    {
      slug,
      title,
      description,
      ctaLabel,
      onCta,
      icon,
      imageSrc,
      imageAlt,
      zClass,
      gradientPosition = "circle_at_70%_45%",
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(innerRef, { once: false, amount: 0.25 });

    return (
      <section
        ref={forwardedRef}
        className={`relative bg-deep-purple ${zClass}`}
        style={{ minHeight: "100vh" }}
      >
        <div
          className={`absolute inset-0 bg-[radial-gradient(${gradientPosition},rgba(212,165,255,0.16),transparent_55%)]`}
        />

        <div
          ref={innerRef}
          className="relative flex items-center px-6 lg:px-[9vw]"
          style={{ minHeight: "100vh" }}
        >
          {/* Left: text */}
          <div className="w-full lg:w-[40vw] py-24 lg:py-0">
            <motion.h2
              variants={textVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="heading-lg font-heading text-soft-white mb-6"
            >
              {title}
            </motion.h2>

            <motion.div
              variants={bodyVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <p className="text-muted-lavender text-lg lg:text-xl max-w-md mb-8">
                {description}
              </p>
              <button onClick={onCta} className="btn-primary">
                {ctaLabel}
              </button>
            </motion.div>
          </div>

          {/* Right: card — uses flex alignment, no absolute positioning conflict */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="hidden lg:flex lg:flex-col ml-auto"
            style={{ width: "36vw" }}
          >
            <div className="glass-card p-8 relative" style={{ height: "68vh" }}>
              <motion.div
                variants={badgeVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="icon-badge absolute -top-4 -right-4 animate-float"
              >
                {icon}
              </motion.div>
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  },
);
