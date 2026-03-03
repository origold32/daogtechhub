// app/cars/page.tsx — refactored example using reusable components

"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FilterBar } from "@/components/reusables/FilterBar";
import { ResultsCount } from "@/components/reusables/ResultsCount";
import { EmptyState } from "@/components/reusables/EmptyState";
import { useFilterStore } from "@/store/filterStore";
import { cars } from "@/data/sampleData";
import { toast } from "sonner";
import { CategoryNavigation } from "@/components/layouts/CategoryNavigation";
import { formatCurrency } from "@/lib/formatCurrency";

export default function CarsPage() {
  const {
    carSearch,
    carBrand,
    carModel,
    carYear,
    setCarSearch,
    setCarBrand,
    setCarModel,
    setCarYear,
  } = useFilterStore();

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.name.toLowerCase().includes(carSearch.toLowerCase()) ||
      car.brand.toLowerCase().includes(carSearch.toLowerCase()) ||
      car.model.toLowerCase().includes(carSearch.toLowerCase());
    const matchesBrand =
      carBrand === "all" || car.brand.toLowerCase() === carBrand.toLowerCase();
    const matchesModel =
      carModel === "all" || car.model.toLowerCase() === carModel.toLowerCase();
    const matchesYear = carYear === "all" || car.year.toString() === carYear;
    return matchesSearch && matchesBrand && matchesModel && matchesYear;
  });

  const brands = [...new Set(cars.map((c) => c.brand))];
  const models = [...new Set(cars.map((c) => c.model))];
  const years = [...new Set(cars.map((c) => c.year.toString()))].sort(
    (a, b) => parseInt(b) - parseInt(a),
  );

  const handleContactSeller = (car: (typeof cars)[0]) => {
    toast.success(`Contact request sent for ${car.name}!`);
  };

  return (
    <div className="min-h-screen bg-[#1a0b2e]">
      <CategoryNavigation category="cars" showSellButton={false} />

      <main className="pt-24 pb-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-lilac mb-2">
            Cars
          </h1>
          <p className="text-muted-lavender">
            Quality vehicles with verified history and clear paperwork
          </p>
        </div>

        {/* ✅ FilterBar replaces all search + filter + mobile toggle boilerplate */}
        <div className="max-w-7xl mx-auto mb-8">
          <FilterBar
            searchValue={carSearch}
            onSearchChange={setCarSearch}
            searchPlaceholder="Search cars..."
            filters={[
              {
                value: carBrand,
                onValueChange: setCarBrand,
                placeholder: "All Brands",
                width: "w-[160px]",
                options: [
                  { value: "all", label: "All Brands" },
                  ...brands.map((b) => ({ value: b.toLowerCase(), label: b })),
                ],
              },
              {
                value: carModel,
                onValueChange: setCarModel,
                placeholder: "All Models",
                width: "w-[160px]",
                options: [
                  { value: "all", label: "All Models" },
                  ...models.map((m) => ({ value: m.toLowerCase(), label: m })),
                ],
              },
              {
                value: carYear,
                onValueChange: setCarYear,
                placeholder: "All Years",
                width: "w-[140px]",
                options: [
                  { value: "all", label: "All Years" },
                  ...years.map((y) => ({ value: y, label: y })),
                ],
              },
            ]}
          />
        </div>

        {/* ✅ ResultsCount replaces the inline count paragraph */}
        <div className="max-w-7xl mx-auto mb-6">
          <ResultsCount count={filteredCars.length} />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* ✅ EmptyState replaces the empty result block */}
          {filteredCars.length === 0 ? (
            <EmptyState
              message="No cars found matching your criteria"
              onClear={() => {
                setCarSearch("");
                setCarBrand("all");
                setCarModel("all");
                setCarYear("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <Card
                  key={car.id}
                  className="bg-glass-purple border-lilac-light overflow-hidden group card-hover"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 left-3 bg-lilac text-[#1a0b2e]">
                      {car.year}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 bg-[#1a0b2e]/80 text-soft-white"
                    >
                      {car.condition}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-lilac/50 text-lilac"
                      >
                        {car.brand}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-lilac/50 text-muted-lavender"
                      >
                        {car.model}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-soft-white mb-1">
                      {car.name}
                    </h3>
                    <p className="text-sm text-muted-lavender line-clamp-2 mb-3">
                      {car.description}
                    </p>
                    <p className="text-2xl font-bold text-lilac">
                      {formatCurrency(car.price)}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: "Mileage", value: car.mileage },
                        { label: "Fuel", value: car.fuelType },
                        { label: "Trans", value: car.transmission },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="text-center p-2 bg-[#1a0b2e]/50 rounded"
                        >
                          <p className="text-xs text-muted-lavender">
                            {item.label}
                          </p>
                          <p className="text-sm text-soft-white font-medium">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => handleContactSeller(car)}
                      className="w-full bg-lilac text-[#1a0b2e] hover:bg-lilac/90"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Seller
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
