"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Fuel, Gauge, Calendar, MapPin, MessageCircle, Copy, Check, Car, BadgeCheck, Phone, Shield } from "lucide-react";
import { useFetchOne, useFetchProducts, normaliseCar, type ApiCar } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProductDetailSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: raw, loading, error } = useFetchOne<ApiCar>(`/api/cars/${id}`);
  const car = raw ? normaliseCar(raw) : null;
  const { data: relatedRaw } = useFetchProducts<ApiCar>(`/api/cars?pageSize=5`);
  const related = relatedRaw.map(normaliseCar).filter((c) => c.id !== id).slice(0, 4);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useCartStore();
  const [copied, setCopied] = useState(false);

  if (loading) return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="cars" />
      <main className="pt-[calc(36px+56px+24px)]"><ProductDetailSkeleton /></main>
    </div>
  );

  if (error || !car) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
      <div className="text-center"><p className="text-soft-white text-xl font-bold mb-2">Car not found</p>
        <button onClick={() => router.push("/cars")} className="text-lilac hover:underline">Back to Cars</button></div>
    </div>
  );

  const inWishlist = isInWishlist(car.id);

  return (
    <div className="min-h-screen pb-16" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="cars" />
      <main className="pt-[calc(36px+56px+24px)] px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-muted-lavender mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-lilac transition-colors"><ChevronLeft className="w-3.5 h-3.5" /> Back to Cars</button>
            <span>/</span><span className="text-soft-white">{car.brand}</span><span>/</span><span className="text-lilac line-clamp-1">{car.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 group">
                <Image src={car.image} alt={car.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw,50vw" unoptimized />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <Badge className="bg-lilac text-deep-purple font-bold">{car.condition}</Badge>
                  <Badge className="bg-blue-500/80 text-white">{car.year}</Badge>
                </div>
                <button onClick={() => { inWishlist ? (removeFromWishlist(car.id), toast.info("Removed")) : (addToWishlist({ id: car.id, name: car.name, price: car.price, image: car.image, category: "car" }), toast.success("Saved! ❤️")); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
                  <Heart className={cn("w-4 h-4", inWishlist ? "fill-pink-400 text-pink-400" : "text-white")} />
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-lilac/30 text-lilac">{car.brand}</Badge>
                <Badge variant="outline" className="border-white/10 text-muted-lavender">{car.model}</Badge>
                <div className="flex items-center gap-1 ml-auto"><BadgeCheck className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-medium">Verified Listing</span></div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-soft-white leading-tight">{car.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-lilac">{formatCurrency(car.price)}</span>
                <span className="text-muted-lavender text-sm">Negotiable</span>
              </div>
              <p className="text-muted-lavender leading-relaxed">{car.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: "Year", value: String(car.year) },
                  { icon: Gauge, label: "Mileage", value: car.mileage },
                  { icon: Fuel, label: "Fuel Type", value: car.fuelType },
                  { icon: Car, label: "Transmission", value: car.transmission },
                  { icon: Shield, label: "Condition", value: car.condition },
                  { icon: MapPin, label: "Location", value: "Lagos, Nigeria" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Icon className="w-4 h-4 text-lilac flex-shrink-0" />
                    <div><p className="text-muted-lavender text-xs">{label}</p><p className="text-soft-white text-sm font-medium">{value}</p></div>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5 pt-1">
                <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in the ${car.name} (${car.year}) listed at ${formatCurrency(car.price)} on DAOG Tech Hub. Is it still available?`)}`, "_blank")}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90 h-12 rounded-2xl font-black text-base shadow-lg shadow-green-500/20">
                  <MessageCircle className="w-4 h-4 mr-2" /> Enquire on WhatsApp
                </Button>
                <Button onClick={() => { inWishlist ? (removeFromWishlist(car.id), toast.info("Removed")) : (addToWishlist({ id: car.id, name: car.name, price: car.price, image: car.image, category: "car" }), toast.success("Saved! ❤️")); }}
                  variant="outline" className={cn("w-full rounded-2xl border-lilac/30 h-11", inWishlist ? "bg-pink-500/10 border-pink-500/30 text-pink-300" : "text-muted-lavender hover:text-soft-white")}>
                  <Heart className={cn("w-4 h-4 mr-2", inWishlist && "fill-pink-400")} />{inWishlist ? "Saved" : "Save to Wishlist"}
                </Button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-muted-lavender text-xs">Share:</span>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this ${car.name} for ${formatCurrency(car.price)} on DAOG Tech Hub`)}`} target="_blank" rel="noopener noreferrer"
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
              <h2 className="text-soft-white font-bold text-xl mb-5 flex items-center gap-2"><Car className="w-5 h-5 text-lilac" /> More Cars</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((c) => (
                  <button key={c.id} onClick={() => router.push(`/cars/${c.id}`)} className="group rounded-2xl overflow-hidden border border-white/5 hover:border-lilac/30 bg-white/3 hover:bg-white/5 transition-all text-left">
                    <div className="aspect-video overflow-hidden"><Image src={c.image} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="300px" unoptimized /></div>
                    <div className="p-3"><p className="text-soft-white text-sm font-medium line-clamp-1">{c.name}</p><p className="text-lilac font-bold text-sm mt-0.5">{formatCurrency(c.price)}</p></div>
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
