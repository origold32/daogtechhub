// hooks/useFileUpload.ts
"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/supabase/client";

interface UseFileUploadReturn {
  /** 0–100 upload progress */
  progress: number;
  /** True while an upload is in flight */
  uploading: boolean;
  /** Public URL of the last successfully uploaded file, or null */
  uploadedUrl: string | null;
  /** Start uploading a File — resolves with the public URL or null on error */
  upload: (file: File, pathPrefix?: string) => Promise<string | null>;
  /** Reset state back to idle */
  reset: () => void;
}

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 *
 * @param bucket  The Supabase storage bucket name.
 *
 * Usage:
 *   const { upload, progress, uploading } = useFileUpload("avatars");
 *   const url = await upload(file);
 */
export function useFileUpload(bucket: string): UseFileUploadReturn {
  const [progress, setProgress]     = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setProgress(0);
    setUploading(false);
    setUploadedUrl(null);
  }, []);

  const upload = useCallback(
    async (file: File, pathPrefix = ""): Promise<string | null> => {
      let client: ReturnType<typeof createClient>;
      try {
        client = createClient();
      } catch {
        return null;
      }

      abortRef.current = new AbortController();

      const ext      = file.name.split(".").pop() ?? "bin";
      const fileName = `${pathPrefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      setUploading(true);
      setProgress(0);

      // Supabase JS v2 doesn't expose XHR progress natively, so we simulate
      // smooth progress while the fetch is in flight and snap to 100 on completion.
      const interval = setInterval(() => {
        setProgress((p) => (p < 90 ? p + Math.random() * 8 : p));
      }, 300);

      try {
        const { error } = await client.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        clearInterval(interval);

        if (error) {
          setProgress(0);
          setUploading(false);
          return null;
        }

        setProgress(100);

        const {
          data: { publicUrl },
        } = client.storage.from(bucket).getPublicUrl(fileName);

        setUploadedUrl(publicUrl);
        setUploading(false);
        return publicUrl;
      } catch {
        clearInterval(interval);
        setProgress(0);
        setUploading(false);
        return null;
      }
    },
    [bucket]
  );

  return { progress, uploading, uploadedUrl, upload, reset };
}