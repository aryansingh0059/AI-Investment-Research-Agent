export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px',
      }}
    >
      <p>
        AI Investment Research Agent · Built with Next.js 15, LangGraph & Google Gemini
      </p>
      <p style={{ marginTop: '4px', fontSize: '11px' }}>
        ⚠️ This is not financial advice. Analysis is AI-generated for research purposes only.
      </p>
    </footer>
  );
}
