# LeElo Tracker - UI/UX Design Document

## Project Overview
A team-based pickup basketball league tracker featuring an Elo rating system with a classic, data-dense aesthetic inspired by Basketball-Reference.com. Built with Next.js + React.

**Target Users:** Basketball league participants, stats enthusiasts, league organizers
**Primary Use Case:** Quick reference for player rankings, performance tracking, and historical game data
**Platform Priority:** Desktop-first, with responsive mobile support

---

## 1. Visual Style Guide

### Color Palette

The color scheme evokes classic sports reference sites: understated, professional, and optimized for readability during extended browsing sessions.

**Primary Colors:**
- `--bg-primary`: #F8F5F0 (Cream/off-white - main background)
- `--bg-secondary`: #FFFFFF (White - table headers, cards)
- `--bg-table-stripe`: #F0EDE6 (Light beige - alternating table rows)
- `--text-primary`: #222222 (Near-black - body text)
- `--text-secondary`: #555555 (Dark gray - secondary text, metadata)
- `--text-tertiary`: #888888 (Medium gray - table borders, dividers)

**Accent Colors:**
- `--accent-blue`: #1E5A9E (Classic blue - links, sortable headers)
- `--accent-blue-hover`: #164578 (Darker blue - hover states)
- `--accent-red`: #C8424A (Muted red - negative streaks, losses)
- `--accent-green`: #3A7D4E (Muted green - positive streaks, wins)
- `--accent-orange`: #D47735 (Burnt orange - highlights, current player)

**Functional Colors:**
- `--border-default`: #CCCCCC (Light gray - table borders)
- `--border-strong`: #999999 (Medium gray - section dividers)
- `--shadow-subtle`: rgba(0, 0, 0, 0.08) (Subtle shadows)

### Typography

Classic, highly readable typography hierarchy inspired by traditional print sports reference guides.

**Font Families:**
```css
--font-serif: 'PT Serif', 'Georgia', 'Times New Roman', serif;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'IBM Plex Mono', 'Courier New', monospace;
```

**Type Scale:**
- Page Title (h1): 32px/1.2, PT Serif, 700 weight, --text-primary
- Section Header (h2): 24px/1.3, PT Serif, 700 weight, --text-primary
- Subsection (h3): 18px/1.4, PT Serif, 600 weight, --text-primary
- Table Header: 14px/1.4, Inter, 700 weight, --text-primary, uppercase, letter-spacing: 0.5px
- Body Text: 15px/1.5, Inter, 400 weight, --text-primary
- Table Cell: 14px/1.4, Inter, 400 weight, --text-primary
- Small Text: 13px/1.4, Inter, 400 weight, --text-secondary
- Data/Stats: 14px/1.3, IBM Plex Mono, 500 weight (for numerical data)

**Font Usage Guidelines:**
- Serif (PT Serif): Page titles, section headers, player names in headers
- Sans-serif (Inter): Body text, table data, UI elements, navigation
- Monospace (IBM Plex Mono): Numerical stats, Elo ratings, percentages

### Spacing System

Dense but organized spacing reflecting traditional sports reference sites.

```css
--space-xs: 4px;   /* Tight spacing within components */
--space-sm: 8px;   /* Table cell padding, small gaps */
--space-md: 16px;  /* Standard vertical rhythm, section padding */
--space-lg: 24px;  /* Section separation */
--space-xl: 32px;  /* Major section breaks */
--space-2xl: 48px; /* Page-level spacing */
```

### Layout Grid

**Desktop (1024px+):**
- Max content width: 1400px
- Side margins: 32px
- Table width: 100% of content area

**Tablet (768px - 1023px):**
- Side margins: 24px
- Horizontal scroll enabled for wide tables

**Mobile (<768px):**
- Side margins: 16px
- Simplified table view with key columns only
- Additional data revealed via expand/collapse

---

## 2. Landing Page - Player Rankings

### Purpose
Primary entry point displaying all players ranked by Elo rating. Users can quickly scan rankings, identify trends, and navigate to individual player pages.

### ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  LEELO TRACKER                                          [About] [Add Game]  │
│  Basketball League Rankings                                                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Player Rankings                                Last Updated: Feb 2, 2026  │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Rank ▴│ Name ▾        │  W │  L │ Elo ▾ │ Streak │  GP │ Win% │ Last │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │   1   │ Jordan Wells  │ 24 │  8 │ 1687  │  W5 ✓  │ 32  │ .750 │ 2/1  │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │   2   │ Sarah Chen    │ 21 │  9 │ 1654  │  W3 ✓  │ 30  │ .700 │ 2/1  │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │   3   │ Marcus Brown  │ 19 │ 11 │ 1621  │  L1 ✗  │ 30  │ .633 │ 2/1  │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │   4   │ Alex Rivera   │ 18 │ 10 │ 1598  │  W2 ✓  │ 28  │ .643 │ 1/30 │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │   5   │ Jamie Lee     │ 17 │ 11 │ 1582  │  W1 ✓  │ 28  │ .607 │ 1/30 │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │  ...  │               │    │    │       │        │     │      │      │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │  24   │ Chris Park    │  8 │ 22 │ 1289  │  L4 ✗  │ 30  │ .267 │ 1/28 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  24 players                                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layout Specifications

**Header Section:**
- Site logo/title (h1): "LEELO TRACKER" - PT Serif, 32px, bold
- Subtitle: "Basketball League Rankings" - Inter, 15px, --text-secondary
- Navigation links: Top right, Inter, 14px, --accent-blue
- Vertical spacing: 32px top/bottom padding

**Stats Table:**
- Section header: "Player Rankings" (h2) - PT Serif, 24px, bold
- Meta info: "Last Updated: [date]" - Inter, 13px, --text-secondary, aligned right
- Horizontal rule: 2px solid --border-strong, below header

**Table Structure:**
```
Column Layout (desktop):
- Rank: 60px, center-aligned, monospace
- Name: flexible (min 180px), left-aligned, serif for names
- W (Wins): 50px, center-aligned, monospace
- L (Losses): 50px, center-aligned, monospace
- Elo: 80px, center-aligned, monospace, bold
- Streak: 80px, center-aligned (e.g., "W5 ✓" in green, "L3 ✗" in red)
- GP (Games Played): 60px, center-aligned, monospace
- Win%: 70px, center-aligned, monospace
- Last: 70px, center-aligned (date format: M/D)

Total min-width: ~700px
```

**Table Styling:**
- Header row: --bg-secondary background, --border-default bottom border (2px)
- Data rows: Alternating --bg-primary / --bg-table-stripe
- Row height: 44px (comfortable for clicking)
- Cell padding: 8px vertical, 12px horizontal
- Border: 1px solid --border-default around entire table

### Interactive States

**Column Headers (Sortable):**
- Default: --text-primary, cursor pointer
- Hover: --accent-blue, underline
- Active sort: --accent-blue, bold, arrow indicator (▴ asc / ▾ desc)

**Table Rows:**
- Default: Background as specified above
- Hover: --bg-secondary with --shadow-subtle, cursor pointer, smooth 150ms transition
- Active/Click: Brief --accent-orange tint (50ms) before navigation

**Streak Indicators:**
- Win streak: Green text (--accent-green), checkmark ✓
- Loss streak: Red text (--accent-red), X ✗
- Neutral (alternating): Gray text (--text-secondary)

---

## 3. Player Detail Page

### Purpose
Deep-dive into individual player performance with historical context, game-by-game results, and Elo trend visualization.

