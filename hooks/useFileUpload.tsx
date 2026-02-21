import { useState } from "react";
import makeApiRequest from "@/axios/make-api-request";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  const uploadFile = async (formData: FormData) => {
    try {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      const response = await makeApiRequest({
        type: "post",
        url: "/file/upload",
        data: formData,
        config: {
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.round((event.loaded * 100) / event.total);
              setProgress(percent);
            }
          },
        },
      });

      setData(response);
      return response;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    data,
    error,
  };
}
