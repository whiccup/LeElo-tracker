# LeElo Tracker - Frontend Technical Plan

## Project Overview
A Next.js-based basketball league tracker with an old-school Basketball-Reference.com aesthetic. Dense tables, serif fonts, minimal modern UI patterns, maximum information density.

---

## 1. Project Structure

```
leelo-tracker/
├── app/
│   ├── layout.tsx                 # Root layout (site header, meta tags)
│   ├── page.tsx                   # Landing page (player rankings)
│   ├── player/
│   │   └── [id]/
│   │       └── page.tsx           # Player detail page
│   └── globals.css                # Global styles, CSS reset, typography
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # Site header with logo/nav
│   │   └── Footer.tsx             # Optional footer
│   ├── rankings/
│   │   ├── RankingsTable.tsx      # Main player rankings table
│   │   └── RankingsRow.tsx        # Individual table row (optional)
│   ├── player/
│   │   ├── PlayerHeader.tsx       # Player summary card/header
│   │   ├── GameHistoryTable.tsx   # Game-by-game results table
│   │   └── EloChart.tsx           # Elo trend line chart (placeholder)
│   └── ui/
│       ├── SortableHeader.tsx     # Reusable sortable table header
│       └── StatCell.tsx           # Styled table cell component
├── lib/
│   ├── data.ts                    # Data access layer (mock → real swap point)
│   ├── elo.ts                     # Elo calculation utilities (if needed)
│   └── utils.ts                   # General utilities (formatters, etc.)
├── types/
│   └── index.ts                   # TypeScript type definitions
├── public/
│   └── fonts/                     # Custom serif fonts (if not using system)
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 2. Key Dependencies

### Core Framework
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### Additional Libraries (Install as Needed)
- **Charting**: `recharts` (~45KB) - Simple, composable React charts for Elo trend visualization
  - Alternative: `chart.js` + `react-chartjs-2` if more customization needed
  - For MVP: Can use plain SVG/canvas placeholder
- **Date Formatting**: Native `Intl.DateTimeFormat` (no deps needed)
- **CSS**: CSS Modules (built into Next.js, zero deps)

**Philosophy**: Keep dependencies minimal. Avoid heavy UI libraries (MUI, Ant Design). Build table components from scratch to match Basketball-Reference aesthetic.

---

## 3. TypeScript Types

```typescript
// types/index.ts

export interface Player {
  id: string;                    // Unique player identifier
  name: string;                  // Full name
  wins: number;                  // Total wins
  losses: number;                // Total losses
  elo: number;                   // Current Elo rating
  gamesPlayed: number;           // Total games
  winPercentage: number;         // Calculated: wins / gamesPlayed
  streak: number;                // Current streak (positive = wins, negative = losses)
  lastPlayed: string;            // ISO date string of last game
  eloHistory: EloHistoryPoint[]; // Historical Elo data for charting
}

export interface EloHistoryPoint {
  date: string;                  // ISO date string
  elo: number;                   // Elo rating after this game
  gameId: string;                // Reference to game
}

export interface Game {
  id: string;                    // Unique game identifier
  date: string;                  // ISO date string
  teamAPlayers: string[];        // Array of player IDs
  teamBPlayers: string[];        // Array of player IDs
  teamAScore: number;            // Final score for team A
  teamBScore: number;            // Final score for team B
  winner: 'A' | 'B';             // Winning team
}

export interface PlayerGameStats {
  gameId: string;
  date: string;
  teammates: string[];           // Player IDs of teammates
  opponents: string[];           // Player IDs of opponents
  result: 'W' | 'L';             // Win or loss
  teamScore: number;             // Player's team score
  opponentScore: number;         // Opponent team score
  eloChange: number;             // Elo gained/lost (+/-)
  eloAfter: number;              // Elo rating after game
}

// Sorting configuration
export type SortKey = 'rank' | 'name' | 'wins' | 'losses' | 'elo' | 'streak' | 'gamesPlayed' | 'winPercentage' | 'lastPlayed';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}
```

---

## 4. Component Tree

### Landing Page (`/`)
```
page.tsx
└── RankingsTable
    ├── Props: { players: Player[], initialSort?: SortConfig }
    ├── State: sortConfig (current sort column + direction)
    ├── Responsibilities:
    │   - Render sortable table of all players
    │   - Handle column header clicks for sorting
    │   - Navigate to player detail on row click
    └── Children:
        └── SortableHeader (reusable)
            ├── Props: { label: string, sortKey: SortKey, currentSort: SortConfig, onSort: (key: SortKey) => void }
            └── Responsibilities: Render ↑/↓ indicators, trigger sort