### ASCII Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  LEELO TRACKER                                          [About] [Rankings]  │
│  ‹ Back to Rankings                                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     JORDAN WELLS                                    │   │
│  │                     Rank #1 • 1687 Elo                              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  24-8 Record  •  .750 Win%  •  32 Games  •  W5 Current Streak      │   │
│  │  Last Played: Feb 1, 2026                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Career Stats                                                               │
│  ═══════════════════════════════════════════════════════════════════        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │ Wins: 24  │  Losses: 8  │  Win%: .750  │  Games: 32              │     │
│  │ Peak Elo: 1702  │  Current: 1687  │  Start: 1500                  │     │
│  │ Best Streak: W7  │  Worst Streak: L3                              │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  Elo Rating Over Time                                                       │
│  ═══════════════════════════════════════════════════════════════════        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │ 1750 ┤                                            ╭─╮              │     │
│  │      │                                        ╭───╯ ╰─╮            │     │
│  │ 1650 ┤                             ╭──────────╯       ╰─╮          │     │
│  │      │                      ╭──────╯                    │          │     │
│  │ 1550 ┤           ╭──────────╯                           ╰─         │     │
│  │      │   ╭───────╯                                                 │     │
│  │ 1450 ┼───╯                                                         │     │
│  │      └────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────     │     │
│  │         Game 1   5    10   15   20   25   30   32                 │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  Game History                                                               │
│  ═══════════════════════════════════════════════════════════════════        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │ Date ▾ │ Result │ Team        │ Opponent    │ Elo Δ │ New Elo    │     │
│  ├───────────────────────────────────────────────────────────────────┤     │
│  │ 2/1/26 │   W    │ Blue Squad  │ Red Dragons │  +18  │ 1687       │     │
│  ├───────────────────────────────────────────────────────────────────┤     │
│  │ 1/30/26│   W    │ Blue Squad  │ Green Team  │  +22  │ 1669       │     │
│  ├───────────────────────────────────────────────────────────────────┤     │
│  │ 1/28/26│   W    │ Blue Squad  │ Yellow Five │  +19  │ 1647       │     │
│  ├───────────────────────────────────────────────────────────────────┤     │
│  │ 1/25/26│   L    │ Blue Squad  │ Black Mamba │  -15  │ 1628       │     │
│  ├───────────────────────────────────────────────────────────────────┤     │
│  │ 1/23/26│   W    │ Blue Squad  │ White Sox   │  +21  │ 1643       │     │
│  ├───────────────────────────────────────────────────────────────────┤     │
│  │  ...   │        │             │             │       │            │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  32 total games                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layout Specifications

**Navigation:**
- Breadcrumb: "‹ Back to Rankings" - Inter, 14px, --accent-blue, 16px top margin
- Top navigation: Same as landing page

**Player Header Card:**
- Background: --bg-secondary
- Border: 1px solid --border-default
- Padding: 24px
- Shadow: --shadow-subtle

**Player Name Section:**
- Name: PT Serif, 32px, bold, center-aligned
- Rank/Elo: Inter, 16px, --text-secondary, center-aligned
- Divider: 1px solid --border-default, 16px margin

**Quick Stats Row:**
- Font: Inter, 15px
- Separator: " • " in --text-tertiary
- Layout: Center-aligned, wraps on mobile
- Win streak: Color-coded (green/red)

**Career Stats Grid:**
- Background: --bg-table-stripe
- Border: 1px solid --border-default
- Padding: 16px
- Layout: Flexible grid (3 columns desktop, 2 tablet, 1 mobile)
- Label: Inter, 13px, --text-secondary
- Value: IBM Plex Mono, 16px, bold, --text-primary

**Elo Chart:**
- Background: --bg-secondary
- Border: 1px solid --border-default
- Padding: 24px
- Chart: ASCII-style line chart or canvas-based simple line graph
- Height: 300px
- X-axis: Game numbers
- Y-axis: Elo ratings
- Line color: --accent-blue
- Win markers: --accent-green dots
- Loss markers: --accent-red dots
- Grid: Subtle --border-default horizontal lines

**Game History Table:**
- Structure similar to landing page table
- Columns (desktop):
  - Date: 90px, left-aligned
  - Result: 70px, center-aligned, color-coded (W=green, L=red)
  - Team: flexible (min 120px), left-aligned
  - Opponent: flexible (min 120px), left-aligned
  - Elo Δ: 80px, center-aligned, monospace, +/- with color
  - New Elo: 90px, center-aligned, monospace, bold

**Section Headers:**
- Same styling as landing page
- Spacing: 32px top margin, 16px bottom margin

---

## 4. Component Breakdown

### Core Reusable Components

**1. DataTable**
- Props: `columns`, `data`, `sortable`, `onRowClick`, `striped`
- Features: Sortable headers, hover states, alternating rows
- Variants: `default`, `compact`
- Responsive: Horizontal scroll wrapper on mobile

