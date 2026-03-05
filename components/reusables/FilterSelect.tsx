// components/reusables/FilterSelect.tsx

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  width?: string;
  fullWidth?: boolean;
}

export function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  width = "w-[180px]",
  fullWidth = false,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`${fullWidth ? "w-full" : width} bg-[#2e1a47] border-lilac-light text-soft-white`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="bg-[#2e1a47] border-lilac-light text-soft-white z-[200]"
        position="popper"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="focus:bg-lilac/20 focus:text-soft-white"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
