import { IconBeacon } from '../marketing-icons';

interface LogoProps {
  size?: 'sm' | 'md';
}

export default function Logo({ size = 'md' }: LogoProps) {
  return (
    <span className="pg-logo">
      <span className="pg-logo-mark" style={size === 'sm' ? { width: 32, height: 32, borderRadius: 9 } : undefined}>
        <IconBeacon />
      </span>
      <span>
        <span className="pg-logo-word" style={size === 'sm' ? { fontSize: 15 } : undefined}>
          Harborlight
        </span>
        <br />
        <span className="pg-logo-sub">CREDIT UNION</span>
      </span>
    </span>
  );
}