**2. PlayerStatsCard**
- Props: `player`, `showRank`, `variant`
- Features: Player name, key stats, ranking info
- Variants: `header` (detail page), `compact` (list)

**3. StatRow**
- Props: `label`, `value`, `highlight`, `format`
- Features: Label-value pair with optional formatting
- Formats: `number`, `percentage`, `elo`, `date`

**4. StreakBadge**
- Props: `type`, `count`
- Features: Color-coded streak indicator
- Types: `win`, `loss`, `neutral`
- Display: "W5 ✓", "L3 ✗"

**5. SortableHeader**
- Props: `label`, `sortKey`, `currentSort`, `onSort`
- Features: Click to sort, visual indicators
- States: `default`, `ascending`, `descending`

**6. PageHeader**
- Props: `title`, `subtitle`, `actions`
- Features: Consistent page title styling, optional action buttons

**7. SectionDivider**
- Props: `title`, `meta`
- Features: Section header with horizontal rule
- Optional: Right-aligned metadata (e.g., "Last Updated")

**8. EloChart**
- Props: `data`, `height`, `showMarkers`
- Features: Simple line chart for Elo progression
- Implementation: Canvas or SVG-based, minimal styling
- Responsive: Scales to container width

**9. BackLink**
- Props: `href`, `label`
- Features: Breadcrumb-style navigation link
- Icon: Left arrow (‹) prefix

**10. ResponsiveTable**
- Props: `columns`, `data`, `mobileColumns`, `expandable`
- Features: Shows subset of columns on mobile with expand option
- Mobile: Card-style layout alternative

### Layout Components

**11. AppShell**
- Features: Site header, navigation, max-width container
- Consistent margins and spacing

**12. ContentWrapper**
- Features: Max-width constraint (1400px), horizontal padding
- Responsive margins

### Utility Components

**13. ColoredValue**
- Props: `value`, `colorScheme`
- Features: Color-codes values (positive=green, negative=red)
- Use: Elo deltas, win/loss records

**14. MonoText**
- Props: `children`, `bold`, `size`
- Features: Monospace font for numerical data

**15. DateDisplay**
- Props: `date`, `format`
- Features: Consistent date formatting
- Formats: `short` (M/D), `long` (Month D, YYYY)

---

## 5. Interaction Patterns

### Table Sorting

**Behavior:**
1. Click column header to sort ascending
2. Click again to sort descending
3. Click third time to return to default sort (Rank)
4. Visual indicator: Arrow (▴/▾) next to active column
5. Smooth re-ordering animation (200ms fade/shift)

**Default Sort:**
- Landing page: Rank (ascending)
- Game history: Date (descending - most recent first)

**Sortable Columns:**
- Landing page: All columns
- Game history: Date, Result, Elo Δ, New Elo

### Navigation

**Player Name Click:**
1. Row hover state activates
2. Click anywhere on row to navigate
3. Transition: Instant navigation (no fancy animations)
4. URL structure: `/player/[player-id]` or `/player/[player-name-slug]`

**Breadcrumb Navigation:**
- Back link returns to previous scroll position on rankings page
- Implement scroll restoration via `sessionStorage`

### Hover States

**Table Rows:**
- Desktop: Background change + subtle shadow on hover
- Mobile: No hover (tap to navigate)
- Cursor: Pointer on entire row

**Column Headers:**
- Desktop: Blue color + underline on hover
- Cursor: Pointer
- Active column: Bold + blue

