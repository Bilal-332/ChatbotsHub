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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 shadow-[0_0_25px_rgba(91,108,255,0.35)]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="ChatbotsHub icon"
            >
              <rect x="1" y="1" width="30" height="30" rx="8" fill="rgba(91,108,255,0.18)" stroke="rgba(91,108,255,0.35)" />
              <g transform="translate(4 4)" stroke="#5B6CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </g>
            </svg>
          </div>
        </div>
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.25em] text-text-secondary/70">
          Loading
        </div>
      </div>
    </div>
  );
}
