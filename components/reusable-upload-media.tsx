"use client";

import { cn } from "@/lib/utils";
import { CloudUpload } from "lucide-react";
import { useRef, useState } from "react";

export type FileType = "image" | "video" | "document" | "all";

export interface UploadConfig {
  allowedTypes: FileType[];
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
}

type ReusableUploadMediaProps = {
  title?: string;
  subtitle?: string;
  uploadConfig: UploadConfig;
  onChange: (files: File[] | File | null) => void;
  disabled?: boolean;
  className?: string;
};

const FILE_TYPE_CONFIGS = {
  image: {
    accept: "image/*",
    extensions: "PNG, JPG, GIF, SVG",
    description: "Images",
  },
  video: {
    accept: "video/*",
    extensions: "MP4, MOV, AVI, WebM",
    description: "Videos",
  },
  document: {
    accept: ".pdf,.doc,.docx,.txt",
    extensions: "PDF, DOC, DOCX, TXT",
    description: "Documents",
  },
  all: {
    accept: "*/*",
    extensions: "All file types",
    description: "Files",
  },
};

export default function ReusableUploadMedia({
  title = "",
  subtitle,
  uploadConfig,
  onChange,
  disabled = false,
  className = "",
}: ReusableUploadMediaProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAcceptString = () => {
    if (uploadConfig.accept) return uploadConfig.accept;
    return uploadConfig.allowedTypes
      .map((type) => FILE_TYPE_CONFIGS[type].accept)
      .join(",");
  };

  const getExtensionsDisplay = () => {
    return uploadConfig.allowedTypes
      .map((type) => FILE_TYPE_CONFIGS[type].extensions)
      .join(", ");
  };

  const getDescriptionDisplay = () => {
    if (uploadConfig.allowedTypes.length === 1) {
      return FILE_TYPE_CONFIGS[uploadConfig.allowedTypes[0]].description;
    }
    return uploadConfig.allowedTypes
      .map((type) => FILE_TYPE_CONFIGS[type].description)
      .join(", ");
  };

  const validateFile = (file: File): string | null => {
    if (uploadConfig.maxSizeMB) {
      const maxSizeBytes = uploadConfig.maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File size must be less than ${uploadConfig.maxSizeMB}MB`;
      }
    }

    if (!uploadConfig.allowedTypes.includes("all")) {
      const isValidType = uploadConfig.allowedTypes.some((type) => {
        switch (type) {
          case "image":
            return file.type.startsWith("image/");
          case "video":
            return file.type.startsWith("video/");
          case "document":
            return (
              file.type === "application/pdf" ||
              file.type.includes("document") ||
              file.type.includes("text") ||
              file.name.toLowerCase().endsWith(".pdf") ||
              file.name.toLowerCase().endsWith(".doc") ||
              file.name.toLowerCase().endsWith(".docx") ||
              file.name.toLowerCase().endsWith(".txt")
            );
          default:
            return false;
        }
      });

      if (!isValidType) {
        return `Please upload a valid ${getDescriptionDisplay().toLowerCase()} file`;
      }
    }

    return null;
  };

  const handleFile = (files: FileList | null) => {
    setError(null);

    if (!files || files.length === 0) {
      onChange(null);
      return;
    }

    const fileArray = Array.from(files);
    const errors = fileArray.map(validateFile).filter(Boolean);

    if (errors.length > 0) {
      setError(errors[0] || "Invalid file(s)");
      return;
    }

    if (uploadConfig.multiple) {
      onChange(fileArray);
    } else {
      onChange(fileArray[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragEvents = (
    e: React.DragEvent<HTMLDivElement>,
    entering: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(entering);
    }
  };

  return (
    <div className={cn("mt-4 space-y-2", { className })}>
      {title && <p className="text-sm font-medium text-[#344054]">{title}</p>}
      {subtitle && <p className="text-xs text-[#667085]">{subtitle}</p>}

      <div
        className={cn(
          "bg-[#FEFEFE] border rounded-md relative flex flex-col items-center justify-center p-6 space-y-4 transition-all min-h-[120px]",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:border-[#328BE0]",
          dragActive
            ? "border-[#328BE0] border-2 bg-blue-50"
            : "border-[#E4E7EC]",
          error ? "border-[#D34646]" : ""
        )}
        onClick={() => !disabled && fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
      >
        <CloudUpload
          className={dragActive ? "text-[#328BE0]" : "text-[#667085]"}
        />
        <div className="text-center space-y-2">
          <p className="text-sm text-[#667085]">
            <span className="text-[#328BE0] font-medium">Click to upload</span>{" "}
            {!disabled && "or drag and drop"}
          </p>
          <p className="text-sm text-[#667085]">{getExtensionsDisplay()}</p>
          {uploadConfig.maxSizeMB && (
            <p className="text-xs text-[#667085]">
              Max size: {uploadConfig.maxSizeMB}MB
            </p>
          )}
        </div>
        <input
          title="File Upload"
          type="file"
          accept={getAcceptString()}
          id="file-upload"
          multiple={uploadConfig.multiple}
          className="hidden"
          ref={fileRef}
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>

      {error && <p className="text-sm text-[#D34646] mt-2">{error}</p>}
    </div>
  );
}
