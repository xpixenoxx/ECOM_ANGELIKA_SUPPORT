'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils/cn';

interface ImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  accept?: string;
  className?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 10,
  accept = 'image/*',
  className,
  label = 'Upload Images',
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePreviews = (files: FileList) => {
    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      }
    }
    setPreviews(prev => [...prev, ...newPreviews].slice(0, maxImages));
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, maxImages - value.length);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    event.target.files = dataTransfer.files;

    generatePreviews(event.target.files);
    const newValues = [...value];
    newFiles.forEach(file => newValues.push(file.name));
    onChange(newValues);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/')).slice(0, maxImages - value.length);
    if (newFiles.length === 0) return;

    generatePreviews(newFiles as unknown as FileList);
    const newValues = [...value];
    newFiles.forEach(file => newValues.push(file.name));
    onChange(newValues);
  };

  const removeImage = (index: number) => {
    const newValues = value.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onChange(newValues);
    setPreviews(newPreviews);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {label && <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">{label}</label>}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-[var(--radius-xl)] p-8 text-center transition-all duration-200',
          'bg-[var(--color-white)]',
          isDragging
            ? 'border-[var(--color-gold)] bg-[var(--color-gold-light)]'
            : 'border-[var(--color-whisper)] hover:border-[var(--color-gold)]/50',
          value.length >= maxImages && 'opacity-50 pointer-events-none'
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); }} }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="sr-only"
          id="image-upload"
          disabled={value.length >= maxImages}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-[var(--color-mist)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M17 10l5 5 5-5" />
          </svg>
          <p className="mt-3 text-lg font-medium text-[var(--color-ink)]">
            {value.length >= maxImages ? 'Maximum images reached' : 'Drag & drop images here, or click to browse'}
          </p>
          <p className="mt-1 text-sm text-[var(--color-slate)]">
            {value.length} of {maxImages} images • PNG, JPG, WebP up to 10MB each
          </p>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3" role="list" aria-label="Image previews">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-whisper)] bg-[var(--color-white)]" role="listitem">
              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-[var(--color-ink)]/80 text-[var(--color-white)] hover:bg-[var(--color-error)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
                aria-label={`Remove image ${index + 1}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-xs font-medium bg-[var(--color-gold)] text-[var(--color-ink)] rounded-[var(--radius-sm)]">Main</span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--color-mist)]" aria-live="polite">
        {value.length} of {maxImages} images selected
      </p>
    </div>
  );
}