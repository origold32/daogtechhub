"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { useRouter } from "next/navigation";

// Category browse shortcuts — real navigation links, no mock product names
const CATEGORIES = [
  { label: "Gadgets",     href: "/gadgets"    },
  { label: "Jerseys",     href: "/jerseys"    },
  { label: "Cars",        href: "/cars"       },
  { label: "Real Estate", href: "/realestate" },
];

interface SearchResult {
  id: string; name: string; price: number; image: string;
  category: "gadgets" | "jerseys" | "cars" | "realestate";
}

interface SmartSearchProps { isOpen: boolean; onClose: () => void; }

export function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const router = useRouter();
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const [g, j, c, r] = await Promise.all([
        fetch(`/api/gadgets?search=${encodeURIComponent(q)}&pageSize=3`).then((r) => r.json()),
        fetch(`/api/jerseys?search=${encodeURIComponent(q)}&pageSize=3`).then((r) => r.json()),
        fetch(`/api/cars?search=${encodeURIComponent(q)}&pageSize=3`).then((r) => r.json()),
        fetch(`/api/realestate?search=${encodeURIComponent(q)}&pageSize=3`).then((r) => r.json()),
      ]);
      const all: SearchResult[] = [
        ...(g.data ?? []).map((x: any) => ({ id: x.id, name: x.name, price: x.price, image: x.image_url, category: "gadgets"    as const })),
        ...(j.data ?? []).map((x: any) => ({ id: x.id, name: x.name, price: x.price, image: x.image_url, category: "jerseys"    as const })),
        ...(c.data ?? []).map((x: any) => ({ id: x.id, name: x.name, price: x.price, image: x.image_url, category: "cars"       as const })),
        ...(r.data ?? []).map((x: any) => ({ id: x.id, name: x.name, price: x.price, image: x.image_url, category: "realestate" as const })),
      ];
      setResults(all.slice(0, 8));
    } catch { setResults([]); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const navigate = (result: SearchResult) => {
    router.push(`/${result.category}/${result.id}`);
    onClose();
  };

  const navigateTo = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl border border-white/10 bg-[#1a0b2e]/95 backdrop-blur overflow-hidden shadow-2xl">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-lilac flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gadgets, jerseys, cars, properties…"
                className="flex-1 bg-transparent text-soft-white placeholder-muted-lavender outline-none text-sm"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-lavender hover:text-lilac transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={onClose} className="text-muted-lavender hover:text-lilac text-xs transition-colors">ESC</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {/* Browse categories (shown when no query) */}
              {!query && (
                <div className="p-4">
                  <p className="text-muted-lavender text-xs font-medium mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Browse categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.href}
                        onClick={() => navigateTo(c.href)}
                        className="text-xs bg-white/5 text-muted-lavender px-3 py-1.5 rounded-full hover:bg-lilac/10 hover:text-lilac transition-colors"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
                </div>
              )}

              {/* No results */}
              {!loading && query && results.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-lavender text-sm">No results for &quot;{query}&quot;</p>
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <div className="p-2">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(r)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <Image src={r.image ?? "/images/gadgets_phone.jpg"} alt={r.name} width={40} height={40} className="rounded-lg object-cover flex-shrink-0" unoptimized />
                      <div className="flex-1 min-w-0">
                        <p className="text-soft-white text-sm font-medium line-clamp-1">{r.name}</p>
                        <p className="text-muted-lavender text-xs capitalize">{r.category}</p>
                      </div>
                      <p className="text-lilac text-sm font-bold flex-shrink-0">{formatCurrency(r.price)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
