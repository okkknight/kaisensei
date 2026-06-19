import { useCallback, useEffect, useRef, useState } from "react";

export function useQuickLessonPreview() {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const previewUrlRef = useRef("");

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setPhotoPreviewUrl("");
  }, []);

  const setPreviewFromFile = useCallback((file) => {
    clearPreview();
    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPhotoPreviewUrl(nextUrl);
  }, [clearPreview]);

  return {
    photoPreviewUrl,
    clearPreview,
    setPreviewFromFile,
  };
}

export default useQuickLessonPreview;
