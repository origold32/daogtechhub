"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShoppingBag, Trash2, Heart, ArrowRight, Package,
  ChevronDown, ChevronUp, Minus, Plus, BookmarkCheck,
  Sparkles, ShoppingCart, Eye, CheckCircle2, GripVertical, Zap,
} from "lucide-react";
import { useCartStore, CartStage } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STAGES: { id: CartStage; label: string; icon: typeof ShoppingBag; desc: string }[] = [
  { id: "browse", label: "Browse", icon: Eye, desc: "Items you're considering" },
  { id: "select", label: "Selected", icon: ShoppingCart, desc: "Ready to buy" },
  { id: "checkout", label: "Checkout", icon: CheckCircle2, desc: "Final confirmation" },
];

export function CartDrawer() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    items, savedForLater, wishlist, isCartOpen, setCartOpen,
    removeItem, updateQuantity, moveToSavedForLater, moveToCart,
    moveWishlistToCart, removeFromWishlist, getTotalItems,
    getTotalPrice, clearCart, lastAddedId, currentStage, setStage,
  } = useCartStore();

  const [showSaved, setShowSaved] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node))
        setCartOpen(false);
    };
    if (isCartOpen) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isCartOpen, setCartOpen]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [setCartOpen]);

  const subtotal = getTotalPrice();
  const delivery = subtotal >= 100000 ? 0 : 5000;
  const total = subtotal + delivery;

  const stageIdx = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300]"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[460px] z-[301] flex flex-col shadow-2xl"
            style={{ background: "linear-gradient(180deg,#1d0e35 0%,#0f0620 100%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-lilac/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={getTotalItems() > 0 ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="relative w-10 h-10 rounded-2xl bg-lilac/20 flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 text-lilac" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-lilac text-deep-purple text-xs font-black rounded-full flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </motion.div>
                <div>
                  <h2 className="text-soft-white font-bold text-base">Your Cart</h2>
                  <p className="text-muted-lavender text-xs">
                    {getTotalItems()} item{getTotalItems() !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={() => { clearCart(); toast.info("Cart cleared"); }}
                    className="text-xs text-muted-lavender hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-soft-white" />
                </button>
              </div>
            </div>

            {/* Stage Selector */}
            <div className="px-5 py-3 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1">
                {STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setStage(stage.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-all",
                        currentStage === stage.id
                          ? "bg-lilac text-deep-purple shadow-lg"
                          : i <= stageIdx
                          ? "text-lilac/70 hover:text-lilac"
                          : "text-muted-lavender/40 cursor-not-allowed"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{stage.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-lavender mt-1.5 text-center">
                {STAGES.find((s) => s.id === currentStage)?.desc}
              </p>
            </div>



            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-lilac/20">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 rounded-3xl bg-lilac/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-lilac/40" />
                  </div>
                  <p className="text-soft-white font-bold text-lg mb-1">Cart is empty</p>
                  <p className="text-muted-lavender text-sm mb-6">Start adding products you love</p>
                  <Button
                    onClick={() => setCartOpen(false)}
                    className="bg-lilac text-deep-purple hover:bg-lilac/90 rounded-2xl font-bold"
                  >
                    Browse Products
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className={cn(
                        "flex gap-3 p-3 rounded-2xl border transition-all",
                        lastAddedId === item.id
                          ? "border-lilac/60 bg-lilac/10 shadow-lg shadow-lilac/10"
                          : "border-white/5 bg-white/3 hover:border-white/10"
                      )}
                    >
                      {/* Drag handle */}
                      <div className="flex items-center text-muted-lavender/30 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" unoptimized />
                        {lastAddedId === item.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-lilac/30 flex items-center justify-center"
                          >
                            <Zap className="w-5 h-5 text-lilac" />
                          </motion.div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-soft-white font-semibold text-sm line-clamp-1">{item.name}</p>
                        {item.size && (
                          <p className="text-muted-lavender text-xs">Size: {item.size}</p>
                        )}
                        <p className="text-lilac font-bold text-sm mt-0.5">{formatCurrency(item.price)}</p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3 h-3 text-muted-lavender" />
                            </button>
                            <span className="text-soft-white font-bold text-sm w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3 h-3 text-muted-lavender" />
                            </button>
                          </div>
                          <span className="text-muted-lavender/50 text-xs">
                            = {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-xl hover:bg-red-500/20 flex items-center justify-center transition-colors group"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-lavender group-hover:text-red-400" />
                        </button>
                        <button
                          onClick={() => { moveToSavedForLater(item.id); toast.info("Saved for later"); }}
                          className="w-7 h-7 rounded-xl hover:bg-blue-500/20 flex items-center justify-center transition-colors group"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5 text-muted-lavender group-hover:text-blue-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Saved for Later */}
              {savedForLater.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowSaved(!showSaved)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-soft-white text-sm font-semibold flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-blue-400" />
                      Saved for Later ({savedForLater.length})
                    </span>
                    {showSaved
                      ? <ChevronUp className="w-4 h-4 text-muted-lavender" />
                      : <ChevronDown className="w-4 h-4 text-muted-lavender" />
                    }
                  </button>
                  <AnimatePresence>
                    {showSaved && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 mt-2">
                          {savedForLater.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/3">
                              <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-lg object-cover" unoptimized />
                              <div className="flex-1 min-w-0">
                                <p className="text-soft-white text-xs font-medium line-clamp-1">{item.name}</p>
                                <p className="text-lilac text-xs">{formatCurrency(item.price)}</p>
                              </div>
                              <button
                                onClick={() => moveToCart(item.id)}
                                className="text-xs px-3 py-1 rounded-lg bg-lilac/20 text-lilac hover:bg-lilac hover:text-deep-purple transition-all font-medium"
                              >
                                Move to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Wishlist */}
              {wishlist.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowWishlist(!showWishlist)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-soft-white text-sm font-semibold flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      Wishlist ({wishlist.length})
                    </span>
                    {showWishlist
                      ? <ChevronUp className="w-4 h-4 text-muted-lavender" />
                      : <ChevronDown className="w-4 h-4 text-muted-lavender" />
                    }
                  </button>
                  <AnimatePresence>
                    {showWishlist && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 mt-2">
                          {wishlist.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/3">
                              <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-lg object-cover" unoptimized />
                              <div className="flex-1 min-w-0">
                                <p className="text-soft-white text-xs font-medium line-clamp-1">{item.name}</p>
                                <p className="text-lilac text-xs">{formatCurrency(item.price)}</p>
                              </div>
                              <button
                                onClick={() => { moveWishlistToCart(item.id); toast.success("Added to cart!"); }}
                                className="text-xs px-3 py-1 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/40 transition-all font-medium"
                              >
                                + Cart
                              </button>
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="w-6 h-6 rounded-lg hover:bg-red-500/20 flex items-center justify-center"
                              >
                                <X className="w-3 h-3 text-muted-lavender" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="flex-shrink-0 px-5 py-4 border-t border-white/10 space-y-3"
                style={{ background: "rgba(13,6,32,0.95)" }}
              >
                {/* Pricing summary */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-lavender">Subtotal</span>
                    <span className="text-soft-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-lavender">Delivery</span>
                    <span className={delivery === 0 ? "text-green-400 font-medium" : "text-soft-white"}>
                      {delivery === 0 ? "FREE" : formatCurrency(delivery)}
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-1" />
                  <div className="flex justify-between font-bold">
                    <span className="text-soft-white text-base">Total</span>
                    <span className="text-lilac text-lg">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setCartOpen(false);
                    if (!isAuthenticated) {
                      router.push("/auth?mode=signin&redirectTo=/checkout");
                    } else {
                      router.push("/checkout");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-lilac to-purple-500 text-deep-purple hover:opacity-90 rounded-2xl h-12 font-black text-base shadow-lg shadow-lilac/20 group"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-center text-xs text-muted-lavender">
                  {delivery === 0
                    ? "✓ Free delivery included"
                    : `Add ${formatCurrency(100000 - subtotal)} more for free delivery`}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
