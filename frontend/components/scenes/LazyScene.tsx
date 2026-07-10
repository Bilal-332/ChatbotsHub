'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazySceneProps {
  children: ReactNode;
  className?: string;
  /** How far outside the viewport to start mounting the scene. */
  rootMargin?: string;
}

/**
 * Mounts an expensive (WebGL/Three.js) child only while it is near the
 * viewport, and unmounts it once it scrolls away. This keeps below-the-fold
 * 3D scenes off the main thread during initial page load — the main driver of
 * Total Blocking Time on this landing page. Purely a performance wrapper: the
 * scene's visuals and behaviour are unchanged.
 */
export function LazyScene({ children, className, rootMargin = '250px' }: LazySceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : null}
    </div>
  );
}
