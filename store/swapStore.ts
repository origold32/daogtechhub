import { create } from "zustand";

export interface SwapDetails {
  gadgetId: string;
  gadgetName: string;
  memory: string;
  batteryHealth: string;
  faceId: boolean;
  repairHistory: string;
  images: string[];
  video?: string;
}

interface SwapState {
  isSwapModalOpen: boolean;
  currentGadget: { id: string; name: string } | null;
  swapDetails: SwapDetails | null;
  openSwapModal: (gadgetId: string, gadgetName: string) => void;
  closeSwapModal: () => void;
  submitSwapRequest: (details: Omit<SwapDetails, "gadgetId" | "gadgetName">) => void;
}

export const useSwapStore = create<SwapState>((set) => ({
  isSwapModalOpen: false,
  currentGadget: null,
  swapDetails: null,
  openSwapModal: (gadgetId, gadgetName) =>
    set({ isSwapModalOpen: true, currentGadget: { id: gadgetId, name: gadgetName } }),
  closeSwapModal: () =>
    set({ isSwapModalOpen: false, currentGadget: null }),
  submitSwapRequest: (details) =>
    set((state) => ({
      swapDetails: state.currentGadget
        ? { ...details, gadgetId: state.currentGadget.id, gadgetName: state.currentGadget.name }
        : null,
      isSwapModalOpen: false,
      currentGadget: null,
    })),
}));
