'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
  motionProps?: HTMLMotionProps<"div">;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, animated = false, motionProps, ...props }, ref) => {
    if (animated) {
      return (
        <motion.div
          ref={ref as any}
          className={cn('card group', className)}
          {...motionProps}
          {...(props as any)}
        >
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none transition-colors group-hover:border-primary/20" />
          {children}
        </motion.div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn('card group', className)}
        {...props}
      >
        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none transition-colors group-hover:border-primary/20" />
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';
