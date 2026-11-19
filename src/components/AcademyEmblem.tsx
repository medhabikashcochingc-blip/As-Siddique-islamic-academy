import React from 'react';

interface AcademyEmblemProps {
  className?: string;
  variant?: 'gold-on-emerald' | 'emerald-on-cream' | 'light';
}

/**
 * Custom 8-pointed Rub el Hizb geometric star & open book architectural emblem
 * for As-Siddique Islamic Academy.
 */
export const AcademyEmblem: React.FC<AcademyEmblemProps> = ({
  className = 'w-9 h-9',
  variant = 'emerald-on-cream',
}) => {
  const strokeColor =
    variant === 'gold-on-emerald'
      ? '#E5C158'
      : variant === 'light'
      ? '#FAF7F0'
      : '#093B2C';

  const accentColor =
    variant === 'gold-on-emerald'
      ? '#FAF7F0'
      : variant === 'light'
      ? '#E5C158'
      : '#B8923E';

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Rub el Hizb octagram */}
      <rect
        x="10.5"
        y="10.5"
        width="27"
        height="27"
        rx="1.5"
        stroke={accentColor}
        strokeWidth="1.5"
      />
      <rect
        x="10.5"
        y="10.5"
        width="27"
        height="27"
        rx="1.5"
        transform="rotate(45 24 24)"
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Inner arch & open book motif */}
      <path
        d="M17 28.5C19.5 27.2 22 27.5 24 29C26 27.5 28.5 27.2 31 28.5V19.5C28.5 18.4 26 18.7 24 20.2C22 18.7 19.5 18.4 17 19.5V28.5Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="24" y1="20.2" x2="24" y2="29" stroke={accentColor} strokeWidth="1.4" />
      <circle cx="24" cy="14.5" r="1.3" fill={accentColor} />
    </svg>
  );
};

export const GeometricDivider: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const lineClass = dark ? 'bg-[#C9A449]/30' : 'bg-[#B8923E]/30';
  const iconColor = dark ? '#E5C158' : '#8A6518';

  return (
    <div className="flex items-center justify-center gap-4 my-2" aria-hidden="true">
      <span className={`h-px w-16 sm:w-24 ${lineClass}`} />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
          stroke={iconColor}
          strokeWidth="1.3"
        />
        <circle cx="12" cy="12" r="2.2" fill={iconColor} />
      </svg>
      <span className={`h-px w-16 sm:w-24 ${lineClass}`} />
    </div>
  );
};
