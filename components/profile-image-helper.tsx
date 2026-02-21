"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, CloudUpload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";
import OverlayManager from "@/components/overlay-manager";
import CircularUploadProgress from "@/components/loaders/circular-upload-progress";
import useSWRMutation from "swr/mutation";
import { createRemoteMutationFetcher } from "@/swr";
import Image from "next/image";

interface ProfileImageHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (imageUrl: string) => void;
  currentImageUrl?: string;
  updateEndpoint?: string;
  className?: string;
}

export default function ProfileImageHelper({
  isOpen,
  onClose,
  onSuccess,
  currentImageUrl,
  updateEndpoint = "",
  className = "",
}: ProfileImageHelperProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<"camera" | "upload" | null>(
    null
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { uploadFile, isUploading, progress } = useFileUpload();
  const { trigger: updateProfile, isMutating: isUpdatingProfile } =
    useSWRMutation(updateEndpoint, createRemoteMutationFetcher("put"));

  const isProcessing = isUploading || isUpdatingProfile;

  // File upload handler
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPreview(true);
      setCaptureMode("upload");
    },
    []
  );

  useEffect(() => {
    if (captureMode === "camera" && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;

      const handleLoadedMetadata = () => {
        video.play().catch(console.error);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [captureMode]);

  // Updated startCamera function with better error handling and video setup
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      setCaptureMode("camera");
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaptureMode(null);
    setUploadedImageUrl(null);
    setShowPreview(false);
    stopCamera();
    onClose();
  }, [onClose, stopCamera]);
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "camera-photo.jpg", {
            type: "image/jpeg",
          });
          setSelectedFile(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          setShowPreview(true);
          stopCamera();
        }
      },
      "image/jpeg",
      0.8
    );
  }, [stopCamera]);

  // Upload the selected image to storage
  const handleUploadImage = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await uploadFile(formData);

      if (response?.data?.url) {
        setUploadedImageUrl(response.data.url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch {
      toast.error("Failed to upload image");
    }
  }, [selectedFile, uploadFile]);

  // Submit the uploaded image URL to update profile
  const handleSubmitProfile = useCallback(async () => {
    if (!uploadedImageUrl) return;

    try {
      await updateProfile({ photo: uploadedImageUrl });
      toast.success("Profile image updated successfully!");
      onSuccess?.(uploadedImageUrl);
      handleClose();
    } catch {
      toast.error("Failed to update profile image");
    }
  }, [uploadedImageUrl, updateProfile, onSuccess, handleClose]);

  // Reset to selection mode
  const handleRetake = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedImageUrl(null);
    setShowPreview(false);
    setCaptureMode(null);
  }, []);

  return (
    <>
      <input
        title="Select Profile Image"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <OverlayManager
        isOpen={isOpen}
        onClose={handleClose}
        title="Update Profile Image"
        caption="Take a photo or upload an image"
        overlayClassName="max-w-lg space-y-2"
        titleClassName="text-center"
        captionClassName="text-center"
        contentClassName="space-y-4 my-6"
      >
        {/* Selection Mode */}
        {!captureMode && !showPreview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={startCamera}
                className="bg-gradient-to-r from-[#1B75BC] to-[#29ABE2] flex items-center gap-3 w-full"
                disabled={isProcessing}
              >
                <Camera size={24} />
                <span>Take Photo</span>
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-[#1B75BC] to-[#29ABE2] flex items-center gap-3 w-full"
                disabled={isProcessing}
              >
                <CloudUpload size={24} />
                <span>Upload Photo</span>
              </Button>
            </div>
          </div>
        )}

        {/* Camera Mode */}
        {captureMode === "camera" && !showPreview && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg bg-gray-100"
                autoPlay
                playsInline
                muted
                controls={false}
                style={{ transform: "scaleX(-1)" }} // Mirror the video for selfie view
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="mr-2" size={16} />
                Capture Photo
              </Button>
              <Button onClick={handleRetake} variant="destructive">
                <X className="mr-2" size={16} />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {showPreview && previewUrl && (
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
                width={256}
                height={256}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="flex flex-col items-center space-y-2">
                <CircularUploadProgress progress={progress} />
                <p className="text-sm text-gray-600">
                  Uploading image... {progress}%
                </p>
              </div>
            )}

            {/* Profile Update Progress */}
            {isUpdatingProfile && (
              <div className="flex flex-col items-center space-y-2">
                <CircularUploadProgress progress={100} />
                <p className="text-sm text-gray-600">Updating profile...</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!uploadedImageUrl && !isProcessing && (
                <>
                  <Button onClick={handleUploadImage} className="flex-1">
                    <CloudUpload className="mr-2" size={16} />
                    Upload Image
                  </Button>
                  <Button onClick={handleRetake} variant="destructive">
                    <X className="mr-2" size={16} />
                    Retake
                  </Button>
                </>
              )}

              {uploadedImageUrl && !isUpdatingProfile && (
                <Button onClick={handleSubmitProfile} className="flex-1">
                  <Check className="mr-2" size={16} />
                  Update Profile
                </Button>
              )}
            </div>
          </div>
        )}
      </OverlayManager>
    </>
  );
}
