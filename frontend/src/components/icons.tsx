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

export const IconHome = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
);

export const IconWallet = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" />
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a1 1 0 0 0-1-1h-4a2.5 2.5 0 0 0 0 5h5" />
  </svg>
);

export const IconSwap = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m4 8 4-4 4 4" />
    <path d="M8 4v13" />
    <path d="m20 16-4 4-4-4" />
    <path d="M16 20V7" />
  </svg>
);

export const IconHistory = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export const IconCard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
    <path d="M2.5 10h19" />
    <path d="M6 15h4" />
  </svg>
);

export const IconSettings = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l2-1.3-2-3.4-2.3.8a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.6a7.6 7.6 0 0 0-2.6 1.5l-2.3-.8-2 3.4 2 1.3a7.7 7.7 0 0 0 0 3l-2 1.3 2 3.4 2.3-.8a7.6 7.6 0 0 0 2.6 1.5l.5 2.6h4l.5-2.6a7.6 7.6 0 0 0 2.6-1.5l2.3.8 2-3.4-2-1.3Z" />
  </svg>
);

export const IconSupport = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <path d="M4 13a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v-5H4Z" />
    <path d="M20 13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v-5h1Z" />
    <path d="M18 18v1a2 2 0 0 1-2 2h-3" />
  </svg>
);

export const IconSend = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" />
  </svg>
);

export const IconBill = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </svg>
);

export const IconArrowDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 4v16" />
    <path d="m6 14 6 6 6-6" />
  </svg>
);

export const IconArrowUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 20V4" />
    <path d="m6 10 6-6 6 6" />
  </svg>
);

export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconDownload = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 19h16" />
  </svg>
);

export const IconChatBubble = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
  </svg>
);

export const IconPaperPlane = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" />
  </svg>
);

export const IconAnchorMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} stroke="white">
    <circle cx="12" cy="6" r="2" />
    <path d="M12 8v11" />
    <path d="M6 14a6 6 0 0 0 12 0" />
    <path d="M4 14h4M16 14h4" />
  </svg>
);

export const IconBell = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const IconGlobe = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9Z" />
  </svg>
);

export const IconSun = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2" />
    <path d="M12 19.3v2.2" />
    <path d="M4.4 4.4l1.6 1.6" />
    <path d="M18 18l1.6 1.6" />
    <path d="M2.5 12h2.2" />
    <path d="M19.3 12h2.2" />
    <path d="M4.4 19.6l1.6-1.6" />
    <path d="M18 6l1.6-1.6" />
  </svg>
);

export const IconMoon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
  </svg>
);

export const IconCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export const IconChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconEye = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.4 4.4" />
    <path d="M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.4-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
);

export const IconDeposit = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="13" rx="2" />
    <path d="m3 8 9 6 9-6" />
    <path d="M12 11v6" />
    <path d="m9 15 3 2 3-2" />
  </svg>
);

export const IconUser = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
  </svg>
);

export const IconShieldCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconTrendingUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </svg>
);
