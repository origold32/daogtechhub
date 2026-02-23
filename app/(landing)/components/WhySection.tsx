// app/(landing)/components/WhySection.tsx

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle, Truck, MessageCircle } from "lucide-react";

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: "easeOut", delay: i * 0.1 },
  }),
};

const testimonialVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.15 },
  }),
};

const features = [
  {
    icon: <CheckCircle className="w-7 h-7 text-lilac" />,
    title: "Verified Stock",
    body: "We check every item before it reaches you.",
  },
  {
    icon: <Truck className="w-7 h-7 text-lilac" />,
    title: "Fast Delivery",
    body: "Fast Lagos dispatch and reliable nationwide delivery with tracking.",
    // body: "Lagos-wide dispatch with tracking.",
  },
  {
    icon: <MessageCircle className="w-7 h-7 text-lilac" />,
    title: "Support",
    body: "Talk to a human, not a bot.",
  },
];

const testimonials = [
  {
    quote: "Got my laptop the next day. Super smooth.",
    author: "Chidi, Surulere",
  },
  {
    quote: "They found me a clean ride within my budget.",
    author: "Amaka, Lekki",
  },
];

export function WhySection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const headingInView = useInView(headingRef, { once: false, amount: 0.5 });
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, {
    once: false,
    amount: 0.2,
  });

  return (
    <section className="relative bg-deep-purple py-24 lg:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.h2
            initial={{ y: 24, opacity: 0 }}
            animate={
              headingInView ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }
            }
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="heading-lg font-heading text-soft-white mb-4"
          >
            BUILT DIFFERENT
          </motion.h2>
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={
              headingInView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }
            }
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="text-muted-lavender text-lg"
          >
            Fast replies. Real stock. Straight talk.
          </motion.p>
        </div>

        {/* Feature cards */}
        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              className="glass-card-small p-8 card-hover"
            >
              <div className="icon-badge mx-auto mb-6">{f.icon}</div>
              <h3 className="text-soft-white font-heading font-bold text-lg text-center mb-3">
                {f.title}
              </h3>
              <p className="text-muted-lavender text-center text-sm">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div
          ref={testimonialsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              custom={i}
              variants={testimonialVariants}
              initial="hidden"
              animate={testimonialsInView ? "visible" : "hidden"}
              className="glass-card-small p-8"
            >
              <p className="text-soft-white text-lg italic mb-4">
                &quot;{t.quote}&quot;
              </p>
              <p className="text-lilac text-sm font-medium">— {t.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
