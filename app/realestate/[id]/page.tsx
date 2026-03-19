"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Bed, Bath, Maximize2, MapPin, MessageCircle, Copy, Check, Home, BadgeCheck, Shield, CheckCircle2 } from "lucide-react";
import { useFetchOne, useFetchProducts, normaliseRealEstate, type ApiRealEstate } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProductDetailSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function RealEstateDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: raw, loading, error } = useFetchOne<ApiRealEstate>(`/api/realestate/${id}`);
  const property = raw ? normaliseRealEstate(raw) : null;
  const { data: relatedRaw } = useFetchProducts<ApiRealEstate>(`/api/realestate?pageSize=5`);
  const related = relatedRaw.map(normaliseRealEstate).filter((r) => r.id !== id).slice(0, 4);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useCartStore();
  const [copied, setCopied] = useState(false);

  if (loading) return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="realestate" />
      <main className="pt-[calc(36px+56px+24px)]"><ProductDetailSkeleton /></main>
    </div>
  );

  if (error || !property) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
      <div className="text-center"><p className="text-soft-white text-xl font-bold mb-2">Property not found</p>
        <button onClick={() => router.push("/realestate")} className="text-lilac hover:underline">Back to Real Estate</button></div>
    </div>
  );

  const inWishlist = isInWishlist(property.id);

  return (
    <div className="min-h-screen pb-16" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="realestate" />
      <main className="pt-[calc(36px+56px+24px)] px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-muted-lavender mb-6">
            <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-lilac transition-colors"><ChevronLeft className="w-3.5 h-3.5" /> Back to Real Estate</button>
            <span>/</span><span className="text-soft-white capitalize">{property.type}</span><span>/</span><span className="text-lilac line-clamp-1">{property.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 group">
                <Image src={property.image} alt={property.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw,50vw" unoptimized />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <Badge className="bg-lilac text-deep-purple font-bold capitalize">{property.type}</Badge>
                </div>
                <button onClick={() => { inWishlist ? (removeFromWishlist(property.id), toast.info("Removed")) : (addToWishlist({ id: property.id, name: property.name, price: property.price, image: property.image, category: "realestate" }), toast.success("Saved! ❤️")); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
                  <Heart className={cn("w-4 h-4", inWishlist ? "fill-pink-400 text-pink-400" : "text-white")} />
                </button>
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur px-3 py-1 rounded-full">
                    <MapPin className="w-3 h-3 text-lilac" /><span className="text-white text-xs">{property.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-lilac/30 text-lilac capitalize">{property.type}</Badge>
                <div className="flex items-center gap-1 ml-auto"><BadgeCheck className="w-4 h-4 text-green-400" /><span className="text-green-400 text-xs font-medium">Verified Listing</span></div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-soft-white leading-tight">{property.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-lilac">{formatCurrency(property.price)}</span>
                <span className="text-muted-lavender text-sm">Negotiable</span>
              </div>
              <p className="text-muted-lavender leading-relaxed">{property.description}</p>
              <div className="flex items-center gap-4 flex-wrap">
                {property.bedrooms && <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"><Bed className="w-4 h-4 text-lilac" /><span className="text-soft-white text-sm">{property.bedrooms} Bedrooms</span></div>}
                {property.bathrooms && <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"><Bath className="w-4 h-4 text-lilac" /><span className="text-soft-white text-sm">{property.bathrooms} Bathrooms</span></div>}
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"><Maximize2 className="w-4 h-4 text-lilac" /><span className="text-soft-white text-sm">{property.size}</span></div>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2"><MapPin className="w-4 h-4 text-lilac" /><span className="text-soft-white text-sm">{property.location}</span></div>
              </div>
              {property.features.length > 0 && (
                <div>
                  <p className="text-soft-white text-sm font-semibold mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 bg-lilac/10 text-lilac text-xs px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />{f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2.5 pt-1">
                <Button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in ${property.name} in ${property.location} listed for ${formatCurrency(property.price)} on DAOG Tech Hub.`)}`, "_blank")}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90 h-12 rounded-2xl font-black text-base shadow-lg shadow-green-500/20">
                  <MessageCircle className="w-4 h-4 mr-2" /> Enquire on WhatsApp
                </Button>
                <Button onClick={() => { inWishlist ? (removeFromWishlist(property.id), toast.info("Removed")) : (addToWishlist({ id: property.id, name: property.name, price: property.price, image: property.image, category: "realestate" }), toast.success("Saved! ❤️")); }}
                  variant="outline" className={cn("w-full rounded-2xl border-lilac/30 h-11", inWishlist ? "bg-pink-500/10 border-pink-500/30 text-pink-300" : "text-muted-lavender hover:text-soft-white")}>
                  <Heart className={cn("w-4 h-4 mr-2", inWishlist && "fill-pink-400")} />{inWishlist ? "Saved" : "Save to Wishlist"}
                </Button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-muted-lavender text-xs">Share:</span>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${property.name} for ${formatCurrency(property.price)} on DAOG Tech Hub`)}`} target="_blank" rel="noopener noreferrer"
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
              <h2 className="text-soft-white font-bold text-xl mb-5 flex items-center gap-2"><Home className="w-5 h-5 text-lilac" /> More Properties</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((r) => (
                  <button key={r.id} onClick={() => router.push(`/realestate/${r.id}`)} className="group rounded-2xl overflow-hidden border border-white/5 hover:border-lilac/30 bg-white/3 hover:bg-white/5 transition-all text-left">
                    <div className="aspect-video overflow-hidden"><Image src={r.image} alt={r.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="300px" unoptimized /></div>
                    <div className="p-3"><p className="text-soft-white text-sm font-medium line-clamp-1">{r.name}</p><p className="text-lilac font-bold text-sm mt-0.5">{formatCurrency(r.price)}</p></div>
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
