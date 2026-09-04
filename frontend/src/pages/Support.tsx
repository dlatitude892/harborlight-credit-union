import AppLayout from '../components/AppLayout';

export default function Support() {
  return (
    <AppLayout title="Support" subtitle="We're here to help.">
      <div className="card" style={{ padding: 24, maxWidth: 460 }}>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Reach Harborlight member support at{' '}
          <a href="mailto:support@harborlight.example" className="link-accent">
            support@harborlight.example
          </a>{' '}
          or call <span className="mono-figure">1-800-555-0139</span>, Monday through Saturday, 8am–8pm.
        </p>
        <p className="text-secondary" style={{ fontSize: 12.5 }}>
          For lost or stolen cards, freeze your card instantly from the Cards page, then contact support.
        </p>
      </div>
    </AppLayout>
  );
}
