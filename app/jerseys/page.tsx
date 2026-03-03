"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FilterBar } from "@/components/reusables/FilterBar";
import { ResultsCount } from "@/components/reusables/ResultsCount";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { useCartStore } from "@/store/cartStore";
import { jerseys } from "@/data/sampleData";
import { toast } from "sonner";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { formatCurrency } from "@/lib/formatCurrency";

export default function JerseysPage() {
  const {
    jerseySearch,
    jerseyType,
    jerseyCategory,
    setJerseySearch,
    setJerseyType,
    setJerseyCategory,
  } = useFilterStore();

  const { addItem } = useCartStore();

  // Filter jerseys
  const filteredJerseys = jerseys.filter((jersey) => {
    const matchesSearch =
      jersey.name.toLowerCase().includes(jerseySearch.toLowerCase()) ||
      jersey.team.toLowerCase().includes(jerseySearch.toLowerCase());

    const matchesType = jerseyType === "all" || jersey.type === jerseyType;

    const matchesCategory =
      jerseyCategory === "all" || jersey.category === jerseyCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleAddToCart = (jersey: (typeof jerseys)[0]) => {
    addItem({
      id: jersey.id,
      name: jersey.name,
      price: jersey.price,
      image: jersey.image,
      category: "jersey",
    });
    toast.success(`${jersey.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-[#1a0b2e]">
      <CategoryNavigation category="jerseys" showSellButton={false} />

      <main className="pt-24 pb-12 px-4 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-lilac mb-2">
            Jerseys
          </h1>
          <p className="text-muted-lavender">
            Authentic club kits, national team jerseys, and collectibles
          </p>
        </div>

        {/* ✅ FilterBar */}
        <div className="max-w-7xl mx-auto mb-8">
          <FilterBar
            searchValue={jerseySearch}
            onSearchChange={setJerseySearch}
            searchPlaceholder="Search jerseys..."
            filters={[
              {
                value: jerseyType,
                onValueChange: setJerseyType,
                placeholder: "All Types",
                width: "w-[160px]",
                options: [
                  { value: "all", label: "All Types" },
                  { value: "club", label: "Club" },
                  { value: "country", label: "Country" },
                  { value: "nfl", label: "NFL" },
                  { value: "basketball", label: "Basketball" },
                ],
              },
              {
                value: jerseyCategory,
                onValueChange: setJerseyCategory,
                placeholder: "All Categories",
                width: "w-[180px]",
                options: [
                  { value: "all", label: "All Categories" },
                  { value: "current", label: "Current Season" },
                  { value: "retro", label: "Retro/Vintage" },
                  { value: "special", label: "Special Edition" },
                ],
              },
            ]}
          />
        </div>

        {/* ✅ ResultsCount */}
        <div className="max-w-7xl mx-auto mb-6">
          <ResultsCount count={filteredJerseys.length} />
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredJerseys.length === 0 ? (
            <EmptyState
              message="No jerseys found matching your criteria"
              onClear={() => {
                setJerseySearch("");
                setJerseyType("all");
                setJerseyCategory("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredJerseys.map((jersey) => (
                <Card
                  key={jersey.id}
                  className="bg-glass-purple border-lilac-light overflow-hidden group card-hover"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={jersey.image}
                      alt={jersey.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-lilac text-[#1a0b2e]">
                      {jersey.season}
                    </Badge>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-lilac/50 text-lilac"
                      >
                        {jersey.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-lilac/50 text-muted-lavender"
                      >
                        {jersey.category}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-soft-white mb-1 line-clamp-1">
                      {jersey.name}
                    </h3>

                    <p className="text-sm text-muted-lavender line-clamp-2 mb-3">
                      {jersey.description}
                    </p>

                    <p className="text-xl font-bold text-lilac">
                      {formatCurrency(jersey.price)}
                    </p>

                    {/* Sizes */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {jersey.size.map((s) => (
                        <span
                          key={s}
                          className="text-xs text-muted-lavender bg-[#1a0b2e]/50 px-2 py-1 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  {/* Actions */}
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => handleAddToCart(jersey)}
                      className="w-full bg-lilac text-[#1a0b2e] hover:bg-lilac/90"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
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
