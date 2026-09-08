import type { SVGProps } from "react";

type DoodleProps = SVGProps<SVGSVGElement>;

export function Cloud({ className = "", ...props }: DoodleProps) {
  return (
    <svg className={className} width="72" height="38" viewBox="0 0 72 38" fill="none" {...props}>
      <path
        d="M18 30c-8 0-12-6-12-12C6 10 12 6 20 8c2-6 10-8 16-4 4-6 16-6 20 0 8-2 18 4 16 14 6 1 10 8 4 12H18Z"
        fill="#f7f1ea"
        stroke="#2c2a22"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function StarDoodle({ className = "", ...props }: DoodleProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
      <path
        d="M9 1.4 10.7 6h4.8L11.8 9.1 13.4 14 9 11.2 4.6 14l1.6-4.9L2.5 6h4.8L9 1.4Z"
        fill="#f4eee9"
        stroke="#2c2a22"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LeafSprig({ className = "", ...props }: DoodleProps) {
  return (
    <svg className={className} width="28" height="22" viewBox="0 0 28 22" fill="none" {...props}>
      <path d="M4 18c8-2 12-8 12-16" stroke="#2c2a22" strokeWidth="1.8" />
      <ellipse cx="9" cy="10" rx="5" ry="3.2" transform="rotate(-30 9 10)" fill="#bbd4ad" stroke="#2c2a22" strokeWidth="1.4" />
      <ellipse cx="16" cy="7" rx="4.4" ry="2.8" transform="rotate(20 16 7)" fill="#8fb57a" stroke="#2c2a22" strokeWidth="1.4" />
    </svg>
  );
}

export function Cottage({ className = "", ...props }: DoodleProps) {
  return (
    <svg className={className} width="86" height="78" viewBox="0 0 86 78" fill="none" {...props}>
      <path d="M8 70V40L43 12l35 28v30H8Z" fill="#f4eee9" stroke="#2c2a22" strokeWidth="2.4" />
      <path d="M8 40 43 12l35 28" fill="#edb7bb" stroke="#2c2a22" strokeWidth="2.4" />
      <rect x="36" y="48" width="14" height="22" rx="2" fill="#c3d8db" stroke="#2c2a22" strokeWidth="1.8" />
      <circle cx="58" cy="46" r="6" fill="#fbf7f2" stroke="#2c2a22" strokeWidth="1.6" />
      <path d="M62 16v10" stroke="#2c2a22" strokeWidth="2.2" />
      <rect x="58" y="8" width="8" height="10" fill="#91777b" stroke="#2c2a22" strokeWidth="1.5" />
    </svg>
  );
}

export function GrassRow({ className = "", ...props }: DoodleProps) {
  return (
    <svg className={className} width="220" height="54" viewBox="0 0 220 54" fill="none" {...props}>
      <path d="M0 54c18-18 22-18 28-6 8-22 16-28 22-8 10-24 20-20 24-4 12-26 22-22 28-2 10-20 22-16 26 2 14-24 30-18 32 2v16H0Z" fill="#bbd4ad" stroke="#2c2a22" strokeWidth="2" />
      <path d="M48 40c2-16 10-22 12-8" stroke="#2c2a22" strokeWidth="1.6" />
      <circle cx="92" cy="24" r="5" fill="#edb7bb" stroke="#2c2a22" strokeWidth="1.4" />
      <circle cx="150" cy="20" r="4.5" fill="#f4eee9" stroke="#2c2a22" strokeWidth="1.4" />
    </svg>
  );
}

export function Tulip({ className = "", ...props }: DoodleProps) {
  return (
    <svg className={className} width="28" height="44" viewBox="0 0 28 44" fill="none" {...props}>
      <path d="M14 44V18" stroke="#2c2a22" strokeWidth="2" />
      <path d="M14 28c-8 0-10 8-10 8" stroke="#2c2a22" strokeWidth="1.6" />
      <path d="M8 18c0-8 6-14 6-14s6 6 6 14c0 6-12 6-12 0Z" fill="#edb7bb" stroke="#2c2a22" strokeWidth="1.6" />
    </svg>
  );
}

export function Moon({ className = "", ...props }: DoodleProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" {...props}>
      <path
        d="M14 3a8.5 8.5 0 1 0 5 14A8.2 8.2 0 0 1 14 3Z"
        fill="#f4eee9"
        stroke="#2c2a22"
        strokeWidth="1.6"
      />
    </svg>
  );
}
