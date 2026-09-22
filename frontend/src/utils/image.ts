/**
 * Resizes an image file to fit within maxSize x maxSize (preserving aspect
 * ratio) and re-encodes it as a compressed JPEG data URL. Keeps uploads
 * small since they're stored directly as a data URL on the record (no
 * separate file storage service is wired up).
 */
export function resizeImageToDataUrl(file: File, maxSize = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
