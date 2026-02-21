"use client";

import React from "react";
import { PiCamera } from "react-icons/pi";
import { cn } from "@/lib/utils";
import ProfileImageHelper from "./profile-image-helper";
import { useProfileImageUploader } from "@/hooks/UseProfileImageUploader";

interface ProfileImageSelectorProps {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
  currentImageUrl?: string;
  updateEndpoint?: string;
  className?: string;
  iconSize?: number;
  iconColor?: string;
  children?: React.ReactNode;
}

export default function ProfileImageSelector({
  onSuccess,
  onError,
  currentImageUrl,
  updateEndpoint = "/user/update-profile",
  className = "",
  iconSize = 30,
  iconColor = "red",
  children,
}: ProfileImageSelectorProps) {
  const { isOpen, openUploader, closeUploader, handleSuccess, handleError } =
    useProfileImageUploader({
      onSuccess,
      onError,
    });

  return (
    <>
      <button
        onClick={openUploader}
        title="Change Profile Image"
        className={cn(
          "cursor-pointer bg-white p-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm border",
          className
        )}
      >
        {children || <PiCamera size={iconSize} color={iconColor} />}
      </button>

      <ProfileImageHelper
        isOpen={isOpen}
        onClose={closeUploader}
        onSuccess={handleSuccess}
        currentImageUrl={currentImageUrl}
        updateEndpoint={updateEndpoint}
      />
    </>
  );
}
