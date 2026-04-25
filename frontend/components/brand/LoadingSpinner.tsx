import { LogoIcon } from './Logo';

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer track */}
        <svg className="absolute inset-0" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" stroke="#e0e7ff" strokeWidth="3" fill="none" />
        </svg>
        {/* Spinning arc */}
        <svg
          className="absolute inset-0 animate-spin"
          width="80"
          height="80"
          viewBox="0 0 80 80"
          style={{ animationDuration: '1s' }}
        >
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="#4f46e5"
            strokeWidth="3"
            fill="none"
            strokeDasharray="68 146"
            strokeLinecap="round"
            strokeDashoffset="0"
          />
        </svg>
        {/* Logo center */}
        <LogoIcon size={44} />
      </div>
    </div>
  );
}
