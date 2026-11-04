'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';

interface Props {
  enabled?: boolean;
  text?: string | null;
  link?: string | null;
  bgColor?: string;
  textColor?: string;
}

export function AnnouncementBar({
  enabled = false,
  text,
  link,
  bgColor = '#C9A84C',
  textColor = '#ffffff',
}: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || !text || dismissed) return null;

  const content = (
    <span className="flex items-center justify-center gap-2 text-xs font-medium tracking-wide">
      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
      <span>{text}</span>
    </span>
  );

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="relative py-2 px-4 text-center z-50 transition-all duration-300 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {link ? (
          <Link href={link} className="hover:underline flex items-center gap-1.5">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 rounded-md transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
