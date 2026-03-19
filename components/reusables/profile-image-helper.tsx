"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";
import { useFileUpload } from "@/hooks/useFileUpload";
import { createRemoteMutationFetcher } from "@/swr";
import CircularUploadProgress from "@/components/loaders/circular-upload-progress";

const UPDATE_ENDPOINT = "/api/auth/me";
const BUCKET          = "avatars";
const MAX_SIZE_MB     = 5;

interface ProfileImageHelperProps {
  /** Current avatar URL (can be undefined/null for fallback) */
  currentAvatar?: string | null;
  /** User's display name — used for initials fallback */
  displayName?: string;
  /** Called with the new public URL after a successful upload + profile update */
  onAvatarUpdated?: (url: string) => void;
  /** Size of the avatar circle in px (default 80) */
  size?: number;
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function ProfileImageHelper({
  currentAvatar,
  displayName,
  onAvatarUpdated,
  size = 80,
  className = "",
}: ProfileImageHelperProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { uploadFile, isUploading, progress } = useFileUpload();
  const { trigger: updateProfile, isMutating: isUpdatingProfile } =
    useSWRMutation(UPDATE_ENDPOINT, createRemoteMutationFetcher("put"));

  const [preview, setPreview] = useState<string | null>(null);

  const isBusy = isUploading || isUpdatingProfile;

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
        return;
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      try {
        const publicUrl = await uploadFile(file, "profile/");
        if (!publicUrl) {
          toast.error("Upload failed. Please try again.");
          setPreview(null);
          return;
        }

        await updateProfile({ avatarUrl: publicUrl });
        onAvatarUpdated?.(publicUrl);
        toast.success("Profile photo updated.");
      } catch {
        toast.error("Could not update profile photo.");
        setPreview(null);
      } finally {
        URL.revokeObjectURL(objectUrl);
        // Stop any active camera stream
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    },
    [uploadFile, updateProfile, onAvatarUpdated]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const avatarSrc = preview ?? currentAvatar ?? null;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Avatar circle */}
      <div
        className="w-full h-full rounded-full overflow-hidden border-2 border-lilac/30 bg-lilac/10 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={displayName ?? "Profile photo"}
            fill
            className="object-cover rounded-full"
            sizes={`${size}px`}
            unoptimized
          />
        ) : (
          <span
            className="text-lilac font-bold select-none"
            style={{ fontSize: size * 0.32 }}
          >
            {getInitials(displayName)}
          </span>
        )}
      </div>

      {/* Upload progress overlay */}
      {isBusy && (
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
          {isUploading ? (
            <CircularUploadProgress progress={progress} size={size * 0.7} strokeWidth={3} />
          ) : (
            <Loader2 className="text-lilac animate-spin" style={{ width: size * 0.3, height: size * 0.3 }} />
          )}
        </div>
      )}

      {/* Camera button */}
      {!isBusy && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-lilac text-deep-purple shadow-md hover:bg-lilac/90 transition-colors"
          style={{ width: size * 0.32, height: size * 0.32 }}
          aria-label="Change profile photo"
        >
          <Camera style={{ width: size * 0.16, height: size * 0.16 }} />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={isBusy}
      />
    </div>
  );
}