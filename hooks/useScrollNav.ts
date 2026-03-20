// hooks/useScrollNav.ts
// Smooth auto-hide navbar on scroll down, reveal on scroll up.
// Works correctly with a fixed announcement banner above the nav.
"use client";

import { useState, useEffect, useRef } from "react";

interface Options {
  /** Minimum px scrolled from top before hide kicks in (default: 60) */
  threshold?: number;
  /** Minimum px of scroll delta before triggering show/hide (reduces jitter) */
  hysteresis?: number;
}

export function useScrollNav({ threshold = 60, hysteresis = 8 }: Options = {}) {
  const [visible,  setVisible]  = useState(true);
  const lastScrollY = useRef(0);
  const ticking     = useRef(false);

  useEffect(() => {
    // Initialise to current scroll position
    lastScrollY.current = window.scrollY;

    function update() {
      const current = window.scrollY;
      const delta   = current - lastScrollY.current;

      if (current <= threshold) {
        // Always show at top of page
        setVisible(true);
      } else if (delta > hysteresis) {
        // Scrolled down enough — hide
        setVisible(false);
      } else if (delta < -hysteresis) {
        // Scrolled up enough — show
        setVisible(true);
      }

      lastScrollY.current = current;
      ticking.current     = false;
    }

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, hysteresis]);

  return visible;
}