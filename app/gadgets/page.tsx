"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowRightLeft, Heart, Star, Zap, Share2, MessageCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/reusables/FilterBar";
import { ResultsCount } from "@/components/reusables/ResultsCount";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { useCartStore } from "@/store/cartStore";
import { useSwapStore } from "@/store/swapStore";
import { useFetchProducts, normaliseGadget, type ApiGadget } from "@/hooks/useProducts";
import { toast } from "sonner";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { SwapModal } from "@/components/reusables/SwapModal";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ProductGridSkeleton } from "@/components/loaders/ProductCardSkeleton";

type Gadget = ReturnType<typeof normaliseGadget>;

function GadgetCard({ gadget }: { gadget: Gadget }) {
  const { addItem, isInWishlist, addToWishlist, removeFromWishlist, setCartOpen } = useCartStore();
  const { openSwapModal } = useSwapStore();
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const inWishlist = isInWishlist(gadget.id);

  const recordAnalyticsEvent = async () => {
    try {
      await fetch("/api/analytics/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "add_to_cart",
          productId: gadget.id,
          productCategory: "gadget",
          metadata: { productName: gadget.name },
        }),
      });
    } catch {
      // ignore analytics failures
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTilt({ x: ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6, y: ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6 });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: gadget.id, name: gadget.name, price: gadget.price, image: gadget.image, category: "gadget" });
    void recordAnalyticsEvent();
    toast.success(`${gadget.name} added to cart!`);
    setCartOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) { removeFromWishlist(gadget.id); toast.info("Removed from wishlist"); }
    else { addToWishlist({ id: gadget.id, name: gadget.name, price: gadget.price, image: gadget.image, category: "gadget" }); toast.success("Added to wishlist! ❤️"); }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/gadgets/${gadget.id}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Link copied!");
  };

  return (
    <motion.div ref={cardRef} onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      style={{ transform: hovered ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : "none", transition: hovered ? "none" : "transform 0.4s ease" }}
      className="group relative cursor-pointer" onClick={() => router.push(`/gadgets/${gadget.id}`)}>
      <motion.div animate={{ y: hovered ? -6 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-lilac/50 group-hover:shadow-xl group-hover:shadow-lilac/15">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
          <Image src={gadget.image} alt={gadget.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width:640px) 100vw,50vw" unoptimized />
          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3 gap-2">
                <button onClick={handleShare} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors">
                  {copied ? <Copy className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5 text-white" />}
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${gadget.name} on DAOG Tech Hub - ${formatCurrency(gadget.price)}`)}`}
                  target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-full bg-green-500/30 backdrop-blur flex items-center justify-center hover:bg-green-500/50 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge className="bg-lilac text-deep-purple text-xs font-bold">{gadget.condition}</Badge>
            {gadget.type === "phone" && <Badge className="bg-blue-500/80 text-white text-xs">Swappable</Badge>}
          </div>
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center transition-colors hover:bg-black/60">
            <Heart className={cn("w-4 h-4 transition-all", inWishlist ? "fill-pink-400 text-pink-400" : "text-white")} />
          </motion.button>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge variant="outline" className="text-xs border-lilac/30 text-lilac py-0 px-1.5">{gadget.brand}</Badge>
            <Badge variant="outline" className="text-xs border-white/10 text-muted-lavender py-0 px-1.5 capitalize">{gadget.type}</Badge>
          </div>
          <h3 className="text-soft-white font-semibold text-sm line-clamp-1 mb-0.5">{gadget.name}</h3>
          <p className="text-muted-lavender text-xs line-clamp-2 mb-2">{gadget.description}</p>
          {gadget.specs && (
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(gadget.specs).slice(0, 2).map(([k, v]) => (
                <span key={k} className="text-xs bg-white/5 text-muted-lavender px-2 py-0.5 rounded-lg">{v as string}</span>
              ))}
            </div>
          )}
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xl font-black text-lilac">{formatCurrency(gadget.price)}</span>
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (<Star key={s} className={cn("w-3 h-3", s <= 4 ? "fill-amber-400 text-amber-400" : "text-white/20")} />))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddToCart} className="flex-1 bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl h-9 text-xs font-bold group/btn">
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5 group-hover/btn:animate-bounce" /> Add to Cart
            </Button>
            {gadget.type === "phone" && (
              <Button onClick={(e) => { e.stopPropagation(); openSwapModal(gadget.id, gadget.name); }}
                variant="outline" className="px-3 border-lilac/30 text-lilac hover:bg-lilac/10 rounded-xl h-9">
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GadgetsPage() {
  const { gadgetSearch, gadgetType, gadgetBrand, setGadgetSearch, setGadgetType, setGadgetBrand } = useFilterStore();

  const queryParams = new URLSearchParams();
  if (gadgetSearch) queryParams.set("search", gadgetSearch);
  if (gadgetType !== "all") queryParams.set("type", gadgetType);
  if (gadgetBrand !== "all") queryParams.set("brand", gadgetBrand);
  queryParams.set("pageSize", "50");

  const { data: raw, loading, error } = useFetchProducts<ApiGadget>(`/api/gadgets?${queryParams}`);
  const gadgets = raw.map(normaliseGadget);
  const brands = [...new Set(gadgets.map((g) => g.brand))];

  return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="gadgets" />
      <SwapModal />
      <main className="pt-[calc(36px+56px+16px)] pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 mt-4">
            <div className="flex items-center gap-2 mb-1"><Zap className="w-5 h-5 text-lilac" /><span className="text-lilac text-sm font-medium uppercase tracking-widest">Premium Collection</span></div>
            <h1 className="text-4xl lg:text-5xl font-black text-soft-white mb-2">Gadgets<span className="text-lilac">.</span></h1>
            <p className="text-muted-lavender">Latest phones, laptops, gaming consoles & accessories</p>
          </motion.div>

          <div className="mb-6">
            <FilterBar searchValue={gadgetSearch} onSearchChange={setGadgetSearch} searchPlaceholder="Search gadgets..."
              filters={[
                { value: gadgetType, onValueChange: setGadgetType, placeholder: "All Types", width: "w-[150px]",
                  options: [{ value: "all", label: "All Types" }, { value: "phone", label: "Phones" }, { value: "laptop", label: "Laptops" }, { value: "game", label: "Gaming" }, { value: "tablet", label: "Tablets" }, { value: "accessory", label: "Accessories" }] },
                { value: gadgetBrand, onValueChange: setGadgetBrand, placeholder: "All Brands", width: "w-[150px]",
                  options: [{ value: "all", label: "All Brands" }, ...brands.map((b) => ({ value: b.toLowerCase(), label: b }))] },
              ]} />
          </div>

          {loading ? <ProductGridSkeleton count={8} /> : error ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📱</p>
              <p className="text-soft-white font-semibold text-lg mb-2">No gadgets available yet</p>
              <p className="text-muted-lavender text-sm max-w-sm mx-auto">Products will appear here once they are added to the store. Check back soon!</p>
            </div>
          ) : gadgets.length === 0 ? (
            <EmptyState message="No gadgets found" onClear={() => { setGadgetSearch(""); setGadgetType("all"); setGadgetBrand("all"); }} />
          ) : (
            <>
              <div className="mb-6"><ResultsCount count={gadgets.length} /></div>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence>
                  {gadgets.map((gadget, i) => (
                    <motion.div key={gadget.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.03, type: "spring", stiffness: 400 }}>
                      <GadgetCard gadget={gadget} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
