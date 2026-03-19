"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ShoppingCart, Heart, Star, Shield, Truck, RotateCcw, MessageCircle, Copy, Check, Shirt, BadgeCheck } from "lucide-react";
import { useFetchOne, useFetchProducts, normaliseJersey, type ApiJersey } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProductDetailSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function JerseyDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: raw, loading, error } = useFetchOne<ApiJersey>(`/api/jerseys/${id}`);
  const jersey = raw ? normaliseJersey(raw) : null;
  const { data: relatedRaw } = useFetchProducts<ApiJersey>(`/api/jerseys?pageSize=5`);
  const related = relatedRaw.map(normaliseJersey).filter((j) => j.id !== id).slice(0, 4);

  const { addItem, isInWishlist, addToWishlist, removeFromWishlist, setCartOpen } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (loading) return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="jerseys" />
      <main className="pt-[calc(36px+56px+24px)]"><ProductDetailSkeleton /></main>
    </div>
  );

  if (error || !jersey) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
      <div className="text-center"><p className="text-soft-white text-xl font-bold mb-2">Jersey not found</p>
        <button onClick={() => router.push("/jerseys")} className="text-lilac hover:underline">Back to Jerseys</button></div>
    </div>
  );

  const inWishlist = isInWishlist(jersey.id);
  const sz = selectedSize || jersey.size[0] || "M";

  const handleAddToCart = () => {
    addItem({ id: jersey.id, name: jersey.name, price: jersey.price, image: jersey.image, category: "jersey", size: sz });
    toast.success(`${jersey.name} (${sz}) added to cart!`); setCartOpen(true);
  };

  return (
    <div className="min-h-screen pb-16" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="jerseys" />
      <main className="pt-[calc(36px+56px+24px)] px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-muted-lavender mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-lilac transition-colors"><ChevronLeft className="w-3.5 h-3.5" /> Back to Jerseys</button>
            <span>/</span><span className="text-soft-white">{jersey.team}</span><span>/</span><span className="text-lilac line-clamp-1">{jersey.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 group">
                <Image src={jersey.image} alt={jersey.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw,50vw" unoptimized />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <Badge className="bg-lilac text-deep-purple font-bold capitalize">{jersey.category}</Badge>
                  <Badge className="bg-blue-500/80 text-white capitalize">{jersey.type}</Badge>
                </div>
                <button onClick={() => { inWishlist ? (removeFromWishlist(jersey.id), toast.info("Removed")) : (addToWishlist({ id: jersey.id, name: jersey.name, price: jersey.price, image: jersey.image, category: "jersey" }), toast.success("Added to wishlist ❤️")); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
                  <Heart className={cn("w-4 h-4", inWishlist ? "fill-pink-400 text-pink-400" : "text-white")} />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-lilac/30 text-lilac">{jersey.team}</Badge>
                <Badge variant="outline" className="border-white/10 text-muted-lavender">Season {jersey.season}</Badge>
                <div className="flex items-center gap-1 ml-auto"><BadgeCheck className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-medium">Official Kit</span></div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-soft-white leading-tight">{jersey.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex">{[1,2,3,4,5].map((s) => (<Star key={s} className={cn("w-4 h-4", s <= 4 ? "fill-amber-400 text-amber-400" : "text-white/20")} />))}</div>
                <span className="text-muted-lavender text-sm">4.0</span>
              </div>
              <span className="text-3xl font-black text-lilac block">{formatCurrency(jersey.price)}</span>
              <p className="text-muted-lavender leading-relaxed">{jersey.description}</p>
              {jersey.size.length > 0 && (
                <div>
                  <p className="text-soft-white text-sm font-semibold mb-2.5">Size: <span className="text-lilac">{sz}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {jersey.size.map((s) => (
                      <button key={s} onClick={() => setSelectedSize(s)} className={cn("w-12 h-12 rounded-xl border-2 text-sm font-bold transition-all", sz === s ? "bg-lilac text-deep-purple border-lilac shadow-lg shadow-lilac/20" : "border-white/20 text-muted-lavender hover:border-lilac/50 hover:text-soft-white")}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2.5 pt-1">
                <Button onClick={handleAddToCart} className="w-full bg-gradient-to-r from-lilac to-purple-500 text-deep-purple hover:opacity-90 h-12 rounded-2xl font-black text-base shadow-lg shadow-lilac/20 group">
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" /> Add to Cart — {sz}
                </Button>
                <Button onClick={() => { inWishlist ? (removeFromWishlist(jersey.id), toast.info("Removed")) : (addToWishlist({ id: jersey.id, name: jersey.name, price: jersey.price, image: jersey.image, category: "jersey" }), toast.success("Wishlisted! ❤️")); }}
                  variant="outline" className={cn("w-full rounded-2xl border-lilac/30 h-11", inWishlist ? "bg-pink-500/10 border-pink-500/30 text-pink-300" : "text-muted-lavender hover:text-soft-white")}>
                  <Heart className={cn("w-4 h-4 mr-2", inWishlist && "fill-pink-400")} />{inWishlist ? "Wishlisted" : "Add to Wishlist"}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ icon: Shield, label: "Authentic" }, { icon: Truck, label: "Fast Delivery" }, { icon: RotateCcw, label: "Easy Returns" }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5"><Icon className="w-4 h-4 text-lilac" /><span className="text-muted-lavender text-xs text-center">{label}</span></div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-muted-lavender text-xs">Share:</span>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${jersey.name} - ${formatCurrency(jersey.price)} | DAOG Tech Hub`)}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs hover:bg-green-500/30 transition-colors">
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); toast.success("Link copied!"); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-muted-lavender text-xs hover:bg-white/20 transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}{copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </motion.div>
          </div>

          {related.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-16">
              <h2 className="text-soft-white font-bold text-xl mb-5 flex items-center gap-2"><Shirt className="w-5 h-5 text-lilac" /> More Jerseys</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((j) => (
                  <button key={j.id} onClick={() => router.push(`/jerseys/${j.id}`)} className="group rounded-2xl overflow-hidden border border-white/5 hover:border-lilac/30 bg-white/3 hover:bg-white/5 transition-all text-left">
                    <div className="aspect-square overflow-hidden"><Image src={j.image} alt={j.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="200px" unoptimized /></div>
                    <div className="p-3"><p className="text-soft-white text-sm font-medium line-clamp-1">{j.name}</p><p className="text-lilac font-bold text-sm mt-0.5">{formatCurrency(j.price)}</p></div>
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
