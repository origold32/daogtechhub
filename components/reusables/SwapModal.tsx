// components/reusables/SwapModal.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSwapStore } from "@/store/swapStore";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export function SwapModal() {
  const { isSwapModalOpen, currentGadget, closeSwapModal, submitSwapRequest } =
    useSwapStore();
  const [memory, setMemory] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [faceId, setFaceId] = useState(false);
  const [repairHistory, setRepairHistory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          {/* Memory */}
          <div className="space-y-2">
            <Label htmlFor="memory" className="text-soft-white">
              Storage Capacity (GB) <span className="text-red-400">*</span>
            </Label>
            <Select value={memory} onValueChange={setMemory}>
              <SelectTrigger className="bg-[#1a0b2e] border-lilac-light text-soft-white">
                <SelectValue placeholder="Select storage" />
              </SelectTrigger>
              <SelectContent className="bg-[#2e1a47] border-lilac-light">
                <SelectItem value="64">64 GB</SelectItem>
                <SelectItem value="128">128 GB</SelectItem>
                <SelectItem value="256">256 GB</SelectItem>
                <SelectItem value="512">512 GB</SelectItem>
                <SelectItem value="1024">1 TB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Battery Health */}
          <div className="space-y-2">
            <Label htmlFor="battery" className="text-soft-white">
              Battery Health (%) <span className="text-red-400">*</span>
            </Label>
            <Select value={batteryHealth} onValueChange={setBatteryHealth}>
              <SelectTrigger className="bg-[#1a0b2e] border-lilac-light text-soft-white">
                <SelectValue placeholder="Select battery health" />
              </SelectTrigger>
              <SelectContent className="bg-[#2e1a47] border-lilac-light">
                <SelectItem value="95-100">95-100% (Excellent)</SelectItem>
                <SelectItem value="85-94">85-94% (Good)</SelectItem>
                <SelectItem value="75-84">75-84% (Fair)</SelectItem>
                <SelectItem value="below-75">Below 75% (Poor)</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="space-y-2">
            <Label htmlFor="repair" className="text-soft-white">
              Repair History
            </Label>
            <Textarea
              id="repair"
              placeholder="Any previous repairs? Screen replacement, battery change, etc."
              value={repairHistory}
              onChange={(e) => setRepairHistory(e.target.value)}
              className="bg-[#1a0b2e] border-lilac-light text-soft-white placeholder:text-muted-lavender min-h-[100px]"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-soft-white">Upload Photos (Max 5)</Label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image src={img} alt={`Upload ${index + 1}`} fill className="object-cover rounded-lg" sizes="200px" unoptimized />
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