```

### Player Detail Page (`/player/[id]`)
```
page.tsx
├── PlayerHeader
│   ├── Props: { player: Player }
│   └── Responsibilities:
│       - Display player name, current Elo, W-L record, streak
│       - Summary stats in card/header format
├── EloChart
│   ├── Props: { eloHistory: EloHistoryPoint[] }
│   └── Responsibilities:
│       - Line chart showing Elo trend over time
│       - X-axis: dates, Y-axis: Elo rating
│       - For MVP: Can be a styled <div>Elo Chart Placeholder</div>
└── GameHistoryTable
    ├── Props: { games: PlayerGameStats[] }
    └── Responsibilities:
        - Table of all games for this player
        - Columns: Date, Result (W/L), Score, Opponents, Elo Change, Elo After
        - Sortable by date (most recent first)
```

### Layout Components
```
Header
├── Props: none (or { siteName: string })
└── Responsibilities:
    - Site logo/title "LeElo Tracker"
    - Navigation link back to home (if on player detail page)
    - Minimal styling, always visible

Footer (optional)
├── Props: none
└── Responsibilities:
    - Copyright, links, minimal info
```

### Utility Components
```
SortableHeader
├── Props: { label: string, sortKey: SortKey, currentSort: SortConfig, onSort: Function }
└── Responsibilities:
    - Render table header with sort indicators
    - Toggle sort direction on click

StatCell
├── Props: { value: string | number, align?: 'left' | 'right', highlight?: boolean }
└── Responsibilities:
    - Standardized table cell with consistent padding/typography
    - Conditional highlighting (e.g., positive Elo green, negative red)
```

---

## 5. Data Layer Abstraction

**Goal**: Isolate all data fetching in `/lib/data.ts` so swapping mock → real API/DB requires changes in only one file.

```typescript
// lib/data.ts

import { Player, Game, PlayerGameStats } from '@/types';

/**
 * Data access layer.
 * All functions return Promises to simulate async operations.
 * Replace mock implementations with real API/DB calls later.
 */

// Mock data imports (for now)
import { mockPlayers, mockGames } from './mockData';

export async function getPlayers(): Promise<Player[]> {
  // TODO: Replace with fetch('/api/players') or DB query
  return Promise.resolve(mockPlayers);
}

export async function getPlayerById(id: string): Promise<Player | null> {
  // TODO: Replace with fetch(`/api/players/${id}`) or DB query
  const player = mockPlayers.find(p => p.id === id);
  return Promise.resolve(player || null);
}

export async function getPlayerGameHistory(playerId: string): Promise<PlayerGameStats[]> {
  // TODO: Replace with fetch(`/api/players/${playerId}/games`) or DB query
  const playerGames = mockGames
    .filter(game =>
      game.teamAPlayers.includes(playerId) ||
      game.teamBPlayers.includes(playerId)
    )
    .map(game => {
      const isTeamA = game.teamAPlayers.includes(playerId);
      const result = (isTeamA && game.winner === 'A') || (!isTeamA && game.winner === 'B') ? 'W' : 'L';

      return {
        gameId: game.id,
        date: game.date,
        teammates: isTeamA ? game.teamAPlayers.filter(id => id !== playerId) : game.teamBPlayers.filter(id => id !== playerId),
        opponents: isTeamA ? game.teamBPlayers : game.teamAPlayers,
        result,
        teamScore: isTeamA ? game.teamAScore : game.teamBScore,
        opponentScore: isTeamA ? game.teamBScore : game.teamAScore,
        eloChange: 0, // Calculate from eloHistory
        eloAfter: 0,  // Calculate from eloHistory
      } as PlayerGameStats;
    });

  return Promise.resolve(playerGames);
}

