export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '72px', marginBottom: '16px' }}>404</div>
      <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/"
        style={{
          padding: '12px 32px',
          borderRadius: '12px',
          background: 'var(--gradient-brand)',
          color: 'white',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '16px',
        }}
      >
        ← Back to Home
      </a>
    </main>
  );
}
