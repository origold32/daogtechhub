"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Fuel, Gauge, Calendar, MessageCircle, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/reusables/FilterBar";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { useFetchProducts, normaliseCar, type ApiCar } from "@/hooks/useProducts";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProductGridSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function CarsPage() {
  const { carSearch, carBrand, setCarSearch, setCarBrand } = useFilterStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useCartStore();
  const router = useRouter();

  const params = new URLSearchParams();
  if (carSearch) params.set("search", carSearch);
  if (carBrand !== "all") params.set("brand", carBrand);
  params.set("pageSize", "50");

  const { data: raw, loading, error } = useFetchProducts<ApiCar>(`/api/cars?${params}`);
  const cars = raw.map(normaliseCar);
  const brands = [...new Set(cars.map((c) => c.brand))];

  const handleEnquire = (car: ReturnType<typeof normaliseCar>) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Hi, I'm interested in the ${car.name} listed for ${formatCurrency(car.price)} on DAOG Tech Hub. Is it still available?`)}`, "_blank");
  };

  return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <CategoryNavigation category="cars" />
      <main className="pt-[calc(36px+56px+16px)] pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="mb-8 mt-4">
            <h1 className="text-4xl lg:text-5xl font-black text-soft-white mb-1">Cars<span className="text-lilac">.</span></h1>
            <p className="text-muted-lavender">Premium used & brand-new vehicles in Lagos and beyond</p>
          </motion.div>

          <div className="mb-6">
            <FilterBar searchValue={carSearch} onSearchChange={setCarSearch} searchPlaceholder="Search cars, brands..."
              filters={[{ value: carBrand, onValueChange: setCarBrand, placeholder: "All Brands", width: "w-[150px]",
                options: [{ value:"all",label:"All Brands"}, ...brands.map((b)=>({value:b.toLowerCase(),label:b}))] }]} />
          </div>

          {loading ? <ProductGridSkeleton count={6} /> : error ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🚗</p>
              <p className="text-soft-white font-semibold text-lg mb-2">No cars available yet</p>
              <p className="text-muted-lavender text-sm max-w-sm mx-auto">Listings will appear here once they are added to the store. Check back soon!</p>
            </div>
          ) : cars.length === 0 ? (
            <EmptyState message="No cars found" onClear={() => { setCarSearch(""); setCarBrand("all"); }} />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, i) => {
                const inWL = isInWishlist(car.id);
                return (
                  <motion.div key={car.id} initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.03 }}
                    onClick={() => router.push(`/cars/${car.id}`)}
                    className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:border-lilac/40 hover:shadow-2xl hover:shadow-lilac/10 transition-all hover:-translate-y-2 cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={car.image} alt={car.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width:640px) 100vw,50vw" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <Badge className={cn("text-xs font-bold", car.condition==="Brand New" ? "bg-green-500 text-white" : "bg-amber-500 text-white")}>{car.condition}</Badge>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); inWL ? removeFromWishlist(car.id) : addToWishlist({id:car.id,name:car.name,price:car.price,image:car.image,category:"car"}); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <Heart className={cn("w-4 h-4", inWL ? "fill-pink-400 text-pink-400" : "text-white")} />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-1"><Fuel className="w-3 h-3 text-blue-300" /><span className="text-white text-xs">{car.fuelType}</span></div>
                        <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-1"><Gauge className="w-3 h-3 text-green-300" /><span className="text-white text-xs">{car.mileage}</span></div>
                        <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-1"><Calendar className="w-3 h-3 text-amber-300" /><span className="text-white text-xs">{car.year}</span></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-muted-lavender text-xs mb-0.5">{car.brand}</p>
                      <h3 className="text-soft-white font-bold text-base mb-1 line-clamp-1">{car.name}</h3>
                      <p className="text-muted-lavender text-xs line-clamp-2 mb-3">{car.description}</p>
                      <p className="text-2xl font-black text-lilac mb-3">{formatCurrency(car.price)}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={(e) => { e.stopPropagation(); handleEnquire(car); }}
                          className="bg-green-600/80 hover:bg-green-600 text-white rounded-xl h-9 text-xs font-bold gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5" /> Enquire
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/cars/${car.id}`); toast.success("Link copied!"); }}
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
