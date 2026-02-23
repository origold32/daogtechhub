// app/(landing)/components/ContactSection.tsx

"use client";

import { forwardRef, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

type FormStatus = "idle" | "loading" | "success" | "error";

export const ContactSection = forwardRef<HTMLElement>(
  function ContactSection(_, forwardedRef) {
    const innerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(innerRef, { once: false, amount: 0.15 });

    const [status, setStatus] = useState<FormStatus>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setStatus("loading");
      setErrorMsg("");

      const form = e.currentTarget;

      try {
        const res = await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            product: (form.elements.namedItem("product") as HTMLInputElement)
              .value,
            message: (form.elements.namedItem("message") as HTMLTextAreaElement)
              .value,
          }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(
            json?.error ?? "Something went wrong. Please try again.",
          );
        }

        setStatus("success");
        form.reset();
      } catch (err: unknown) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      }
    }

    return (
      <section
        ref={forwardedRef}
        className="relative bg-mid-purple py-24 lg:py-32 overflow-hidden z-10"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(212,165,255,0.18),transparent_55%)]" />

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
                LET&apos;S CLOSE THE DEAL
              </h2>
              <p className="text-muted-lavender text-lg mb-10">
                Tell us what you need. We&apos;ll reply within hours.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <Phone className="w-6 h-6 text-lilac" />,
                    primary: "+234 810 255 7217",
                    secondary: "+234 806 202 0190",
                    href: "tel:+2348102557217",
                    secondaryHref: "tel:+2348062020190",
                  },
                  {
                    icon: <Mail className="w-6 h-6 text-lilac" />,
                    primary: "daogstore@gmail.com",
                    href: "mailto:daogstore@gmail.com",
                  },
                  {
                    icon: <MapPin className="w-6 h-6 text-lilac" />,
                    primary: "Surulere, Lagos",
                    href: "https://maps.google.com/?q=Surulere+Lagos",
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
                    className="flex items-center gap-4 group"
                  >
                    <div className="icon-badge flex-shrink-0">{item.icon}</div>

                    <div className="flex flex-col">
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-soft-white font-medium hover:text-lilac transition"
                      >
                        {item.primary}
                      </a>

                      {item.secondary && item.secondaryHref && (
                        <a
                          href={item.secondaryHref}
                          className="text-muted-lavender text-sm hover:text-lilac transition mt-1"
                        >
                          {item.secondary}
                        </a>
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
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
                  <CheckCircle className="w-14 h-14 text-lilac" />
                  <h3 className="text-soft-white text-xl font-heading font-bold">
                    Message Sent!
                  </h3>
                  <p className="text-muted-lavender text-sm">
                    Thanks for reaching out. We&apos;ll get back to you within
                    hours.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-2 text-lilac text-sm underline underline-offset-4 hover:text-soft-white transition"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      required
                      disabled={status === "loading"}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      required
                      disabled={status === "loading"}
                    />
                    <input
                      type="text"
                      name="product"
                      placeholder="What are you looking for?"
                      required
                      disabled={status === "loading"}
                    />
                    <textarea
                      name="message"
                      placeholder="Message"
                      rows={4}
                      required
                      disabled={status === "loading"}
                    />

                    {status === "error" && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    );
  },
);
