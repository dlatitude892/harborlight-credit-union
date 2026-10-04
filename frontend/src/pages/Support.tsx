import AppLayout from '../components/AppLayout';

export default function Support() {
  return (
    <AppLayout title="Support" subtitle="We're here to help.">
      <div className="card" style={{ padding: 24, maxWidth: 460 }}>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          Reach Harborlight member support by email at{' '}
          <a href="mailto:support@harborlightcreditunion.org" className="link-accent">
            support@harborlightcreditunion.org
          </a>
          , or use the live chat button in the corner of your screen.
        </p>
        <p className="text-secondary" style={{ fontSize: 12.5 }}>
          For lost or stolen cards, freeze your card instantly from the Cards page, then contact support.
        </p>
      </div>
    </AppLayout>
  );
}
