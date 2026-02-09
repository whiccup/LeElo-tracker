import { getAllGames } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import CombosTable from '@/components/combos/CombosTable';
import RefreshButton from '@/components/ui/RefreshButton';

export default async function CombosPage() {
  const games = await getAllGames();

  const { data: players } = await supabase
    .from('players')
    .select('id, first_name, last_name');

  const nameMap: Record<string, string> = {};
  for (const p of players || []) {
    nameMap[p.id] = `${p.first_name} ${p.last_name}`;
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <main>
      <div className="section-header">
        <h2>Combo Synergies</h2>
      </div>
      <span className="section-meta">Last Updated: {today} <RefreshButton /></span>
      <CombosTable games={games} nameMap={nameMap} />
    </main>
  );
}
