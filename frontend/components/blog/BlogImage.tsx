'use client';

import { useEffect, useState } from 'react';

interface BlogImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Renders the primary cover photo and transparently swaps to the generated
 * branded OG cover (fallbackSrc) if the primary URL fails to load.
 */
export function BlogImage({
  src,
  fallbackSrc,
  alt,
  className,
  width = 1200,
  height = 630,
  priority = false,
}: BlogImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  // Reset when the post (src) changes, e.g. on client navigation between posts.
  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
      className={className}
    />
  );
}
