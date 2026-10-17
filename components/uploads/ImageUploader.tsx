'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { STORAGE_LIMITS, validateImageFile } from '@/lib/storage/types';
import { sanitizeAndReadFile, storageService } from '@/lib/storage';

export interface UploadedImageItem {
  id: string;
  url: string;
  filename: string;
  size: number;
}

interface ImageUploaderProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  maxCount?: number;
  label?: string;
  helperText?: string;
  aspectRatioHint?: string;
}

export function ImageUploader({
  images,
  onChange,
  maxCount = 4,
  label = 'Images & Proof Screenshots',
  helperText = 'PNG, JPEG, or WebP up to 5 MB per image. EXIF metadata is stripped automatically.',
  aspectRatioHint,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);

    if (images.length + fileArray.length > maxCount) {
      setErrorMessage(`Cannot upload more than ${maxCount} images total.`);
      return;
    }

    setIsProcessing(true);
    const newItems: UploadedImageItem[] = [];

    try {
      for (const file of fileArray) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setErrorMessage(validation.error || 'Invalid image file.');
          continue;
        }

        // Sanitize and strip EXIF
        const { dataUrl, size } = await sanitizeAndReadFile(file);

        // Upload through storage service
        const uploaded = await storageService.uploadImage({
          name: file.name,
          type: file.type,
          size,
          dataUrl,
        });

        newItems.push({
          id: uploaded.id,
          url: uploaded.url,
          filename: uploaded.filename,
          size: uploaded.size,
        });
      }

      if (newItems.length > 0) {
        onChange([...images, ...newItems]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[var(--text-primary)]">
          {label}
        </label>
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          {images.length} / {maxCount} images
        </span>
      </div>

      {/* Drop Zone */}
      {images.length < maxCount && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[var(--accent)] bg-[var(--surface-elevate)]'
              : 'border-[var(--border)] hover:border-[var(--accent)]/60 bg-[var(--surface)]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(e.target.files);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-[var(--text-muted)]" />
            )}
            <div className="text-xs font-medium text-[var(--text-primary)]">
              {isProcessing
                ? 'Processing & stripping EXIF...'
                : 'Click to upload or drag & drop screenshots'}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] max-w-sm">
              {helperText} {aspectRatioHint ? `(${aspectRatioHint})` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-[#F85149]/10 border border-[#F85149]/30 rounded text-xs text-[#F85149]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-md overflow-hidden border border-[var(--border)] bg-[#090C10]"
            >
              <img
                src={img.url}
                alt={img.filename}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-2">
                <span className="text-[10px] font-mono text-white/90 bg-black/70 px-1.5 py-0.5 rounded">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  className="p-1 rounded bg-[#F85149] text-white hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/75 px-2 py-1 text-[10px] text-stone-300 font-mono truncate">
                {img.filename}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
