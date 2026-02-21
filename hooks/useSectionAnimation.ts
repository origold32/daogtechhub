import { useInView } from "framer-motion";
import { useRef } from "react";

/**
 * useSectionAnimation
 *
 * Returns a ref + isInView boolean. Works correctly on nav jumps, smooth
 * scroll, and regular scrolling because Framer's useInView fires purely
 * based on viewport visibility — no cached measurements to get stale.
 *
 * once: false  → replays animation when scrolling back to the section
 * amount: 0.15 → triggers when 15% of the section enters the viewport
 */
export function useSectionAnimation() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });
  return { ref, isInView };
}
