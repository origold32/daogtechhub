"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Bed, Bath, Maximize2, MapPin, Heart, MessageCircle, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/reusables/FilterBar";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { useCartStore } from "@/store/cartStore";
import { useFetchProducts, normaliseRealEstate, type ApiRealEstate } from "@/hooks/useProducts";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductGridSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function RealEstatePage() {
  const { estateSearch, estateType, setEstateSearch, setEstateType } = useFilterStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useCartStore();
  const router = useRouter();

  const params = new URLSearchParams();
  if (estateSearch) params.set("search", estateSearch);
  if (estateType !== "all") params.set("type", estateType);
  params.set("pageSize", "50");

  const { data: raw, loading, error } = useFetchProducts<ApiRealEstate>(`/api/realestate?${params}`);
  const estates = raw.map(normaliseRealEstate);

  const handleEnquire = (r: ReturnType<typeof normaliseRealEstate>) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in ${r.name} in ${r.location} listed for ${formatCurrency(r.price)} on DAOG Tech Hub. Please share more details.`)}`, "_blank");
  };

  return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="realestate" />
      <main className="pt-[calc(36px+56px+16px)] pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="mb-8 mt-4">
            <h1 className="text-4xl lg:text-5xl font-black text-soft-white mb-1">Real Estate<span className="text-lilac">.</span></h1>
            <p className="text-muted-lavender">Houses, land, apartments & commercial properties in Nigeria</p>
          </motion.div>
          <div className="mb-6">
            <FilterBar searchValue={estateSearch} onSearchChange={setEstateSearch} searchPlaceholder="Search by name, location..."
              filters={[{ value: estateType, onValueChange: setEstateType, placeholder: "All Types", width: "w-[150px]",
                options: [{ value:"all",label:"All Types"},{ value:"house",label:"House"},{ value:"apartment",label:"Apartment"},{ value:"land",label:"Land"},{ value:"commercial",label:"Commercial"}] }]} />
          </div>

          {loading ? <ProductGridSkeleton count={6} /> : error ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🏠</p>
              <p className="text-soft-white font-semibold text-lg mb-2">No properties available yet</p>
              <p className="text-muted-lavender text-sm max-w-sm mx-auto">Listings will appear here once they are added to the store. Check back soon!</p>
            </div>
          ) : estates.length === 0 ? (
            <EmptyState message="No properties found" onClear={() => { setEstateSearch(""); setEstateType("all"); }} />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {estates.map((r, i) => {
                const inWL = isInWishlist(r.id);
                return (
                  <motion.div key={r.id} initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.03 }}
                    onClick={() => router.push(`/realestate/${r.id}`)}
                    className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:border-lilac/40 hover:shadow-2xl hover:shadow-lilac/10 transition-all hover:-translate-y-2 cursor-pointer">
                    <div className="relative h-52 overflow-hidden">
                      <Image src={r.image} alt={r.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width:640px) 100vw,50vw" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3"><Badge className="bg-lilac text-deep-purple text-xs capitalize">{r.type}</Badge></div>
                      <button onClick={(e) => { e.stopPropagation(); inWL ? removeFromWishlist(r.id) : addToWishlist({id:r.id,name:r.name,price:r.price,image:r.image,category:"realestate"}); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <Heart className={cn("w-4 h-4", inWL ? "fill-pink-400 text-pink-400" : "text-white")} />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-3 py-1 w-fit">
                          <MapPin className="w-3 h-3 text-lilac" /><span className="text-white text-xs">{r.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-soft-white font-bold text-base mb-1 line-clamp-1">{r.name}</h3>
                      <p className="text-muted-lavender text-xs line-clamp-2 mb-3">{r.description}</p>
                      <div className="flex items-center gap-3 mb-3">
                        {r.bedrooms && <div className="flex items-center gap-1 text-xs text-muted-lavender"><Bed className="w-3.5 h-3.5" />{r.bedrooms} Beds</div>}
                        {r.bathrooms && <div className="flex items-center gap-1 text-xs text-muted-lavender"><Bath className="w-3.5 h-3.5" />{r.bathrooms} Baths</div>}
                        <div className="flex items-center gap-1 text-xs text-muted-lavender"><Maximize2 className="w-3.5 h-3.5" />{r.size}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {r.features.slice(0,3).map((f) => (<span key={f} className="text-xs bg-lilac/10 text-lilac px-2 py-0.5 rounded-full">{f}</span>))}
                      </div>
                      <p className="text-2xl font-black text-lilac mb-3">{formatCurrency(r.price)}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={(e) => { e.stopPropagation(); handleEnquire(r); }}
                          className="bg-green-600/80 hover:bg-green-600 text-white rounded-xl h-9 text-xs font-bold gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5" /> Enquire
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/realestate/${r.id}`); toast.success("Link copied!"); }}
                          variant="outline" className="border-lilac/30 text-lilac hover:bg-lilac/10 rounded-xl h-9 text-xs gap-1.5">
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
