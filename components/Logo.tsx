"use client";

import { useId } from "react";

/**
 * Logo resmi Your Personal FinTrack:
 * hati biru di atas latar beige.
 */
export default function Logo({ size = 24 }: { size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sandId = `ft-sand-${uid}`;
  const blueId = `ft-blue-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Your Personal FinTrack logo"
    >
      <defs>
        <linearGradient id={sandId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6ead0" />
          <stop offset="1" stopColor="#d9c49c" />
        </linearGradient>
        <linearGradient id={blueId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b93d6" />
          <stop offset="1" stopColor="#1e5aa8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${sandId})`} />
      <rect x="2" y="2" width="44" height="44" rx="13" fill="none" stroke="#b99b68" strokeWidth="1.5" opacity="0.7" />
      <path
        d="M24 37.5C17.7 33 11 27.9 11 21.7 11 17.3 14.2 14.5 17.9 14.5c2.5 0 4.6 1.4 6.1 3.5 1.5-2.1 3.6-3.5 6.1-3.5 3.7 0 6.9 2.8 6.9 7.2 0 6.2-6.7 11.3-13 15.8z"
        fill={`url(#${blueId})`}
      />
    </svg>
  );
}