export async function getAllGames(): Promise<Game[]> {
  // TODO: Replace with fetch('/api/games') or DB query
  return Promise.resolve(mockGames);
}
```

**Migration Strategy**:
1. During development: All functions return mock data
2. When backend is ready: Replace function bodies with API calls (e.g., `fetch()` or `axios`)
3. No component code changes required

---

## 6. Routing Plan (Next.js App Router)

### Routes
```
/ (app/page.tsx)
├── Server Component (default)
├── Fetches all players via getPlayers()
├── Passes data to RankingsTable client component
└── Metadata: { title: 'LeElo Tracker - Player Rankings' }

/player/[id] (app/player/[id]/page.tsx)
├── Dynamic route with id parameter
├── Server Component
├── Fetches player data via getPlayerById(id)
├── Fetches game history via getPlayerGameHistory(id)
├── Passes data to PlayerHeader, EloChart, GameHistoryTable
├── Returns 404 if player not found
└── Metadata: { title: `${player.name} - LeElo Tracker` }
```

### Layout Hierarchy
```
app/layout.tsx (root layout)
├── Wraps all pages
├── Includes <Header />
├── Defines global <html>, <body>, fonts, meta tags
└── Loads globals.css

app/page.tsx
└── Uses root layout

app/player/[id]/page.tsx
└── Uses root layout
```

### Navigation
- **Home → Player Detail**: Click any row in RankingsTable → `router.push(/player/${playerId})`
- **Player Detail → Home**: Click site title/logo in Header → `router.push(/)`

---

## 7. Styling Approach

### Recommendation: **CSS Modules**

**Why CSS Modules for this project:**
1. **Matches old-school aesthetic**: More control over raw HTML/CSS, less abstraction than Tailwind
2. **Basketball-Reference.com inspiration**: That site uses traditional CSS, not utility classes
3. **Zero dependencies**: Built into Next.js
4. **Component-scoped**: Avoid global namespace pollution
5. **Performance**: No runtime JS, pure CSS

**Alternative considered:**
- Tailwind: Too modern/utility-focused, harder to achieve dense table layouts without fighting the framework
- styled-components: Runtime overhead, unnecessary for server components

### Typography & Color Palette
```css
/* app/globals.css */

:root {
  /* Colors - Basketball-Reference inspired */
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-link: #0033cc;
  --color-link-hover: #cc0000;
  --color-border: #cccccc;
  --color-header-bg: #f0f0f0;
  --color-row-hover: #ffffcc;
  --color-positive: #008000; /* Green for positive stats */
  --color-negative: #cc0000; /* Red for negative stats */

  /* Typography */
  --font-serif: 'Georgia', 'Times New Roman', serif;
  --font-sans: 'Arial', 'Helvetica', sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

body {
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: var(--color-link);
  text-decoration: none;
}

a:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}

/* Table defaults */
table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}

th, td {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  text-align: left;
}

th {
  background: var(--color-header-bg);
  font-weight: bold;
  cursor: pointer;
  user-select: none;
}
```

### Component-Level Example
```css
/* components/rankings/RankingsTable.module.css */

.table {
  margin: 20px auto;
  max-width: 1200px;
}

