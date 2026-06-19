const MAX_UPLOAD_EDGE = 1280;
const MIN_UPLOAD_SIZE_FOR_COMPRESSION = 500 * 1024;
const UPLOAD_JPEG_QUALITY = 0.8;

function stripFileExtension(name) {
  return String(name || "photo").replace(/\.[^.]+$/, "");
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function compressUploadImage(file) {
  const shouldCompress = file.size >= MIN_UPLOAD_SIZE_FOR_COMPRESSION || file.type !== "image/jpeg";
  if (!shouldCompress) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromUrl(objectUrl);
    const width = image.naturalWidth || image.width || 0;
    const height = image.naturalHeight || image.height || 0;

    if (!width || !height) {
      return file;
    }

    const scale = Math.min(1, MAX_UPLOAD_EDGE / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, "image/jpeg", UPLOAD_JPEG_QUALITY);
    if (!blob) {
      return file;
    }

    return new File([blob], `${stripFileExtension(file.name)}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified || Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
