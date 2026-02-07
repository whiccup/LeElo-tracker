# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeElo Tracker is a Next.js 14 basketball Elo rating tracker with a classic Basketball-Reference.com aesthetic. It tracks pickup basketball games, calculates team-based Elo ratings, and displays player rankings, game history, and team chemistry analytics.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Supabase (PostgreSQL backend)
- CSS Modules for styling
- No UI library dependencies

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture Overview

### Data Flow Pattern

1. **Server Pages** (`app/**page.tsx`) fetch data via `lib/data.ts` functions using direct Supabase queries
2. **Server components** pass data as props to **client components** for interactivity
3. **Client components** handle sorting, filtering, and UI state with `useState`/`useMemo`
4. **API routes** (`app/api/**/route.ts`) handle mutations and revalidate paths with `revalidatePath()`

### Database Schema (Supabase)

**players table:**
- `id` (text, PK)
- `first_name`, `last_name` (text)
- `elo` (integer, default 1000)
- `email`, `phone`, `venmo_user`, `player_notes` (text, optional)
- `last_game` (date)

**games table:**
- `id` (text, PK)
- `date` (date)
- `team_a_score`, `team_b_score` (integer)
- `winner` ('A' or 'B')

**game_players table (junction):**
- `game_id` (FK to games)
- `player_id` (FK to players)
- `team` ('A' or 'B')
- `elo_after` (integer) - player's Elo after this game

**reaping table:**
- `id` (text, PK)
- `date` (date)

**reaping_players table:**
- `reaping_id` (FK)
- `player_id` (FK)
- `excluded` (boolean)

### Elo Calculation System

The Elo algorithm is implemented in `app/api/games/route.ts`:

1. **Team Rating** = Average of all player Elos on the team
2. **Expected Win Probability** = `1 / (1 + 10^((opponentElo - teamElo) / 400))`
3. **K-Factor**: Placement games (first 5) use K=40, regular games use K=20
4. **Margin of Victory Multiplier** = `log(pointDiff + 1)`
5. **Team Size Multiplier**: 4v4 or smaller = 1.1, 5v5 = 1.0
6. **Elo Change** = `K × MOV × teamSize × (actual - expected)`
7. Each player on winning team gains points; each on losing team loses points

Maximum team size is **5 players per team** (enforced in UI and should be validated in API).

### Component Organization

**Server Components (data fetching):**
- `app/page.tsx` - Rankings home page
- `app/player/[id]/page.tsx` - Individual player detail
- `app/games/page.tsx` - All games list
- `app/combos/page.tsx` - Team chemistry analysis

**Client Components (interactivity):**
- `components/rankings/RankingsTable.tsx` - Sortable rankings table
- `components/player/GameHistoryTable.tsx` - Player's game history with sorting
- `components/player/EloChart.tsx` - Elo trend visualization
- `components/ui/SortableHeader.tsx` - Reusable sortable column header
- `components/layout/Header.tsx` - Navigation with dropdown menus

**Form Pages (client components):**
- `app/player/new/page.tsx` - Add new player (stays on page after submit, clears form)
- `app/game/new/page.tsx` - Add new game (stays on page after submit, clears form)

### Type System

All types are centralized in `types/index.ts`:

- `Player` - Full player object with computed stats
- `PlayerGameStats` - Individual game from player's perspective
- `Game` - Game record with team rosters and scores
- `EloHistoryPoint` - Single point in Elo history chart
- `SortConfig` / `GameSortConfig` - Sorting state for tables (key + direction)

Each sortable table defines its own `SortKey` type (e.g., `'rank' | 'name' | 'elo'`).

## Styling Conventions

### CSS Custom Properties

Use these variables defined in `app/globals.css`:

**Colors:**
- `--bg-primary`, `--bg-secondary`, `--bg-table-stripe`, `--bg-table-header`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--accent-blue`, `--accent-red`, `--accent-green`, `--accent-orange`
- `--border-default`, `--border-strong`

**Typography:**
- Sizes: `--text-xs` (11px) through `--text-2xl` (24px)
- Weights: `--font-normal`, `--font-bold`
- Font: `--font-sans` (Georgia serif)

**Spacing:**
- `--space-xs` through `--space-2xl`

### Table Styling Pattern

Standard table CSS classes (defined per-component in CSS Modules):

```css
.wrapper { /* scrollable container */ }
.table { /* table element */ }
.stripe { /* alternating row background */ }
.center { text-align: center; }
.mono { font-family: monospace; }
.bold { font-weight: var(--font-bold); }
.positive { color: var(--accent-green); }
.negative { color: var(--accent-red); }
.footer { /* table footer with counts */ }
```

### Component CSS Files

Every component with styles has a co-located `.module.css` file:
- `Header.tsx` → `Header.module.css`
- `page.tsx` → `page.module.css`

## Key Implementation Patterns

### Sorting Tables

Client components use this pattern:

```typescript
const [sortConfig, setSortConfig] = useState<SortConfig>({
  key: 'elo',
  direction: 'desc'
});

const handleSort = (key: string) => {
  setSortConfig(prev => ({
    key: key as SortKey,
    direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
  }));
};

const sorted = useMemo(() =>
  [...data].sort((a, b) => {
    // sorting logic based on sortConfig
  }),
  [data, sortConfig]
);
```

Use `<SortableHeader>` component for column headers.

### Form Submission (Data Entry)

Data entry forms (`/player/new`, `/game/new`):
- Submit to API route via `fetch()`
- On success: **stay on page**, clear form, show success message
- On error: show error message, keep form data
- Use `router.refresh()` only when navigating away

### Player Selection in Game Entry

`app/game/new/page.tsx` uses multi-select dropdowns:
- Players appear in dropdown only if not already assigned to either team
- Maximum 5 players per team (enforced by hiding dropdown when `team.length >= 5`)
- Display "Maximum of 5 players reached" message at capacity

### TypeScript Gotchas

- Target doesn't support `--downlevelIteration`
- Use `Array.from(map.values())` instead of `for...of map.values()` directly

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Supabase client is configured with `cache: 'no-store'` in `lib/supabase.ts` to prevent stale data.

## Design Philosophy

**From DESIGN.md:**
- Basketball-Reference.com inspired aesthetic
- Dense, data-rich tables with minimal whitespace
- Classic serif typography (Georgia)
- No rounded corners, no shadows, no gradients
- Information density over modern minimalism
- Desktop-first, responsive mobile support

**Component Philosophy:**
- Build UI components from scratch (no UI library)
- Server components for data fetching
- Client components only when needed for interactivity
- CSS Modules for all styling
- Minimize dependencies
