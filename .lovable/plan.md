# OPENLearn Vault — AI-Native Study Workspace (v1)

A premium, AI-native learning OS. Glassmorphic, futuristic, animated. Not a dashboard — a workspace.

## Design System (foundation first)

**Theme: "Midnight Aurora" (default dark)**
- Background: deep near-black with subtle aurora gradient mesh
- Surfaces: translucent glass panels (`backdrop-blur`, layered opacity)
- Accents: electric blue, violet, cyan, emerald, soft orange
- Typography: Space Grotesk (display) + Inter (body) via Google Fonts
- Radius: 1rem default, 1.5rem for hero panels
- Shadows: soft glow + ambient depth (multi-layer)
- Animations: framer-motion (already aligned with stack)

All tokens in `index.css` (HSL) + `tailwind.config.ts`:
- Semantic: `--background`, `--surface`, `--surface-elevated`, `--glass`, `--border-glow`
- Accents: `--accent-blue`, `--accent-violet`, `--accent-cyan`, `--accent-emerald`, `--accent-amber`
- Gradients: `--gradient-aurora`, `--gradient-mesh`, `--gradient-glow`
- Custom utilities: `.glass`, `.glass-strong`, `.glow-ring`, `.aurora-bg`
- Keyframes: `aurora-shift`, `pulse-glow`, `float`, `shimmer`, `fade-up`

## Layout Architecture

Three-zone adaptive workspace inside `pages/Index.tsx`:

```text
┌──────────────────────────────────────────────────────────────┐
│  Aurora background (animated mesh + floating particles)      │
│ ┌────────┬───────────────────────────────┬──────────────┐    │
│ │ Left   │  Central Workspace            │ Right        │    │
│ │ Sidebar│  (view switches by mode)      │ Context Panel│    │
│ │ glass  │  - Home / Search / Mentor /   │ - AI sugg.   │    │
│ │        │    Planner / Graph / Focus /  │ - Related    │    │
│ │        │    Analytics                  │ - Progress   │    │
│ └────────┴───────────────────────────────┴──────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

Top: floating command bar (⌘K style) with animated AI search.

## Components to Build

`src/components/`
- `layout/AuroraBackground.tsx` — animated gradient mesh + particles
- `layout/AppShell.tsx` — three-zone shell, resizable panels
- `layout/Sidebar.tsx` — collapsible glass sidebar, nav + pinned subjects + recent docs
- `layout/ContextPanel.tsx` — right panel with AI suggestions, related topics, progress rings
- `layout/CommandBar.tsx` — floating top search/command palette
- `workspace/HomeView.tsx` — hero greeting, momentum cards, daily goals, streak
- `workspace/SearchView.tsx` — Perplexity-style AI search with confidence, related concepts, clustered results
- `workspace/MentorView.tsx` — streaming-style chat UI with citation chips, follow-up suggestions
- `workspace/PlannerView.tsx` — animated timeline, drag-feel tasks, revision heatmap
- `workspace/GraphView.tsx` — interactive knowledge graph (SVG, force-directed-lite, hand-rolled)
- `workspace/FocusView.tsx` — distraction-free timer, ambient pulse
- `workspace/AnalyticsView.tsx` — recharts: progress rings, mastery bars, learning heatmap
- `ui/GlassCard.tsx`, `ui/GlowButton.tsx`, `ui/ProgressRing.tsx`, `ui/XpBadge.tsx`

State: simple `useState` for active view in shell (no router changes needed beyond `/`).

## Interactions

- Sidebar collapses with smooth width animation
- Command bar: ⌘K opens, focus glow, animated suggestions
- Cards: hover lift + glow, magnetic feel via framer-motion
- View transitions: AnimatePresence fade+scale
- Particles: lightweight CSS-animated divs (no three.js for v1 — keeps perf high)
- Streaming chat: simulated token-by-token typing animation (mock data v1)

## Data (v1, mocked)

All content mocked locally — subjects, documents, chat, planner tasks, graph nodes, analytics. Clean structure so backend can plug in later.

## Dependencies

Already present: framer-motion? Will add if missing: `framer-motion`, `recharts`. Skip GSAP / D3 / three.js / tiptap / react-spring for v1 — framer-motion + custom SVG covers everything elegantly and keeps bundle lean.

## Out of Scope (v1)

- Real AI backend (Lovable Cloud) — UI is mock-driven; can wire later
- Auth, persistence, multi-user
- Mobile gestures beyond responsive layout
- Three.js scenes

## Scope Summary

One polished page (`/`) that switches between 7 immersive workspace views inside a glass three-zone shell, fully themed via design tokens, animated with framer-motion, branded **OPENLearn Vault**.
