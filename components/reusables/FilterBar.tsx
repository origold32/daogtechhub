// components/reusables/FilterBar.tsx

"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterOption, FilterSelect } from "./FilterSelect";
import { SearchBar } from "./SearchBar";

export interface FilterConfig {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  /** Desktop width class e.g. "w-[160px]". Defaults to "w-[180px]" */
  width?: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: FilterConfig[];
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div>
      {/* Top row: search + mobile toggle + desktop filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />

        {/* Mobile toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden border-lilac-light text-lilac"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>

        {/* Desktop filters */}
        <div className="hidden lg:flex gap-4">
          {filters.map((filter, i) => (
            <FilterSelect key={i} {...filter} />
          ))}
        </div>
      </div>

      {/* Mobile filters */}
      {showFilters && (
        <div className="lg:hidden mt-4 flex flex-col gap-4">
          {filters.map((filter, i) => (
            <FilterSelect key={i} {...filter} fullWidth />
          ))}
        </div>
      )}
    </div>
  );
}
