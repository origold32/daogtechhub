import { create } from "zustand";

interface FilterState {
  // Gadget filters
  gadgetSearch: string;
  gadgetType: string;
  gadgetBrand: string;
  setGadgetSearch: (search: string) => void;
  setGadgetType: (type: string) => void;
  setGadgetBrand: (brand: string) => void;
  resetGadgetFilters: () => void;

  // Jersey filters
  jerseySearch: string;
  jerseyType: string;
  jerseyCategory: string;
  setJerseySearch: (search: string) => void;
  setJerseyType: (type: string) => void;
  setJerseyCategory: (category: string) => void;
  resetJerseyFilters: () => void;

  // Car filters
  carSearch: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  setCarSearch: (search: string) => void;
  setCarBrand: (brand: string) => void;
  setCarModel: (model: string) => void;
  setCarYear: (year: string) => void;
  resetCarFilters: () => void;

  // Real Estate filters
  estateSearch: string;
  estateLocation: string;
  estateType: string;
  estateSize: string;
  setEstateSearch: (search: string) => void;
  setEstateLocation: (location: string) => void;
  setEstateType: (type: string) => void;
  setEstateSize: (size: string) => void;
  resetEstateFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Gadget filters
  gadgetSearch: "",
  gadgetType: "all",
  gadgetBrand: "all",
  setGadgetSearch: (search) => set({ gadgetSearch: search }),
  setGadgetType: (type) => set({ gadgetType: type }),
  setGadgetBrand: (brand) => set({ gadgetBrand: brand }),
  resetGadgetFilters: () =>
    set({ gadgetSearch: "", gadgetType: "all", gadgetBrand: "all" }),

  // Jersey filters
  jerseySearch: "",
  jerseyType: "all",
  jerseyCategory: "all",
  setJerseySearch: (search) => set({ jerseySearch: search }),
  setJerseyType: (type) => set({ jerseyType: type }),
  setJerseyCategory: (category) => set({ jerseyCategory: category }),
  resetJerseyFilters: () =>
    set({ jerseySearch: "", jerseyType: "all", jerseyCategory: "all" }),

  // Car filters
  carSearch: "",
  carBrand: "all",
  carModel: "all",
  carYear: "all",
  setCarSearch: (search) => set({ carSearch: search }),
  setCarBrand: (brand) => set({ carBrand: brand }),
  setCarModel: (model) => set({ carModel: model }),
  setCarYear: (year) => set({ carYear: year }),
  resetCarFilters: () =>
    set({ carSearch: "", carBrand: "all", carModel: "all", carYear: "all" }),

  // Real Estate filters
  estateSearch: "",
  estateLocation: "all",
  estateType: "all",
  estateSize: "all",
  setEstateSearch: (search) => set({ estateSearch: search }),
  setEstateLocation: (location) => set({ estateLocation: location }),
  setEstateType: (type) => set({ estateType: type }),
  setEstateSize: (size) => set({ estateSize: size }),
  resetEstateFilters: () =>
    set({
      estateSearch: "",
      estateLocation: "all",
      estateType: "all",
      estateSize: "all",
    }),
}));
