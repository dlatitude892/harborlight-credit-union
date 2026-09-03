import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3 4.5 6v6c0 5 3.2 8.3 7.5 9.9 4.3-1.6 7.5-4.9 7.5-9.9V6L12 3Z" />
    <path d="m8.5 12 2.3 2.3L15.5 10" />
  </svg>
);

export const IconTrendingUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);

export const IconHouse = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const IconPiggyBank = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 12a5 5 0 0 1 5-5h6.5L19 5v4l-1.5 1H15" />
    <path d="M4 12v3a2 2 0 0 0 2 2h.5l.5 3h2l.3-3H14l.3 3h2l.4-2.6A5 5 0 0 0 19 12" />
    <circle cx="15.5" cy="10" r="0.6" fill="currentColor" />
    <path d="M4 12H2.5" />
  </svg>
);

export const IconStar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6-4.9-4.6 6.6-.8Z" />
  </svg>
);

export const IconQuote = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M9.5 6C6.5 7.3 5 9.6 5 12.6c0 2.2 1.3 3.7 3.2 3.7 1.6 0 2.8-1.2 2.8-2.7 0-1.4-1-2.5-2.4-2.5-.2 0-.4 0-.5.1.2-1.6 1.4-3 3.1-3.7L9.5 6Zm8 0c-3 1.3-4.5 3.6-4.5 6.6 0 2.2 1.3 3.7 3.2 3.7 1.6 0 2.8-1.2 2.8-2.7 0-1.4-1-2.5-2.4-2.5-.2 0-.4 0-.5.1.2-1.6 1.4-3 3.1-3.7L17.5 6Z" />
  </svg>
);

export const IconChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconGraduationCap = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" />
    <path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" />
    <path d="M21 9.5V15" />
  </svg>
);

export const IconUsers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
    <path d="M16 8.2a3 3 0 1 1 3.5 3" />
    <path d="M21.5 19c-.1-2.4-1.6-4.2-3.8-5" />
  </svg>
);

export const IconBeacon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} stroke="white">
    <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <path d="m6 6 2.1 2.1M15.9 15.9 18 18M6 18l2.1-2.1M15.9 8.1 18 6" strokeOpacity="0.6" />
  </svg>
);

export const IconGlobe = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
  </svg>
);

export const IconMobile = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.2" />
    <path d="M10.5 18.5h3" />
  </svg>
);

export const IconATM = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="14" rx="1.8" />
    <rect x="6.5" y="7.5" width="6" height="4.5" rx="0.5" />
    <path d="M15 8h3M15 10.5h3M6.5 15h11" />
  </svg>
);

export const IconLock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </svg>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m5 13 4.5 4.5L19 8" />
  </svg>
);

export const IconMail = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 6.5 8 6 8-6" />
  </svg>
);

export const IconPhoneCall = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5.5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4Z" />
  </svg>
);
