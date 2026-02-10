import { getPlayers } from '@/lib/data';
import RankingsTable from '@/components/rankings/RankingsTable';
import RefreshButton from '@/components/ui/RefreshButton';

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
        <h2>Player Rankings</h2>
      </div>
      <span className="section-meta">Last Updated: {today} <RefreshButton /></span>
      <RankingsTable players={players} />
    </main>
  );
}
