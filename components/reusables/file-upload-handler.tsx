/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useCallback } from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/useFileUpload";
import CircularUploadProgress from "@/components/loaders/circular-upload-progress";
import LinearUploadProgress from "@/components/loaders/linear-upload-progress";

export type FileType = "image" | "video" | "document";

export interface UploadedFile {
  file: File;
  url: string;
  type: FileType;
}

export interface FileUploadHandlerProps {
  // Upload configuration
  allowedTypes?: FileType[];
  maxSizeMB?: number;
  multiple?: boolean;
  maxFiles?: boolean; // Whether to enable file limiting
  fileLimit?: number; // Number of files allowed when maxFiles is true

  // UI configuration
  showPreview?: boolean;
  showProgress?: boolean;

  // Callbacks
  onFileUpload?: (files: UploadedFile[]) => void;
  onFileRemove?: (fileIndex: number) => void;
  onError?: (error: string) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;

  // State
  uploadedFiles?: UploadedFile[];
  disabled?: boolean;

  // Styling
  className?: string;
  previewClassName?: string;

  // Children - render prop for custom upload UI
  children?: (props: {
    handleFileUpload: (files: File | File[] | null) => void;
    isUploading: boolean;
    progress: number;
    disabled: boolean;
    canAddMore: boolean;
    filesCount: number;
    maxFiles: boolean;
    fileLimit: number;
    isLimitReached: boolean;
  }) => React.ReactNode;
}

