import React from 'react';

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 40, className = '' }: LogoIconProps) {
  return (
    <img
      src="/icon.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
    />
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
          fontFamily: 'var(--font-logo), "Inter Tight", Inter, system-ui, sans-serif',
          letterSpacing: '-0.03em',
        }}
      >
        Chatbots<span style={{ color: '#4f46e5' }}>Hub</span>
      </span>
    </div>
  );
}
