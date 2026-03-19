"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/reusables/FilterBar";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { useCartStore } from "@/store/cartStore";
import { useFetchProducts, normaliseJersey, type ApiJersey } from "@/hooks/useProducts";
import { toast } from "sonner";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProductGridSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function JerseysPage() {
  const { jerseySearch, jerseyType, setJerseySearch, setJerseyType } = useFilterStore();
  const { addItem, isInWishlist, addToWishlist, removeFromWishlist, setCartOpen } = useCartStore();
  const router = useRouter();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  const params = new URLSearchParams();
  if (jerseySearch) params.set("search", jerseySearch);
  if (jerseyType !== "all") params.set("type", jerseyType);
  params.set("pageSize", "50");

  const { data: raw, loading, error } = useFetchProducts<ApiJersey>(`/api/jerseys?${params}`);
  const jerseys = raw.map(normaliseJersey);

  const handleAdd = (jersey: ReturnType<typeof normaliseJersey>, e: React.MouseEvent) => {
    e.stopPropagation();
    const sz = selectedSizes[jersey.id] ?? jersey.size[0];
    addItem({ id: jersey.id, name: jersey.name, price: jersey.price, image: jersey.image, category: "jersey", size: sz });
    toast.success(`${jersey.name} (${sz}) added to cart!`);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="jerseys" />
      <main className="pt-[calc(36px+56px+16px)] pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 mt-4">
            <h1 className="text-4xl lg:text-5xl font-black text-soft-white mb-1">Jerseys<span className="text-lilac">.</span></h1>
            <p className="text-muted-lavender">Authentic football, basketball & NFL jerseys</p>
          </motion.div>

          <div className="mb-6">
            <FilterBar searchValue={jerseySearch} onSearchChange={setJerseySearch} searchPlaceholder="Search jerseys..."
              filters={[{ value: jerseyType, onValueChange: setJerseyType, placeholder: "All Types", width: "w-[150px]",
                options: [{ value: "all", label: "All Types" }, { value: "club", label: "Club" }, { value: "country", label: "Country" }, { value: "nfl", label: "NFL" }, { value: "basketball", label: "Basketball" }, { value: "retro", label: "Retro" }] }]} />
          </div>

          {loading ? <ProductGridSkeleton count={8} /> : error ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🏷️</p>
              <p className="text-soft-white font-semibold text-lg mb-2">No jerseys available yet</p>
              <p className="text-muted-lavender text-sm max-w-sm mx-auto">Products will appear here once they are added to the store. Check back soon!</p>
            </div>
          ) : jerseys.length === 0 ? (
            <EmptyState message="No jerseys found" onClear={() => { setJerseySearch(""); setJerseyType("all"); }} />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {jerseys.map((jersey, i) => {
                  const inWL = isInWishlist(jersey.id);
                  const selSize = selectedSizes[jersey.id] ?? jersey.size[0];
                  return (
                    <motion.div key={jersey.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03 }}
                      onClick={() => router.push(`/jerseys/${jersey.id}`)}
                      className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-lilac/40 hover:shadow-xl hover:shadow-lilac/10 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="relative aspect-square overflow-hidden">
                        <Image src={jersey.image} alt={jersey.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw,50vw" unoptimized />
                        <Badge className="absolute top-2 left-2 bg-lilac text-deep-purple text-xs capitalize">{jersey.type}</Badge>
                        <button onClick={(e) => { e.stopPropagation(); inWL ? (removeFromWishlist(jersey.id), toast.info("Removed from wishlist")) : (addToWishlist({ id: jersey.id, name: jersey.name, price: jersey.price, image: jersey.image, category: "jersey" }), toast.success("Added to wishlist! ❤️")); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                          <Heart className={cn("w-4 h-4", inWL ? "fill-pink-400 text-pink-400" : "text-white")} />
                        </button>
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${jersey.name} - ${formatCurrency(jersey.price)} on DAOG Tech Hub!`)}`}
                            target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="w-7 h-7 rounded-full bg-green-500/40 backdrop-blur flex items-center justify-center hover:bg-green-500/60 transition-colors">
                            <MessageCircle className="w-3.5 h-3.5 text-green-300" />
                          </a>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-1">
                          {[1,2,3,4,5].map((s) => (<Star key={s} className={cn("w-3 h-3", s <= 4 ? "fill-amber-400 text-amber-400" : "text-white/20")} />))}
                          <span className="text-muted-lavender text-xs ml-1">4.8</span>
                        </div>
                        <p className="text-soft-white font-semibold text-sm line-clamp-1 mb-0.5">{jersey.name}</p>
                        <p className="text-muted-lavender text-xs mb-2">{jersey.team} · {jersey.season}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {jersey.size.map((sz) => (
                            <button key={sz} onClick={(e) => { e.stopPropagation(); setSelectedSizes((prev) => ({ ...prev, [jersey.id]: sz })); }}
                              className={cn("text-xs px-2 py-0.5 rounded-lg border transition-all", selSize === sz ? "bg-lilac text-deep-purple border-lilac" : "border-white/20 text-muted-lavender hover:border-lilac/40")}>
                              {sz}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-black text-lilac">{formatCurrency(jersey.price)}</span>
                        </div>
                        <Button onClick={(e) => handleAdd(jersey, e)} className="w-full bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl h-9 text-xs font-bold">
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
