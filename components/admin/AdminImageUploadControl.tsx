'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Shared local-device image uploader helper with multi-endpoint fallback
 * for admin CMS editors.
 */
export async function uploadAdminImageWithFallback(
  file: File,
  target = 'static-page'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Please select a valid image file (JPG, PNG, WebP)' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Image size must be under 10MB' };
  }

  const fd = new FormData();
  fd.append('file', file);
  fd.append('target', target);
  fd.append('category', 'content');
  fd.append('folder', 'content');

  try {
    let res = await fetch('/api/admin/content/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    }
    if (!res.ok) {
      res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
    }

    const json = await res.json().catch(() => ({}));
    const url = json.url || json.secure_url;
    if (res.ok && url) {
      return { success: true, url };
    }
    return { success: false, error: json.error || 'Failed to upload image. Please try again.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during upload' };
  }
}

/**
 * Compact URL input + thumbnail preview + "Upload" button for admin CMS editors.
 */
export function AdminImageInputWithUpload({
  label,
  value,
  onChange,
  placeholder = '/images/...',
  helperText,
  target = 'static-page',
  previewShape = 'rounded',
}: {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  target?: string;
  previewShape?: 'circle' | 'rounded';
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);
    const res = await uploadAdminImageWithFallback(file, target);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (res.success && res.url) {
      onChange(res.url);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } else {
      setErrorMsg(res.error || 'Upload failed');
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-[var(--color-ink)] tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'relative group shrink-0 w-10 h-10 overflow-hidden border border-[var(--color-gold)]/50 hover:border-[var(--color-gold)] bg-[var(--color-snow)] transition-all',
            previewShape === 'circle' ? 'rounded-full' : 'rounded-lg'
          )}
          title="Click to upload from your device"
        >
          {value ? (
            <img src={value} alt={label || 'Preview'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-slate)]">
              <Upload className="w-4 h-4" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-3.5 h-3.5 text-white" />
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        <input
          type="text"
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 h-10 text-xs px-3 rounded-lg border border-[var(--color-whisper)] bg-[var(--color-white)] text-[var(--color-ink)] placeholder:text-[var(--color-mist)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
        />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="h-10 px-3 text-xs font-semibold rounded-lg border border-[var(--color-gold)] text-[var(--color-ink)] bg-[var(--color-champagne-light)] hover:bg-[var(--color-gold)]/20 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          title="Upload image from local device"
        >
          {isUploading ? (
            <>
              <div className="w-3 h-3 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>
      {successMsg && (
        <p className="text-[11px] text-emerald-600 font-medium">✓ Uploaded from device! Click Save Changes to publish.</p>
      )}
      {errorMsg && (
        <p className="text-[11px] text-rose-600 font-medium">⚠ {errorMsg}</p>
      )}
      {helperText && (
        <p className="text-[10px] text-[var(--color-slate)] leading-tight">{helperText}</p>
      )}
    </div>
  );
}
