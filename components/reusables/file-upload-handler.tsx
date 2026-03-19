"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";
import CircularUploadProgress from "@/components/loaders/circular-upload-progress";
import LinearUploadProgress from "@/components/loaders/linear-upload-progress";

export type FileType = "image" | "video" | "document";

interface FileUploadHandlerProps {
  /** Which kind of file to accept */
  fileType?: FileType;
  /** Supabase storage bucket name */
  bucket: string;
  /** Called with the public URL after a successful upload */
  onUploadComplete: (url: string) => void;
  /** Optional extra class names for the outer wrapper */
  className?: string;
  /** Progress indicator style */
  progressVariant?: "circular" | "linear";
  /** Label shown inside the drop zone */
  label?: string;
  /** Max file size in MB (default: 10) */
  maxSizeMB?: number;
  /** Whether the control is disabled */
  disabled?: boolean;
}

const ACCEPT_MAP: Record<FileType, string> = {
  image:    "image/*",
  video:    "video/*",
  document: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
};

const ICON_MAP: Record<FileType, React.ElementType> = {
  image:    ImageIcon,
  video:    Video,
  document: FileText,
};

export default function FileUploadHandler({
  fileType = "image",
  bucket,
  onUploadComplete,
  className = "",
  progressVariant = "linear",
  label,
  maxSizeMB = 10,
  disabled = false,
}: FileUploadHandlerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { upload, progress, uploading, reset } = useFileUpload(bucket);

  const TypeIcon = ICON_MAP[fileType];

  const handleFile = async (file: File) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxSizeMB} MB.`);
      return;
    }

    try {
      const url = await upload(file);
      if (url) {
        onUploadComplete(url);
        toast.success("File uploaded successfully.");
      }
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop zone */}
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled && !uploading) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 transition-colors cursor-pointer select-none",
          dragging
            ? "border-lilac bg-lilac/10"
            : "border-white/15 bg-white/5 hover:border-lilac/50 hover:bg-white/8",
          disabled || uploading ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {uploading ? (
          progressVariant === "circular" ? (
            <CircularUploadProgress progress={progress} size={56} />
          ) : (
            <div className="w-full max-w-xs">
              <LinearUploadProgress
                progress={progress}
                label="Uploading…"
                showPercentage
              />
            </div>
          )
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lilac/10">
              <TypeIcon className="w-6 h-6 text-lilac" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-soft-white">
                {label ?? `Upload ${fileType}`}
              </p>
              <p className="mt-1 text-xs text-muted-lavender">
                Drag & drop or click · max {maxSizeMB} MB
              </p>
            </div>
            <Upload className="absolute bottom-3 right-3 w-4 h-4 text-muted-lavender opacity-40" />
          </>
        )}
      </div>

      {/* Cancel / reset while uploading */}
      {uploading && (
        <button
          onClick={reset}
          className="mt-2 flex items-center gap-1 text-xs text-muted-lavender hover:text-red-400 transition-colors"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_MAP[fileType]}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || uploading}
      />
    </div>
  );
}