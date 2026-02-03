import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="content-wrapper">
      <div style={{ marginTop: 16 }}>
        <h1>Page not found</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" style={{ display: 'inline-block', marginTop: 16 }}>
          &lsaquo; Back to Rankings
        </Link>
      </div>
    </main>
  );
}
