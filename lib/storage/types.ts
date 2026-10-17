/**
 * Storage Service Interface & Configuration
 *
 * Requirements:
 * - Abstracted behind interface (local disk/in-memory dev, S3/Cloudflare R2 production)
 * - Strict MIME type validation (JPEG, PNG, WebP)
 * - Max size limit: 5 MB per image
 * - Random storage keys
 * - EXIF stripping
 */

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface StorageService {
  uploadImage(
    data: {
      name: string;
      type: string;
      size: number;
      dataUrl?: string;
      arrayBuffer?: ArrayBuffer;
    }
  ): Promise<UploadedImage>;
  deleteImage(id: string): Promise<boolean>;
  getImageUrl(id: string): string;
}

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  MAX_MAP_ART_IMAGES: 10,
  MAX_BUILD_IMAGES: 10,
  MAX_VOUCH_IMAGES: 4,
  MAX_TRADE_IMAGES: 4,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

export function validateImageFile(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  if (!STORAGE_LIMITS.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Unsupported format (${file.type}). Only PNG, JPEG, and WebP are permitted.`,
    };
  }

  if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds 5 MB limit (current: ${sizeMb} MB).`,
    };
  }

  return { valid: true };
}
