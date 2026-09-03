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
