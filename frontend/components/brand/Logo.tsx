import React from 'react';

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 40, className = '' }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ChatbotsHub icon"
    >
      {/* Background square */}
      <rect width="40" height="40" rx="10" fill="#4f46e5" />

      {/* Chat bubble border */}
      <rect x="6" y="6" width="28" height="21" rx="6" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />

      {/* Connection lines from center to corners */}
      <line x1="20" y1="16.5" x2="11" y2="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
      <line x1="20" y1="16.5" x2="29" y2="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
      <line x1="20" y1="16.5" x2="11" y2="23" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
      <line x1="20" y1="16.5" x2="29" y2="23" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />

      {/* Outer nodes */}
      <circle cx="11" cy="10" r="2" fill="white" fillOpacity="0.75" />
      <circle cx="29" cy="10" r="2" fill="white" fillOpacity="0.75" />
      <circle cx="11" cy="23" r="2" fill="white" fillOpacity="0.75" />
      <circle cx="29" cy="23" r="2" fill="white" fillOpacity="0.75" />

      {/* Central node */}
      <circle cx="20" cy="16.5" r="3.5" fill="white" />

      {/* Chat bubble tail */}
      <path d="M15 27 L12.5 33.5 L21 27Z" fill="#4f46e5" />
      <path d="M15 27 L12.5 33.5 L21 27Z" fill="white" fillOpacity="0.12" />
    </svg>
  );
}

interface LogoFullProps {
  size?: number;
  textColor?: string;
  className?: string;
}

export function LogoFull({ size = 32, textColor = '#111827', className = '' }: LogoFullProps) {
  const fontSize = Math.round(size * 0.6);
  return (
    <div className={`flex items-center gap-2.5 ${className}`} style={{ lineHeight: 1 }}>
      <LogoIcon size={size} />
      <span
        style={{
          fontSize,
          fontWeight: 700,
          color: textColor,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '-0.03em',
        }}
      >
        Chatbots<span style={{ color: '#4f46e5' }}>Hub</span>
      </span>
    </div>
  );
}
