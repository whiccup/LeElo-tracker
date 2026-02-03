import { getPlayers } from '@/lib/data';
import RankingsTable from '@/components/rankings/RankingsTable';

export default async function HomePage() {
  const players = await getPlayers();

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main>
      <div className="section-header">
        <h2>Player Rankings<span style={{ fontSize: '11px', fontWeight: 400, color: '#0645ad', marginLeft: '8px' }}>[edit]</span></h2>
        <span className="section-meta">Last Updated: {today}</span>
      </div>
      <RankingsTable players={players} />
    </main>
  );
}