.row {
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.row:hover {
  background-color: var(--color-row-hover);
}

.alignRight {
  text-align: right;
}

.positive {
  color: var(--color-positive);
}

.negative {
  color: var(--color-negative);
}
```

---

## 8. Mock Data Shape

### Sample Players
```typescript
// lib/mockData.ts

import { Player, Game } from '@/types';

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'LeBron James',
    wins: 12,
    losses: 3,
    elo: 1650,
    gamesPlayed: 15,
    winPercentage: 0.800,
    streak: 3, // 3-game win streak
    lastPlayed: '2024-02-01T19:30:00Z',
    eloHistory: [
      { date: '2024-01-15T19:00:00Z', elo: 1500, gameId: 'g1' },
      { date: '2024-01-17T19:00:00Z', elo: 1520, gameId: 'g2' },
      { date: '2024-01-20T19:00:00Z', elo: 1510, gameId: 'g3' },
      { date: '2024-01-24T19:00:00Z', elo: 1540, gameId: 'g4' },
      { date: '2024-02-01T19:30:00Z', elo: 1650, gameId: 'g15' },
    ],
  },
  {
    id: 'p2',
    name: 'Stephen Curry',
    wins: 10,
    losses: 5,
    elo: 1580,
    gamesPlayed: 15,
    winPercentage: 0.667,
    streak: -1, // 1-game loss streak
    lastPlayed: '2024-02-01T19:30:00Z',
    eloHistory: [
      { date: '2024-01-15T19:00:00Z', elo: 1500, gameId: 'g1' },
      { date: '2024-01-18T19:00:00Z', elo: 1490, gameId: 'g5' },
      { date: '2024-02-01T19:30:00Z', elo: 1580, gameId: 'g14' },
    ],
  },
  {
    id: 'p3',
    name: 'Kevin Durant',
    wins: 11,
    losses: 4,
    elo: 1620,
    gamesPlayed: 15,
    winPercentage: 0.733,
    streak: 2,
    lastPlayed: '2024-01-31T19:00:00Z',
    eloHistory: [
      { date: '2024-01-15T19:00:00Z', elo: 1500, gameId: 'g2' },
      { date: '2024-01-31T19:00:00Z', elo: 1620, gameId: 'g13' },
    ],
  },
  {
    id: 'p4',
    name: 'Giannis Antetokounmpo',
    wins: 8,
    losses: 7,
    elo: 1490,
    gamesPlayed: 15,
    winPercentage: 0.533,
    streak: -2,
    lastPlayed: '2024-01-30T19:00:00Z',
    eloHistory: [
      { date: '2024-01-15T19:00:00Z', elo: 1500, gameId: 'g1' },
      { date: '2024-01-30T19:00:00Z', elo: 1490, gameId: 'g12' },
    ],
  },
  {
    id: 'p5',
    name: 'Luka Doncic',
    wins: 6,
    losses: 9,
    elo: 1420,
    gamesPlayed: 15,
    winPercentage: 0.400,
    streak: 1,
    lastPlayed: '2024-02-01T19:30:00Z',
    eloHistory: [
      { date: '2024-01-15T19:00:00Z', elo: 1500, gameId: 'g3' },
      { date: '2024-02-01T19:30:00Z', elo: 1420, gameId: 'g15' },
    ],
  },
];

export const mockGames: Game[] = [
  {
    id: 'g1',
    date: '2024-01-15T19:00:00Z',
    teamAPlayers: ['p1', 'p2', 'p6', 'p7', 'p8'],
    teamBPlayers: ['p3', 'p4', 'p9', 'p10', 'p11'],
    teamAScore: 21,
    teamBScore: 15,
    winner: 'A',
  },
  {
    id: 'g2',
    date: '2024-01-17T19:00:00Z',
    teamAPlayers: ['p1', 'p3', 'p12', 'p13', 'p14'],
    teamBPlayers: ['p2', 'p5', 'p15', 'p16', 'p17'],
    teamAScore: 21,
    teamBScore: 18,
    winner: 'A',
  },
  {
    id: 'g3',
    date: '2024-01-20T19:00:00Z',
    teamAPlayers: ['p4', 'p5', 'p6', 'p7', 'p8'],
    teamBPlayers: ['p1', 'p2', 'p3', 'p9', 'p10'],
    teamAScore: 19,
    teamBScore: 21,
    winner: 'B',
  },
  // Add more games as needed for realistic game history
];

