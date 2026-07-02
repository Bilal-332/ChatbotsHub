'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface BlogImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

/**
 * Optimized cover image (AVIF/WebP, responsive srcset via next/image) that
 * transparently swaps to the generated branded OG cover (fallbackSrc) if the
 * primary URL fails to load. Explicit width/height reserve space to avoid CLS.
 */
export function BlogImage({
  src,
  fallbackSrc,
  alt,
  className,
  width = 1200,
  height = 630,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
}: BlogImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  // The dynamic OG fallback is same-origin and already sized, so skip the
  // optimizer for it to guarantee it always renders.
  const isFallback = currentSrc === fallbackSrc;

  // Reset when the post (src) changes, e.g. on client navigation between posts.
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      unoptimized={isFallback}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
      className={className}
    />
  );
}
