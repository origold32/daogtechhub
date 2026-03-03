"use client";

import { Phone, Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FilterBar } from "@/components/reusables/FilterBar";
import { ResultsCount } from "@/components/reusables/ResultsCount";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { realEstates } from "@/data/sampleData";
import { toast } from "sonner";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { formatCurrency } from "@/lib/formatCurrency";

export default function RealEstatePage() {
  const {
    estateSearch,
    estateLocation,
    estateType,
    estateSize,
    setEstateSearch,
    setEstateLocation,
    setEstateType,
    setEstateSize,
  } = useFilterStore();

  // Filter logic
  const filteredEstates = realEstates.filter((estate) => {
    const matchesSearch =
      estate.name.toLowerCase().includes(estateSearch.toLowerCase()) ||
      estate.location.toLowerCase().includes(estateSearch.toLowerCase());

    const matchesLocation =
      estateLocation === "all" ||
      estate.location.toLowerCase().includes(estateLocation.toLowerCase());

    const matchesType = estateType === "all" || estate.type === estateType;

    const matchesSize =
      estateSize === "all" || estate.size.includes(estateSize);

    return matchesSearch && matchesLocation && matchesType && matchesSize;
  });

  const handleContactAgent = (estate: (typeof realEstates)[0]) => {
    toast.success(`Contact request sent for ${estate.name}!`);
  };

  const locations = [
    ...new Set(realEstates.map((e) => e.location.split(",")[0].trim())),
  ];

  const types = [...new Set(realEstates.map((e) => e.type))];

  return (
    <div className="min-h-screen bg-[#1a0b2e]">
      <CategoryNavigation category="realestate" showSellButton={true} />

      <main className="pt-24 pb-12 px-4 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-lilac mb-2">
            Real Estate
          </h1>
          <p className="text-muted-lavender">
            Verified properties, homes, and land listings
          </p>
        </div>

        {/* ✅ FilterBar */}
        <div className="max-w-7xl mx-auto mb-8">
          <FilterBar
            searchValue={estateSearch}
            onSearchChange={setEstateSearch}
            searchPlaceholder="Search properties..."
            filters={[
              {
                value: estateLocation,
                onValueChange: setEstateLocation,
                placeholder: "All Locations",
                width: "w-[180px]",
                options: [
                  { value: "all", label: "All Locations" },
                  ...locations.map((loc) => ({
                    value: loc.toLowerCase(),
                    label: loc,
                  })),
                ],
              },
              {
                value: estateType,
                onValueChange: setEstateType,
                placeholder: "All Types",
                width: "w-[160px]",
                options: [
                  { value: "all", label: "All Types" },
                  ...types.map((type) => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1),
                  })),
                ],
              },
              {
                value: estateSize,
                onValueChange: setEstateSize,
                placeholder: "Any Size",
                width: "w-[160px]",
                options: [
                  { value: "all", label: "Any Size" },
                  { value: "100", label: "100+ sqm" },
                  { value: "200", label: "200+ sqm" },
                  { value: "500", label: "500+ sqm" },
                  { value: "1000", label: "1000+ sqm" },
                ],
              },
            ]}
          />
        </div>

        {/* ✅ ResultsCount */}
        <div className="max-w-7xl mx-auto mb-6">
          <ResultsCount count={filteredEstates.length} />
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredEstates.length === 0 ? (
            <EmptyState
              message="No properties found matching your criteria"
              onClear={() => {
                setEstateSearch("");
                setEstateLocation("all");
                setEstateType("all");
                setEstateSize("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEstates.map((estate) => (
                <Card
                  key={estate.id}
                  className="bg-glass-purple border-lilac-light overflow-hidden group card-hover"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={estate.image}
                      alt={estate.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-lilac text-[#1a0b2e]">
                      {estate.type.charAt(0).toUpperCase() +
                        estate.type.slice(1)}
                    </Badge>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <Badge
                      variant="outline"
                      className="text-xs border-lilac/50 text-lilac mb-2"
                    >
                      {estate.location}
                    </Badge>

                    <h3 className="text-lg font-semibold text-soft-white mb-1">
                      {estate.name}
                    </h3>

                    <p className="text-sm text-muted-lavender line-clamp-2 mb-3">
                      {estate.description}
                    </p>

                    <p className="text-2xl font-bold text-lilac">
                      {formatCurrency(estate.price)}
                    </p>

                    {/* Details */}
                    <div className="mt-4 flex items-center gap-4">
                      {estate.bedrooms && (
                        <div className="flex items-center gap-1 text-muted-lavender">
                          <Bed className="w-4 h-4" />
                          {estate.bedrooms}
                        </div>
                      )}
                      {estate.bathrooms && (
                        <div className="flex items-center gap-1 text-muted-lavender">
                          <Bath className="w-4 h-4" />
                          {estate.bathrooms}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-muted-lavender">
                        <Maximize className="w-4 h-4" />
                        {estate.size}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {estate.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className="text-xs text-muted-lavender bg-[#1a0b2e]/50 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  {/* Actions */}
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => handleContactAgent(estate)}
                      className="w-full bg-lilac text-[#1a0b2e] hover:bg-lilac/90"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Agent
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
