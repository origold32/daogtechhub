"use client";

import { ShoppingCart, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FilterBar } from "@/components/reusables/FilterBar";
import { ResultsCount } from "@/components/reusables/ResultsCount";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { useCartStore } from "@/store/cartStore";
import { useSwapStore } from "@/store/swapStore";
import { gadgets } from "@/data/sampleData";
import { toast } from "sonner";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { SwapModal } from "@/components/reusables/SwapModal";
import { formatCurrency } from "@/lib/formatCurrency";

export default function GadgetsPage() {
  const {
    gadgetSearch,
    gadgetType,
    gadgetBrand,
    setGadgetSearch,
    setGadgetType,
    setGadgetBrand,
  } = useFilterStore();

  const { addItem } = useCartStore();
  const { openSwapModal } = useSwapStore();

  // Filter gadgets
  const filteredGadgets = gadgets.filter((gadget) => {
    const matchesSearch =
      gadget.name.toLowerCase().includes(gadgetSearch.toLowerCase()) ||
      gadget.brand.toLowerCase().includes(gadgetSearch.toLowerCase()) ||
      gadget.description.toLowerCase().includes(gadgetSearch.toLowerCase());

    const matchesType = gadgetType === "all" || gadget.type === gadgetType;

    const matchesBrand =
      gadgetBrand === "all" ||
      gadget.brand.toLowerCase() === gadgetBrand.toLowerCase();

    return matchesSearch && matchesType && matchesBrand;
  });

  const brands = [...new Set(gadgets.map((g) => g.brand))];

  const handleAddToCart = (gadget: (typeof gadgets)[0]) => {
    addItem({
      id: gadget.id,
      name: gadget.name,
      price: gadget.price,
      image: gadget.image,
      category: "gadget",
    });
    toast.success(`${gadget.name} added to cart!`);
  };

  const handleSwap = (gadget: (typeof gadgets)[0]) => {
    if (gadget.type === "phone") {
      openSwapModal(gadget.id, gadget.name);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0b2e]">
      <CategoryNavigation category="gadgets" showSellButton={true} />
      <SwapModal />

      <main className="pt-24 pb-12 px-4 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-lilac mb-2">
            Gadgets
          </h1>
          <p className="text-muted-lavender">
            Discover the latest phones, laptops, gaming consoles, and
            accessories
          </p>
        </div>

        {/* ✅ FilterBar */}
        <div className="max-w-7xl mx-auto mb-8">
          <FilterBar
            searchValue={gadgetSearch}
            onSearchChange={setGadgetSearch}
            searchPlaceholder="Search gadgets..."
            filters={[
              {
                value: gadgetType,
                onValueChange: setGadgetType,
                placeholder: "All Types",
                width: "w-[160px]",
                options: [
                  { value: "all", label: "All Types" },
                  { value: "phone", label: "Phones" },
                  { value: "laptop", label: "Laptops" },
                  { value: "game", label: "Gaming" },
                  { value: "tablet", label: "Tablets" },
                  { value: "accessory", label: "Accessories" },
                ],
              },
              {
                value: gadgetBrand,
                onValueChange: setGadgetBrand,
                placeholder: "All Brands",
                width: "w-[160px]",
                options: [
                  { value: "all", label: "All Brands" },
                  ...brands.map((b) => ({
                    value: b.toLowerCase(),
                    label: b,
                  })),
                ],
              },
            ]}
          />
        </div>

        {/* ✅ ResultsCount */}
        <div className="max-w-7xl mx-auto mb-6">
          <ResultsCount count={filteredGadgets.length} />
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredGadgets.length === 0 ? (
            <EmptyState
              message="No gadgets found matching your criteria"
              onClear={() => {
                setGadgetSearch("");
                setGadgetType("all");
                setGadgetBrand("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGadgets.map((gadget) => (
                <Card
                  key={gadget.id}
                  className="bg-glass-purple border-lilac-light overflow-hidden group card-hover"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={gadget.image}
                      alt={gadget.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-lilac text-[#1a0b2e]">
                      {gadget.condition}
                    </Badge>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-lilac/50 text-lilac"
                      >
                        {gadget.brand}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-lilac/50 text-muted-lavender"
                      >
                        {gadget.type}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-soft-white mb-1 line-clamp-1">
                      {gadget.name}
                    </h3>

                    <p className="text-sm text-muted-lavender line-clamp-2 mb-3">
                      {gadget.description}
                    </p>

                    <p className="text-xl font-bold text-lilac">
                      {formatCurrency(gadget.price)}
                    </p>
                  </CardContent>

                  {/* Actions */}
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(gadget)}
                      className="flex-1 bg-lilac text-[#1a0b2e] hover:bg-lilac/90"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy
                    </Button>

                    {gadget.type === "phone" && (
                      <Button
                        onClick={() => handleSwap(gadget)}
                        variant="outline"
                        className="flex-1 border-lilac/50 text-lilac hover:bg-lilac/20"
                      >
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Swap
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