const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  allowedTypes = ["image", "video", "document"],
  maxSizeMB = 50,
  multiple = false,
  maxFiles = false, // Default to no file limiting
  fileLimit = 5, // Default limit when maxFiles is enabled
  showPreview = true,
  showProgress = true,
  onFileUpload,
  onFileRemove,
  onError,
  onUploadStart,
  onUploadComplete,
  uploadedFiles = [],
  disabled = false,
  className = "",
  previewClassName = "",
  children,
}) => {
  const { uploadFile, isUploading, progress } = useFileUpload();
  const [localFiles, setLocalFiles] = useState<UploadedFile[]>([]);

  // Determine if we're using controlled mode (external state) or uncontrolled mode (internal state)
  const isControlled = onFileUpload !== undefined;
  const files = isControlled ? uploadedFiles : localFiles;

  const updateFiles = useCallback(
    (newFiles: UploadedFile[]) => {
      if (isControlled) {
        onFileUpload?.(newFiles);
      } else {
        setLocalFiles(newFiles);
      }
    },
    [isControlled, onFileUpload]
  );

  // Calculate if limit is reached
  const isLimitReached = maxFiles ? files.length >= fileLimit : false;
  const canAddMore = !isLimitReached;

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const validateFile = (file: File): boolean => {
    const fileType = getFileType(file);

    if (!allowedTypes.includes(fileType)) {
      const error = `${fileType} files are not allowed. Allowed types: ${allowedTypes.join(
        ", "
      )}`;
      onError?.(error);
      toast.error(error);
      return false;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      const error = `File size must be less than ${maxSizeMB}MB`;
      onError?.(error);
      toast.error(error);
      return false;
    }

    return true;
  };

  const handleFileUpload = useCallback(
    async (selectedFiles: File | File[] | null) => {
      if (!selectedFiles || disabled) return;

      const filesToUpload = Array.isArray(selectedFiles)
        ? selectedFiles
        : [selectedFiles];

      // Check file limit (if maxFiles is enabled)
      if (maxFiles && files.length + filesToUpload.length > fileLimit) {
        const error = `Maximum ${fileLimit} files allowed`;
        onError?.(error);
        toast.error(error);
        return;
      }

      // Validate all files first
      const validFiles = filesToUpload.filter(validateFile);
      if (validFiles.length === 0) return;

      try {
        onUploadStart?.();

        const uploadPromises = validFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const response = await uploadFile(formData);

          if (response?.data?.url) {
            return {
              file,
              url: response.data.url,
              type: getFileType(file),
            } as UploadedFile;
          } else {
            throw new Error(`Failed to upload ${file.name}`);
          }
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        const newFiles = [...files, ...uploadedFiles];
        updateFiles(newFiles);

        toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
        onUploadComplete?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload files";
        onError?.(errorMessage);
        toast.error(errorMessage);
      }
    },
    [
      files,
      disabled,
      maxFiles,
      fileLimit,
      allowedTypes,
      maxSizeMB,
      uploadFile,
      onError,
      onUploadStart,
      onUploadComplete,
      updateFiles,
    ]
  );

  const handleFileRemove = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      updateFiles(newFiles);
      onFileRemove?.(index);
    },
    [files, onFileRemove, updateFiles]
  );

  const renderFilePreview = (uploadedFile: UploadedFile, index: number) => {
    const { file, url, type } = uploadedFile;

    return (
      <div
        key={index}
        className={`relative border rounded-md overflow-hidden ${previewClassName}`}
      >
        <button
          onClick={() => handleFileRemove(index)}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 z-10"
          aria-label="Remove file"
        >
          <X size={12} />
        </button>

        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 z-10"
          aria-label="View file in new tab"
        >
          <ExternalLink size={12} />
        </Link>

        {type === "image" && (
          <div className="relative w-full h-48">
            <Image src={url} alt={file.name} fill className="object-cover" />
          </div>
        )}

        {type === "video" && (
          <video src={url} controls className="w-full h-48 object-cover" />
        )}

        {type === "document" && (
          <div className="p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-blue-500 flex-shrink-0" />
              <span
                className="text-sm text-gray-600 truncate"
                title={file.name}
              >
                {file.name}
              </span>
            </div>
            <iframe
              src={url}
              className="w-full h-32 border rounded"
              title={file.name}
            />
          </div>
        )}

        <div className="p-2 bg-white border-t">
          <p className="text-xs text-gray-600 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Progress */}
      {showProgress && isUploading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {allowedTypes.includes("document") ? (
            <LinearUploadProgress progress={progress} />
          ) : (
            <CircularUploadProgress progress={progress} />
          )}
          <p className="text-sm text-gray-600">
            Uploading files... {progress}%
          </p>
        </div>
      )}

      {/* Custom Upload UI via children render prop */}
      {children && (
        <div>
          {children({
            handleFileUpload,
            isUploading,
            progress,
            disabled: disabled || !canAddMore,
            canAddMore,
            filesCount: files.length,
            maxFiles,
            fileLimit,
            isLimitReached,
          })}
        </div>
      )}

      {/* File limit warning - only shows if maxFiles is enabled and limit reached */}
      {maxFiles && isLimitReached && (
        <p className="text-sm text-orange-600">
          Maximum of {fileLimit} files allowed. You cannot add more files.
        </p>
      )}

      {/* Preview Section */}
      {showPreview && files.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}
            {maxFiles ? `/${fileLimit}` : ""})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((uploadedFile, index) =>
              renderFilePreview(uploadedFile, index)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom hook for easier state management
export const useFileUploadHandler = (initialFiles: UploadedFile[] = []) => {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = useCallback((uploadedFiles: UploadedFile[]) => {
    setFiles(uploadedFiles);
  }, []);

  const handleFileRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleError = useCallback((error: string) => {
    setErrors((prev) => [...prev, error]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFilesByType = useCallback(
    (type: FileType) => {
      return files.filter((file) => file.type === type);
    },
    [files]
  );

  const getUrls = useCallback(
    (type?: FileType) => {
      if (type) {
        return files
          .filter((file) => file.type === type)
          .map((file) => file.url);
      }
      return files.map((file) => file.url);
    },
    [files]
  );

  return {
    files,
    setFiles,
    errors,
    clearErrors,
    handleFileUpload,
    handleFileRemove,
    handleError,
    getFilesByType,
    getUrls,
  };
};

export default FileUploadHandler;