**Links:**
- Default: Blue, no underline
- Hover: Darker blue, underline
- Visited: Same as default (stats sites don't differentiate)

### Loading States

**Initial Load:**
- Show table structure with skeleton rows (animated pulse)
- Duration: Until data fetches

**Sort/Filter:**
- No loading state needed (instant client-side)
- Consider brief opacity fade during re-render

### Empty States

**No Players:**
- Message: "No players found. Add your first game to get started."
- Style: Centered, --text-secondary, 24px top padding

**No Games (Player Detail):**
- Message: "No games recorded yet."
- Style: Centered in table area

### Error States

**Failed Data Load:**
- Message: "Unable to load rankings. Please refresh the page."
- Style: Error box with --accent-red border, 16px padding

---

## 6. Responsive Behavior

### Breakpoints

```css
--breakpoint-mobile: 640px
--breakpoint-tablet: 768px
--breakpoint-desktop: 1024px
--breakpoint-wide: 1400px
```

### Landing Page Responsive Strategy

**Desktop (1024px+):**
- Full table with all columns
- Fixed layout, no horizontal scroll
- Comfortable row height (44px)

**Tablet (768px - 1023px):**
- Reduce column widths slightly
- Enable horizontal scroll if needed
- Sticky first column (Rank/Name)
- Side padding: 24px

**Mobile (<768px):**
- Show critical columns only: Rank, Name, Elo, W-L record
- Stack view alternative: Card-based layout
  ```
  ┌─────────────────────────────┐
  │ #1  Jordan Wells      1687  │
  │     24-8 • .750 • W5 ✓      │
  ├─────────────────────────────┤
  │ #2  Sarah Chen        1654  │
  │     21-9 • .700 • W3 ✓      │
  └─────────────────────────────┘
  ```
- Tap card to view full details
- Reduce font sizes by 1-2px
- Side padding: 16px

### Player Detail Page Responsive Strategy

**Desktop (1024px+):**
- Full layout as designed
- Chart: Full width (max 900px)
- Two-column stats grid

**Tablet (768px - 1023px):**
- Chart: Full width
- Stats grid: Two columns
- Game history: Horizontal scroll if needed

**Mobile (<768px):**
- Single column layout
- Player header: Stacked vertically
- Stats grid: Single column or key stats only
- Chart: Simplified, full width, reduced height (200px)
- Game history: Card format
  ```
  ┌─────────────────────────────┐
  │ Feb 1, 2026          W +18  │
  │ Blue Squad vs Red Dragons   │
  │ New Elo: 1687               │
  ├─────────────────────────────┤
  ```
- Reduce vertical spacing (--space-md → --space-sm)

### Typography Responsive Adjustments

**Mobile (<768px):**
- h1: 28px → 24px
- h2: 24px → 20px
- Body: 15px → 14px
- Table cells: 14px → 13px

**Tablet (768px - 1023px):**
- h1: 32px → 28px
- Other sizes: Same as desktop

### Navigation Responsive Behavior

**Desktop:**
- Horizontal nav in header
- Full link text

**Mobile:**
- Hamburger menu (optional) or simplified nav
- Abbreviate link text if needed ("Rankings" → "Rank")

---

## 7. Accessibility Considerations

### Keyboard Navigation

**Table Sorting:**
- Column headers: Focusable, Enter/Space to sort
- Tab order: Left to right through headers

**Row Navigation:**
- Table rows: Focusable, Enter to navigate
- Tab order: Top to bottom through rows
- Skip to content link at top

### Screen Reader Support

**Table Semantics:**
- Proper `<table>`, `<thead>`, `<tbody>` structure
- `scope="col"` on header cells
- `aria-sort` on sortable columns
- Announce current sort state

**Player Cards:**
- Semantic heading hierarchy (h1 → h2 → h3)
- ARIA labels for icon-only elements
- Alt text for visual indicators (streak badges)

### Color Contrast

**WCAG AA Compliance:**
- All text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1
- Test accent colors against backgrounds

**Color Blind Safe:**
- Don't rely solely on color for W/L indicators
- Use symbols (✓/✗) alongside colors
- Pattern alternatives for chart lines (dashed/solid)

### Focus States

**Visible Focus Indicators:**
- Links: 2px solid --accent-blue outline, 2px offset
- Buttons: Same as links
- Table rows: 2px solid --accent-blue outline, inset
- Remove outlines only if custom focus styles provided

---

## 8. Performance Considerations

### Table Rendering

**Large Datasets:**
- Virtualize table rows if player count >100 (use react-window or similar)
- Lazy load game history (paginate or infinite scroll)
- Client-side sorting for datasets <500 rows

**Image Optimization:**
- No player photos planned initially
- If added later: Next.js Image component, WebP format

### Chart Rendering

**Elo Trend Chart:**
- Use Canvas for simple line chart (lighter than SVG for many data points)
- Debounce resize events (250ms)
- Limit data points displayed (last 50 games, option to view all)

### Code Splitting

- Lazy load Elo chart component (not needed on landing page)
- Separate bundle for player detail page

---

## 9. Design Tokens (CSS Variables)

### Complete Token Reference

```css
:root {
  /* Colors - Background */
  --bg-primary: #F8F5F0;
  --bg-secondary: #FFFFFF;
  --bg-table-stripe: #F0EDE6;

  /* Colors - Text */
  --text-primary: #222222;
  --text-secondary: #555555;
  --text-tertiary: #888888;

  /* Colors - Accent */
  --accent-blue: #1E5A9E;
  --accent-blue-hover: #164578;
  --accent-red: #C8424A;
  --accent-green: #3A7D4E;
  --accent-orange: #D47735;

  /* Colors - Borders */
  --border-default: #CCCCCC;
  --border-strong: #999999;

  /* Colors - Shadows */
  --shadow-subtle: rgba(0, 0, 0, 0.08);

  /* Typography - Families */
  --font-serif: 'PT Serif', 'Georgia', 'Times New Roman', serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', monospace;

  /* Typography - Sizes */
  --text-xs: 13px;
  --text-sm: 14px;
  --text-base: 15px;
  --text-lg: 18px;
  --text-xl: 24px;
  --text-2xl: 32px;

  /* Typography - Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Layout */
  --max-width: 1400px;
  --border-radius: 0px; /* No rounded corners for old-school look */

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-medium: 250ms ease;

  /* Z-index */
  --z-header: 100;
  --z-dropdown: 200;
  --z-modal: 300;
}
```

---

## 10. Implementation Priorities

### Phase 1: Core Structure (MVP)
1. Design tokens / CSS variables setup
2. AppShell layout component
3. Basic DataTable component
4. Landing page with static data
5. Basic routing to player detail page

### Phase 2: Interactivity
1. Table sorting functionality
2. Hover states and transitions
3. Player detail page layout
4. Navigation and routing

### Phase 3: Polish
1. Elo chart component
2. Streak indicators and color coding
3. Responsive behavior (mobile/tablet)
4. Loading and error states

### Phase 4: Enhancement
1. Keyboard navigation
2. Accessibility audit and fixes
3. Performance optimization (virtualization if needed)
4. Advanced filtering/search (future)

---

## 11. Design Principles Summary

1. **Data Density Over Whitespace**: Pack information efficiently without overwhelming
2. **Readability First**: High contrast, clear hierarchy, scannable layouts
3. **Instant Feedback**: Hover states, sorting, navigation all feel immediate
4. **Consistency**: Reuse patterns, colors, spacing across all pages
5. **Old-School Aesthetic**: Embrace the classic sports reference site look
6. **Performance Matters**: Fast loads, smooth interactions, no janky animations
7. **Accessible by Default**: Semantic HTML, keyboard nav, screen reader support
8. **Mobile-Aware**: Desktop-first but gracefully responsive

---

## 12. Future Enhancements (Out of Scope for V1)

- Player photos/avatars
- Advanced filtering (by date range, team, etc.)
- Search functionality
- Dark mode toggle
- Export to CSV
- Printable stat sheets
- Head-to-head matchup pages
- Team detail pages
- Elo calculation transparency page
- League settings/configuration UI

---

## Appendix: Reference Links

**Design Inspiration:**
- Basketball-Reference.com - Table layouts, color scheme
- Baseball-Reference.com - Data density, navigation patterns
- Pro-Football-Reference.com - Stat formatting

**Typography Resources:**
- PT Serif: https://fonts.google.com/specimen/PT+Serif
- Inter: https://fonts.google.com/specimen/Inter
- IBM Plex Mono: https://fonts.google.com/specimen/IBM+Plex+Mono

**Accessibility Standards:**
- WCAG 2.1 AA Guidelines
- WAI-ARIA Authoring Practices for Tables

---

**Document Version:** 1.0
**Last Updated:** February 2, 2026
**Author:** UI Designer - LeElo Tracker Project
