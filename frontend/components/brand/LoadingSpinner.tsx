import { LogoIcon } from '@/components/brand/Logo';

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0" width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="38" stroke="rgba(91,108,255,0.25)" strokeWidth="3" fill="none" />
          </svg>
          <svg
            className="absolute inset-0 animate-spin"
            width="96"
            height="96"
            viewBox="0 0 96 96"
            style={{ animationDuration: '1.1s' }}
          >
            <circle
              cx="48"
              cy="48"
              r="38"
              stroke="#5B6CFF"
              strokeWidth="3"
              fill="none"
              strokeDasharray="90 160"
              strokeLinecap="round"
              strokeDashoffset="0"
            />
          </svg>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 shadow-[0_0_25px_rgba(91,108,255,0.35)] overflow-hidden">
            <LogoIcon size={32} className="h-8 w-8" />
          </div>
        </div>
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary/70">
          Loading
        </div>
      </div>
    </div>
  );
}
