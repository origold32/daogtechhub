"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import AuthGuard from "@/components/providers/AuthGuard";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function WishlistPageInner() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, moveWishlistToCart } = useCartStore();

  return (
    <div className="min-h-screen pb-16" style={{ background: "#1a0b2e" }}>
      <div className="border-b border-white/10 px-4 py-4 flex items-center gap-4" style={{ background: "rgba(26,11,46,0.95)" }}>
        <button onClick={() => router.back()} className="text-muted-lavender hover:text-lilac transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-soft-white font-bold flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" /> Wishlist ({wishlist.length})
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-lilac/20 mx-auto mb-4" />
            <p className="text-soft-white font-semibold mb-2">Your wishlist is empty</p>
            <p className="text-muted-lavender text-sm mb-6">Save items you love for later</p>
            <Button onClick={() => router.push("/")} className="bg-lilac text-deep-purple hover:bg-lilac/90 rounded-2xl">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {wishlist.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-lilac/30 transition-colors">
                  <div className="relative aspect-square overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw,33vw" unoptimized />
                    <button onClick={() => { removeFromWishlist(item.id); toast.info("Removed from wishlist"); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-pink-400 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-soft-white font-semibold text-sm line-clamp-1 mb-1">{item.name}</p>
                    <p className="text-lilac font-black text-lg mb-3">{formatCurrency(item.price)}</p>
                    <Button onClick={() => { moveWishlistToCart(item.id); toast.success("Moved to cart!"); }}
                      className="w-full bg-lilac text-deep-purple hover:bg-lilac/90 rounded-xl h-9 text-sm">
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <AuthGuard>
      <WishlistPageInner />
    </AuthGuard>
  );
}
