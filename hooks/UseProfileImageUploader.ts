"use client";

import { useState, useCallback } from "react";

interface UseProfileImageUploaderProps {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export function useProfileImageUploader({
  onSuccess,
  onError,
}: UseProfileImageUploaderProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const openUploader = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeUploader = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSuccess = useCallback(
    (imageUrl: string) => {
      onSuccess?.(imageUrl);
      setIsOpen(false);
    },
    [onSuccess]
  );

  const handleError = useCallback(
    (error: string) => {
      onError?.(error);
    },
    [onError]
  );

  return {
    isOpen,
    openUploader,
    closeUploader,
    handleSuccess,
    handleError,
  };
}
