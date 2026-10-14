/**
 * Official EAFAMS Logo Component
 * Supports both the full MOE Singapore Crest header logo (Screenshot 2026-10-14 at 13.52.56.png)
 * and the standalone eafams badge crest (Screenshot 2026-10-14 at 13.27.44.png).
 */

import React from 'react';

interface EafamsLogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'light' for light backgrounds, 'dark' for dark footer
  showText?: boolean;
  mode?: 'crest' | 'moe_header';
}

export const EafamsLogo: React.FC<EafamsLogoProps> = ({
  className = 'h-9 w-auto',
  variant = 'light',
  showText = true,
  mode = 'crest',
}) => {
  const eaColor = variant === 'dark' ? '#ffffff' : '#0f2445';
  const famsColor = variant === 'dark' ? '#f43f5e' : mode === 'moe_header' ? '#0f2445' : '#9b1b30';

  // MOE Header Mode: Official Singapore MOE Crest + "Ministry of Education SINGAPORE" | "eafams"
  if (mode === 'moe_header') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        {/* MOE Singapore Red Crest Badge */}
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 40 46" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Red Shield Background */}
            <path
              d="M20 1 C8 1, 2 8, 2 20 C2 33, 14 42, 20 45 C26 42, 38 33, 38 20 C38 8, 32 1, 20 1 Z"
              fill="#c51a1b"
            />
            {/* White outline rim */}
            <path
              d="M20 3 C9.5 3, 4 9.5, 4 20 C4 31.5, 15 40, 20 43 C25 40, 36 31.5, 36 20 C36 9.5, 30.5 3, 20 3 Z"
              stroke="#ffffff"
              strokeWidth="1.2"
              fill="#c51a1b"
            />
            {/* White Open Book */}
            <path
              d="M19 16 C14 16, 8 17, 6 18.5 C5.5 19, 5.5 27, 5.5 27 C8.5 26, 14 25, 19 25.5 Z"
              fill="#ffffff"
            />
            <path
              d="M21 16 C26 16, 32 17, 34 18.5 C34.5 19, 34.5 27, 34.5 27 C31.5 26, 26 25, 21 25.5 Z"
              fill="#ffffff"
            />
            {/* Gold heraldic details */}
            <circle cx="20" cy="11.5" r="3.2" fill="#facc15" />
            <path d="M20 9.2 L20.8 11 L22.8 11.2 L21.3 12.4 L21.8 14.2 L20 13.2 L18.2 14.2 L18.7 12.4 L17.2 11.2 L19.2 11 Z" fill="#c51a1b" />
            {/* Base Banner */}
            <path d="M8 30 Q20 33 32 30 L31 34 Q20 37 9 34 Z" fill="#ffffff" />
          </svg>

          <div className="leading-tight">
            <span className="text-[12px] font-bold text-slate-800 tracking-tight block">
              Ministry of Education
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-700 block">
              SINGAPORE
            </span>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="h-7 w-[1.5px] bg-slate-300"></div>

        {/* eafams Wordmark */}
        <div className="flex items-center">
          <span className="text-2xl font-black text-[#102446] tracking-tight font-sans">
            eafams
          </span>
        </div>
      </div>
    );
  }

  // Standalone Crest Mode
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 215 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto overflow-visible"
        aria-label="eafams logo"
      >
        {/* Emblem Crest / Pin Shield */}
        <g transform="translate(2, 1)">
          {/* Outer shield shadow/depth */}
          <path
            d="M25 1 C12 1, 2.5 10.5, 2.5 24 C2.5 35.5, 17 46, 25 51 C33 46, 47.5 35.5, 47.5 24 C47.5 10.5, 38 1, 25 1 Z"
            fill="#720d1e"
          />

          {/* Main maroon/crimson shield body */}
          <path
            d="M25 2 C13 2, 4 11, 4 24 C4 34.5, 18 44.5, 25 49.5 C32 44.5, 46 34.5, 46 24 C46 11, 37 2, 25 2 Z"
            fill="#8e172a"
          />

          {/* Inner subtle rim */}
          <path
            d="M25 3.5 C14.5 3.5, 6 12, 6 23.5 C6 33, 19 42.5, 25 47 C31 42.5, 44 33, 44 23.5 C44 12, 35.5 3.5, 25 3.5 Z"
            stroke="#a8283e"
            strokeWidth="0.8"
            fill="none"
          />

          {/* Top golden star in circle badge */}
          <circle cx="25" cy="12.5" r="4.2" fill="#eab308" />
          <path
            d="M25 9.5 L26 11.8 L28.4 12 L26.6 13.5 L27.2 15.8 L25 14.5 L22.8 15.8 L23.4 13.5 L21.6 12 L24 11.8 Z"
            fill="#ffffff"
          />

          {/* Open Book in center */}
          <path
            d="M23.5 19 C18 19, 11 20, 8.5 21.5 C8 21.8, 8 22.5, 8 30 C11 29, 17.5 28, 23.5 28.5 Z"
            fill="#ffffff"
          />
          <path
            d="M26.5 19 C32 19, 39 20, 41.5 21.5 C42 21.8, 42 22.5, 42 30 C39 29, 32.5 28, 26.5 28.5 Z"
            fill="#ffffff"
          />

          {/* Golden base ribbon/bar */}
          <path d="M10 32 H40 V35 H10 Z" fill="#eab308" />

          {/* 3 white rectangular window blocks */}
          <rect x="13.5" y="29.5" width="4" height="3.5" rx="0.5" fill="#ffffff" />
          <rect x="23" y="29.5" width="4" height="3.5" rx="0.5" fill="#ffffff" />
          <rect x="32.5" y="29.5" width="4" height="3.5" rx="0.5" fill="#ffffff" />
        </g>

        {/* Wordmark: ea + fams */}
        {showText && (
          <g>
            <text
              x="60"
              y="37.5"
              fill={eaColor}
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Public Sans', sans-serif"
              fontSize="34"
              fontWeight="800"
              letterSpacing="-0.03em"
            >
              ea
            </text>
            <text
              x="98"
              y="37.5"
              fill={famsColor}
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Public Sans', sans-serif"
              fontSize="34"
              fontWeight="800"
              letterSpacing="-0.03em"
            >
              fams
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
