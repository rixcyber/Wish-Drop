const MAX_EDGE = 1200;
const QUALITY = 0.82;

/**
 * Down-scales an uploaded image in the browser so demo-mode persistence stays
 * small. In Supabase mode the resized blob is uploaded to Storage instead.
 */
export function resizeImageFile(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Images must be smaller than 8 MB."));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not process that image."));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      const isPng = file.type === "image/png";
      const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", QUALITY);
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => resolve({ blob, dataUrl }))
        .catch(() => reject(new Error("Could not process that image.")))
        .finally(() => URL.revokeObjectURL(objectUrl));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That file could not be read as an image."));
    };
    image.src = objectUrl;
  });
}
