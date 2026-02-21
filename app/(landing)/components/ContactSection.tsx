"use client";

import { forwardRef, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export const ContactSection = forwardRef<HTMLElement>(
  function ContactSection(_, forwardedRef) {
    const innerRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(innerRef, { once: false, amount: 0.15 });
    const footerInView = useInView(footerRef, { once: false, amount: 0.5 });

    return (
      <section
        ref={forwardedRef}
        className="relative bg-mid-purple py-24 lg:py-32 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,165,255,0.18),transparent_55%)]" />

        <div
          ref={innerRef}
          className="relative max-w-6xl mx-auto px-6 lg:px-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -40, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
              <h2 className="heading-lg font-heading text-soft-white mb-4">
                LET'S CLOSE THE DEAL
              </h2>
              <p className="text-muted-lavender text-lg mb-10">
                Tell us what you need. We'll reply within hours.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <Phone className="w-6 h-6 text-lilac" />,
                    primary: "+234 810 255 7217",
                    secondary: "+234 806 202 0190",
                  },
                  {
                    icon: <Mail className="w-6 h-6 text-lilac" />,
                    primary: "daogstore@gmail.com",
                  },
                  {
                    icon: <MapPin className="w-6 h-6 text-lilac" />,
                    primary: "Surulere, Lagos",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -24, opacity: 0 }}
                    animate={
                      isInView ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }
                    }
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: 0.1 + i * 0.08,
                    }}
                    className="flex items-center gap-4"
                  >
                    <div className="icon-badge flex-shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-soft-white font-medium">
                        {item.primary}
                      </p>
                      {item.secondary && (
                        <p className="text-muted-lavender text-sm">
                          {item.secondary}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: 40, opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
              className="glass-card p-8"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Message sent! We will get back to you soon.");
                }}
              >
                <div className="space-y-5">
                  <input type="text" placeholder="Name" required />
                  <input type="email" placeholder="Email" required />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    required
                  />
                  <textarea placeholder="Message" rows={4} required />
                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          ref={footerRef}
          initial={{ y: 16, opacity: 0 }}
          animate={footerInView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-20 pt-10 border-t border-lilac/20"
        >
          <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-2xl font-heading font-bold text-lilac tracking-wider mb-2">
                DAOG
              </p>
              <p className="text-muted-lavender text-sm">
                Everything you want, one place.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-muted-lavender hover:text-lilac text-sm transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-muted-lavender hover:text-lilac text-sm transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    );
  },
);
