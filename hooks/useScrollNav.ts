// hooks/useScrollNav.ts
// Returns whether the navbar should be visible based on scroll direction.
// - Visible on mount and when scrolling UP
// - Hidden when scrolling DOWN (past threshold)
// - Always visible when at the top
"use client";

import { useState, useEffect, useRef } from "react";

interface Options {
  threshold?: number;   // px scrolled before hide kicks in (default 80)
  hysteresis?: number;  // minimum px change to trigger state flip (default 6)
}

export function useScrollNav({ threshold = 80, hysteresis = 6 }: Options = {}) {
  const [visible, setVisible] = useState(true);
  const lastY    = useRef(0);
  const ticking  = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y    = window.scrollY;
        const diff = y - lastY.current;

        if (y < threshold) {
          // Always show at top
          setVisible(true);
        } else if (diff > hysteresis) {
          // Scrolling down — hide
          setVisible(false);
        } else if (diff < -hysteresis) {
          // Scrolling up — show
          setVisible(true);
        }

        lastY.current   = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, hysteresis]);

  return visible;
}