// Helper: Generate more players
export function generateMockPlayers(count: number): Player[] {
  const names = [
    'Jayson Tatum', 'Joel Embiid', 'Nikola Jokic', 'Damian Lillard',
    'Anthony Davis', 'Kawhi Leonard', 'Jimmy Butler', 'Devin Booker',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 6}`,
    name: names[i % names.length] || `Player ${i + 6}`,
    wins: Math.floor(Math.random() * 15),
    losses: Math.floor(Math.random() * 15),
    elo: 1400 + Math.floor(Math.random() * 300),
    gamesPlayed: 15,
    winPercentage: 0.5,
    streak: Math.floor(Math.random() * 7) - 3,
    lastPlayed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    eloHistory: [],
  }));
}
```

---

## 9. Implementation Checklist

### Phase 1: Scaffolding
- [ ] Initialize Next.js project with TypeScript: `npx create-next-app@latest leelo-tracker --typescript --app --no-tailwind`
- [ ] Set up folder structure (`components/`, `lib/`, `types/`)
- [ ] Create type definitions in `types/index.ts`
- [ ] Set up CSS Modules and `globals.css` with Basketball-Reference variables

### Phase 2: Mock Data Layer
- [ ] Create `lib/mockData.ts` with sample players and games
- [ ] Create `lib/data.ts` with data access functions
- [ ] Create `lib/utils.ts` for date formatters, win% calculators, etc.

### Phase 3: Landing Page
- [ ] Build `Header` component
- [ ] Build `SortableHeader` component
- [ ] Build `RankingsTable` component with sorting logic
- [ ] Implement `app/page.tsx` server component
- [ ] Test sorting, row clicks, navigation

### Phase 4: Player Detail Page
- [ ] Build `PlayerHeader` component
- [ ] Build `GameHistoryTable` component
- [ ] Build `EloChart` placeholder (styled div)
- [ ] Implement `app/player/[id]/page.tsx` with data fetching
- [ ] Handle 404 for invalid player IDs

### Phase 5: Polish
- [ ] Add loading states (Next.js `loading.tsx`)
- [ ] Add error boundaries (`error.tsx`)
- [ ] Responsive styles for mobile (optional, if needed)
- [ ] SEO metadata for all pages
- [ ] Performance audit (should be fast with SSR + no heavy deps)

### Phase 6: Future Enhancements (Post-MVP)
- [ ] Integrate `recharts` for real Elo trend chart
- [ ] Add filtering (e.g., active players only, date ranges)
- [ ] Add search functionality
- [ ] Swap mock data layer with real API/database
- [ ] Add more stats (points scored, head-to-head records, etc.)

---

## 10. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR for fast initial load, SEO-friendly, built-in routing |
| **Styling** | CSS Modules | Best fit for old-school aesthetic, zero deps, full control |
| **State Management** | React useState (local) | No global state needed for MVP, keep it simple |
| **Data Fetching** | Server Components | Fetch on server, reduce client JS, better performance |
| **Charting** | Placeholder → recharts later | Avoid premature dependency, add when needed |
| **TypeScript** | Strict mode | Catch bugs early, better DX, required for maintainability |
| **Testing** | Not in MVP scope | Add Jest/Playwright later if project scales |

---

## 11. File Template Examples

### Example: `app/page.tsx`
```typescript
// app/page.tsx
import { getPlayers } from '@/lib/data';
import RankingsTable from '@/components/rankings/RankingsTable';

export const metadata = {
  title: 'LeElo Tracker - Player Rankings',
  description: 'Basketball league player rankings and Elo ratings',
};

export default async function HomePage() {
  const players = await getPlayers();

  return (
    <main>
      <h1>Player Rankings</h1>
      <RankingsTable players={players} />
    </main>
  );
}
```

### Example: `components/rankings/RankingsTable.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player, SortConfig } from '@/types';
import styles from './RankingsTable.module.css';

interface Props {
  players: Player[];
  initialSort?: SortConfig;
}

export default function RankingsTable({ players, initialSort }: Props) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    initialSort || { key: 'elo', direction: 'desc' }
  );

  // Sorting logic
  const sortedPlayers = [...players].sort((a, b) => {
    const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
    return (a[sortConfig.key] > b[sortConfig.key] ? 1 : -1) * multiplier;
  });

  const handleSort = (key: SortKey) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc',
    });
  };

  const handleRowClick = (playerId: string) => {
    router.push(`/player/${playerId}`);
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <SortableHeader label="Rank" sortKey="elo" {...sortConfig} onSort={handleSort} />
          <SortableHeader label="Name" sortKey="name" {...sortConfig} onSort={handleSort} />
          {/* More headers... */}
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map((player, index) => (
          <tr key={player.id} className={styles.row} onClick={() => handleRowClick(player.id)}>
            <td>{index + 1}</td>
            <td>{player.name}</td>
            {/* More cells... */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Summary

This plan provides a complete blueprint for building the LeElo Tracker frontend with:
- Clean separation between UI and data (easy to swap mock → real data)
- Minimal dependencies (Next.js + TypeScript core, optional recharts later)
- Old-school Basketball-Reference aesthetic via CSS Modules
- Type-safe development with comprehensive TypeScript definitions
- Server-side rendering for performance and SEO
- Clear component hierarchy and responsibilities

**Next Steps**: Review plan, get approval, then begin Phase 1 implementation.
