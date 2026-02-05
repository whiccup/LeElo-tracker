import RefreshButton from '@/components/ui/RefreshButton';

export default async function ReapingPage() {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main>
      <div className="section-header">
        <h2>Reaping</h2>
        <span className="section-meta">Last Updated: {today} <RefreshButton /></span>
      </div>
    </main>
  );
}
