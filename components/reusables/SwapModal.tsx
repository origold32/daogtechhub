// components/reusables/SwapModal.tsx

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSwapStore } from "@/store/swapStore";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { FilterSelect } from "./FilterSelect";
import TextAreaV1 from "./text-area-v1";
import InputV1 from "./input-v1";

export function SwapModal() {
  const {
    isSwapModalOpen,
    currentGadget,
    customerPhoneName,
    setCustomerPhoneName,
    closeSwapModal,
    submitSwapRequest,
  } = useSwapStore();
  const [memory, setMemory] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [faceId, setFaceId] = useState(false);
  const [repairHistory, setRepairHistory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memoryOptions = [
    { value: "64", label: "64 GB" },
    { value: "128", label: "128 GB" },
    { value: "256", label: "256 GB" },
    { value: "512", label: "512 GB" },
    { value: "1024", label: "1 TB" },
    { value: "2048", label: "2 TB" },
  ];

  const batteryOptions = [
    { value: "90-100", label: "90-100% (Excellent)" },
    { value: "80-89", label: "80-89% (Good)" },
    { value: "75-79", label: "75-79% (Service)" },
    { value: "below-75", label: "Below 75% (Damaged)" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!memory || !batteryHealth) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    submitSwapRequest({
      customerPhoneName,
      memory,
      batteryHealth,
      faceId,
      repairHistory,
      images,
    });

    toast.success("Swap request submitted successfully!");
    setIsSubmitting(false);
    setMemory("");
    setBatteryHealth("");
    setFaceId(false);
    setRepairHistory("");
    setImages([]);
  };

  return (
    <Dialog open={isSwapModalOpen} onOpenChange={closeSwapModal}>
      <DialogContent className="bg-[#2e1a47] border-lilac-light text-soft-white max-w-lg max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader>
          <DialogTitle className="text-lilac text-xl">
            Swap Your Phone
          </DialogTitle>
          <DialogDescription className="text-muted-lavender">
            {currentGadget
              ? `Request to swap for: ${currentGadget.name}`
              : "Enter your phone details for valuation"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <InputV1
            label="Your Phone Model"
            value={customerPhoneName}
            onChange={(e) => setCustomerPhoneName(e.target.value)}
            placeholder="e.g. iPhone 13, Samsung S22..."
          />
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Memory */}
            <FilterSelect
              value={memory}
              onValueChange={setMemory}
              placeholder="Select storage"
              fullWidth
              options={memoryOptions}
            />

            {/* Battery Health */}
            <FilterSelect
              value={batteryHealth}
              onValueChange={setBatteryHealth}
              placeholder="Select battery health"
              fullWidth
              options={batteryOptions}
            />
          </div>

          {/* Face ID */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="faceId"
              checked={faceId}
              onCheckedChange={(checked) => setFaceId(checked as boolean)}
              className="border-lilac/50 data-[state=checked]:bg-lilac data-[state=checked]:text-[#1a0b2e]"
            />
            <Label htmlFor="faceId" className="text-soft-white cursor-pointer">
              Face ID / Touch ID Working
            </Label>
          </div>

          {/* Repair History */}

          <TextAreaV1
            label="Repair History"
            id="repair"
            placeholder="Any previous repairs? Screen replacement, battery change, etc."
            value={repairHistory}
            onChange={(e) => setRepairHistory(e.target.value)}
            className="bg-[#1a0b2e] border-lilac-light text-soft-white placeholder:text-muted-lavender min-h-[100px]"
          />

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-soft-white">Upload Photos (Max 5)</Label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-lilac-light rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-lilac/60 transition-colors">
                  <Upload className="w-6 h-6 text-lilac mb-1" />
                  <span className="text-xs text-muted-lavender">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={closeSwapModal}
            className="flex-1 border-lilac-light text-soft-white hover:bg-lilac/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-lilac text-[#1a0b2e] hover:bg-lilac/90"
          >
            {isSubmitting ? "Submitting..." : "Submit Swap Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
