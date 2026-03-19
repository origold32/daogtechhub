import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductCategory = "gadget" | "jersey" | "car" | "realestate";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: ProductCategory;
  quantity: number;
  size?: string;
  color?: string;
  addedAt: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: ProductCategory;
  addedAt: number;
}

export interface SavedItem extends CartItem {
  savedAt: number;
}

export type CartStage = "browse" | "select" | "checkout";

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  savedForLater: SavedItem[];
  lastAddedId: string | null;
  isCartOpen: boolean;
  currentStage: CartStage;

  addItem: (item: Omit<CartItem, "quantity" | "addedAt">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  moveToSavedForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  setCartOpen: (open: boolean) => void;
  setStage: (stage: CartStage) => void;
  addToWishlist: (item: Omit<WishlistItem, "addedAt">) => void;
  removeFromWishlist: (id: string) => void;
  moveWishlistToCart: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (id: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      savedForLater: [],
      lastAddedId: null,
      isCartOpen: false,
      currentStage: "browse",

      setCartOpen: (open) => set({ isCartOpen: open }),

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            lastAddedId: item.id,
            isCartOpen: true,
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          const newItem = { ...item, quantity: 1, addedAt: Date.now() };
          set({
            lastAddedId: item.id,
            isCartOpen: true,
            items: [...get().items, newItem],
          });
        }
        setTimeout(() => set({ lastAddedId: null }), 1500);
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) get().removeItem(id);
        else
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          });
      },

      clearCart: () => set({ items: [], currentStage: "browse" }),

      moveToSavedForLater: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        set({
          items: get().items.filter((i) => i.id !== id),
          savedForLater: [
            ...get().savedForLater,
            { ...item, savedAt: Date.now() },
          ],
        });
      },

      moveToCart: (id) => {
        const item = get().savedForLater.find((i) => i.id === id);
        if (!item) return;
        set({
          savedForLater: get().savedForLater.filter((i) => i.id !== id),
          items: [...get().items, item],
        });
      },

      setStage: (stage) => set({ currentStage: stage }),

      addToWishlist: (item) => {
        if (get().wishlist.find((i) => i.id === item.id)) return;
        set({
          wishlist: [...get().wishlist, { ...item, addedAt: Date.now() }],
        });
      },

      removeFromWishlist: (id) =>
        set({ wishlist: get().wishlist.filter((i) => i.id !== id) }),

      moveWishlistToCart: (id) => {
        const item = get().wishlist.find((i) => i.id === id);
        if (!item) return;
        get().addItem(item);
        get().removeFromWishlist(id);
      },

      isInWishlist: (id) => !!get().wishlist.find((i) => i.id === id),

      getTotalItems: () =>
        get().items.reduce((s, i) => s + i.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      getItemCount: (id) =>
        get().items.find((i) => i.id === id)?.quantity ?? 0,
    }),
    { name: "daog-cart-v3" }
  )
);
