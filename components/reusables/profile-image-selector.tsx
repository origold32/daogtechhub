"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileImageHelper from "@/components/reusables/profile-image-helper";

interface ProfileImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (imageUrl: string) => void;
  currentImageUrl?: string;
  updateEndpoint?: string;
}

export default function ProfileImageSelector({
  isOpen,
  onClose,
  onSuccess,
  currentImageUrl,
  updateEndpoint,
}: ProfileImageSelectorProps) {
  const handleSuccess = useCallback(
    (url: string) => {
      onSuccess(url);
      onClose();
    },
    [onSuccess, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="profile-image-selector-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            key="profile-image-selector-panel"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a0b2e]/95 backdrop-blur p-8 shadow-2xl flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-muted-lavender hover:text-lilac hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title */}
            <div className="text-center">
              <h3 className="text-soft-white font-semibold text-base">
                Update Profile Photo
              </h3>
              <p className="text-muted-lavender text-xs mt-1">
                Click the avatar to choose a new image
              </p>
            </div>

            {/* Avatar editor */}
            <ProfileImageHelper
              isOpen={isOpen}
              onClose={onClose}
              onSuccess={handleSuccess}
              currentImageUrl={currentImageUrl}
              updateEndpoint={updateEndpoint}
              size={112}
            />

            {/* Cancel */}
            <button
              onClick={onClose}
              className="text-xs text-muted-lavender hover:text-lilac transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}