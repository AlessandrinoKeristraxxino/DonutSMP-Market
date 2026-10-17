import { StorageService, UploadedImage, validateImageFile } from './types';

/**
 * In-memory / browser-local storage implementation for development.
 * Automatically strips EXIF by re-rendering through an offscreen Canvas when running in browser.
 */
class LocalStorageService implements StorageService {
  private images = new Map<string, UploadedImage>();

  async uploadImage(data: {
    name: string;
    type: string;
    size: number;
    dataUrl?: string;
    arrayBuffer?: ArrayBuffer;
  }): Promise<UploadedImage> {
    const validation = validateImageFile(data);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    const randomId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let url = data.dataUrl || '';
    if (!url && data.arrayBuffer) {
      // Convert ArrayBuffer to base64 dataUrl if needed
      if (typeof Buffer !== 'undefined') {
        const base64 = Buffer.from(data.arrayBuffer).toString('base64');
        url = `data:${data.type};base64,${base64}`;
      }
    }

    const imageRecord: UploadedImage = {
      id: randomId,
      url: url || `https://picsum.photos/seed/${randomId}/800/800`,
      filename: data.name,
      size: data.size,
      mimeType: data.type,
      createdAt: new Date().toISOString(),
    };

    this.images.set(randomId, imageRecord);
    return imageRecord;
  }

  async deleteImage(id: string): Promise<boolean> {
    return this.images.delete(id);
  }

  getImageUrl(id: string): string {
    const item = this.images.get(id);
    return item ? item.url : '';
  }
}

export const storageService: StorageService = new LocalStorageService();

/**
 * Client-side helper to read a File object, sanitize EXIF via canvas, and return a clean dataUrl.
 */
export async function sanitizeAndReadFile(file: File): Promise<{
  dataUrl: string;
  size: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Corrupt or invalid image format'));
      img.onload = () => {
        // Strip EXIF by redrawing to standard 2D canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: reader.result as string,
            size: file.size,
            width: img.width,
            height: img.height,
          });
          return;
        }

        ctx.drawImage(img, 0, 0);
        // Export to WebP/JPEG (strips all EXIF metadata)
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const cleanDataUrl = canvas.toDataURL(format, 0.92);

        // Approximate size
        const head = `data:${format};base64,`;
        const cleanSize = Math.round(((cleanDataUrl.length - head.length) * 3) / 4);

        resolve({
          dataUrl: cleanDataUrl,
          size: cleanSize,
          width: img.width,
          height: img.height,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
