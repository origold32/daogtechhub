"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Star, Share2, Shield, Truck, RotateCcw, MessageCircle, Copy, Check, Zap, ArrowRightLeft, ZoomIn, BadgeCheck } from "lucide-react";
import { useFetchOne, useFetchProducts, normaliseGadget, type ApiGadget } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { useSwapStore } from "@/store/swapStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter, notFound } from "next/navigation";
import { ProductDetailSkeleton } from "@/components/loaders/ProductCardSkeleton";
import { SwapModal } from "@/components/reusables/SwapModal";

export default function GadgetDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: raw, loading, error } = useFetchOne<ApiGadget>(`/api/gadgets/${id}`);
  const gadget = raw ? normaliseGadget(raw) : null;

  const { data: relatedRaw } = useFetchProducts<ApiGadget>(`/api/gadgets?pageSize=5`);
  const related = relatedRaw.map(normaliseGadget).filter((g) => g.id !== id).slice(0, 4);

  const { addItem, isInWishlist, addToWishlist, removeFromWishlist, setCartOpen } = useCartStore();
  const { openSwapModal } = useSwapStore();

  const [activeImg, setActiveImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || !isZoomed) return;
    const rect = imgRef.current.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }, [isZoomed]);

  if (loading) return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="gadgets" />
      <main className="pt-[calc(36px+56px+24px)]"><ProductDetailSkeleton /></main>
    </div>
  );

  if (error || !gadget) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
      <div className="text-center">
        <p className="text-soft-white text-xl font-bold mb-2">Gadget not found</p>
        <button onClick={() => router.push("/gadgets")} className="text-lilac hover:underline">Back to Gadgets</button>
      </div>
    </div>
  );

  const inWishlist = isInWishlist(gadget.id);
  const images = [gadget.image];

  const handleAddToCart = () => {
    addItem({ id: gadget.id, name: gadget.name, price: gadget.price, image: gadget.image, category: "gadget" });
    toast.success(`${gadget.name} added to cart!`); setCartOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); toast.success("Link copied!"); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-16" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="gadgets" />
      <SwapModal />
      <main className="pt-[calc(36px+56px+24px)] px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-muted-lavender mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-lilac transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Gadgets
            </button>
            <span>/</span><span className="text-soft-white capitalize">{gadget.type}</span><span>/</span>
            <span className="text-lilac line-clamp-1">{gadget.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
              <div ref={imgRef} onMouseMove={handleMouseMove} onMouseEnter={() => setIsZoomed(true)} onMouseLeave={() => setIsZoomed(false)}
                className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 cursor-zoom-in group">
                <motion.img key={activeImg} src={images[activeImg]} alt={gadget.name} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full object-cover" style={isZoomed ? { transform: "scale(1.6)", transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}} />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur px-2.5 py-1.5 rounded-full text-xs text-white"><ZoomIn className="w-3 h-3" /> Hover to zoom</div>
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <Badge className="bg-lilac text-deep-purple font-bold">{gadget.condition}</Badge>
                  {gadget.type === "phone" && <Badge className="bg-blue-500/80 text-white">Swappable</Badge>}
                </div>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-lilac/30 text-lilac">{gadget.brand}</Badge>
                <Badge variant="outline" className="border-white/10 text-muted-lavender capitalize">{gadget.type}</Badge>
                <div className="flex items-center gap-1 ml-auto"><BadgeCheck className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-medium">Verified Seller</span></div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-soft-white leading-tight">{gadget.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex">{[1,2,3,4,5].map((s) => (<Star key={s} className={cn("w-4 h-4", s <= 4 ? "fill-amber-400 text-amber-400" : "text-white/20")} />))}</div>
                <span className="text-muted-lavender text-sm">4.0</span>
              </div>
              <span className="text-3xl font-black text-lilac block">{formatCurrency(gadget.price)}</span>
              <p className="text-muted-lavender leading-relaxed">{gadget.description}</p>
              {gadget.specs && Object.keys(gadget.specs).length > 0 && (
                <div>
                  <p className="text-soft-white text-sm font-semibold mb-2">Specifications</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(gadget.specs).map(([k, v]) => (
                      <div key={k} className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
                        <p className="text-muted-lavender text-xs capitalize">{k}</p>
                        <p className="text-soft-white text-sm font-medium mt-0.5">{v as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2.5 pt-1">
                <Button onClick={handleAddToCart} className="w-full bg-gradient-to-r from-lilac to-purple-500 text-deep-purple hover:opacity-90 h-12 rounded-2xl font-black text-base shadow-lg shadow-lilac/20 group">
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" /> Add to Cart
                </Button>
                <div className="flex gap-2">
                  <Button onClick={() => { inWishlist ? (removeFromWishlist(gadget.id), toast.info("Removed from wishlist")) : (addToWishlist({ id: gadget.id, name: gadget.name, price: gadget.price, image: gadget.image, category: "gadget" }), toast.success("Added to wishlist ❤️")); }}
                    variant="outline" className={cn("flex-1 rounded-2xl border-lilac/30 h-11", inWishlist ? "bg-pink-500/10 border-pink-500/30 text-pink-300" : "text-muted-lavender hover:text-soft-white")}>
                    <Heart className={cn("w-4 h-4 mr-2", inWishlist && "fill-pink-400")} />{inWishlist ? "Wishlisted" : "Wishlist"}
                  </Button>
                  {gadget.type === "phone" && (
                    <Button onClick={() => openSwapModal(gadget.id, gadget.name)} variant="outline" className="flex-1 rounded-2xl border-lilac/30 text-muted-lavender h-11 hover:text-soft-white">
                      <ArrowRightLeft className="w-4 h-4 mr-2" /> Swap
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ icon: Shield, label: "Authentic" }, { icon: Truck, label: "Fast Delivery" }, { icon: RotateCcw, label: "Easy Returns" }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5"><Icon className="w-4 h-4 text-lilac" /><span className="text-muted-lavender text-xs text-center">{label}</span></div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-muted-lavender text-xs">Share:</span>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${gadget.name} - ${formatCurrency(gadget.price)} | DAOG Tech Hub`)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs hover:bg-green-500/30 transition-colors">
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-muted-lavender text-xs hover:bg-white/20 transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}{copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </motion.div>
          </div>

          {related.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-16">
              <h2 className="text-soft-white font-bold text-xl mb-5 flex items-center gap-2"><Zap className="w-5 h-5 text-lilac" /> Similar Gadgets</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((g) => (
                  <button key={g.id} onClick={() => router.push(`/gadgets/${g.id}`)} className="group rounded-2xl overflow-hidden border border-white/5 hover:border-lilac/30 bg-white/3 hover:bg-white/5 transition-all text-left">
                    <div className="aspect-square overflow-hidden"><Image src={g.image} alt={g.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" unoptimized /></div>
                    <div className="p-3"><p className="text-soft-white text-sm font-medium line-clamp-1">{g.name}</p><p className="text-lilac font-bold text-sm mt-0.5">{formatCurrency(g.price)}</p></div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
