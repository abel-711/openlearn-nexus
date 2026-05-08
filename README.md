# OPENLearn Vault

An AI-native, glassmorphic study workspace designed for deep, focused learning. OPENLearn Vault combines semantic AI search, an intelligent mentor, adaptive planning, interactive knowledge graphs, and analytics — all inside a fluid, animated interface.

Demo video link : https://youtu.be/foL2G8k6FwU?si=avkdUxjFVMBgT78J

Link : https://openlearnvault2026.lovable.app

---

## Features

### Workspace Views

| View | Description |
|------|-------------|
| **Home** | Personalized greeting, momentum cards, continue-reading suggestions |
| **AI Search** | Perplexity-style semantic search across chapters, notes, and videos |
| **Mentor** | Streaming AI tutor with contextual chapter summaries |
| **Library** | Chapter materials, PDFs, and subject-organized content |
| **Planner** | Adaptive schedule with animated timelines and revision heatmaps |
| **Knowledge Graph** | Interactive force-directed concept map |
| **Focus** | Distraction-free deep work timer with ambient pulse |
| **Analytics** | Progress rings, mastery bars, and learning heatmaps |

### AI-Powered Search (RAG-based)

- **Internal-first priority**: Searches the OPENLearn Vault library before external sources
- **Semantic matching**: AI ranks chapters by relevance and synthesizes contextual quotes
- **Chapter summaries**: One-click AI-generated summaries via streaming response
- **Curated videos**: YouTube results filtered and ranked from trusted educational channels
- **Smart routing**: Natural language commands route to the right workspace view

### Design System

- **Theme**: "Midnight Aurora" — deep near-black with aurora gradient mesh
- **Surfaces**: Translucent glass panels with `backdrop-blur` and layered opacity
- **Accents**: Electric blue, violet, cyan, emerald, soft orange
- **Typography**: Space Grotesk (display) + Inter (body)
- **Motion**: Framer Motion for view transitions, hover effects, and micro-interactions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS v3, shadcn/ui components |
| Animation | Framer Motion |
| Charts | Recharts |
| Backend | Lovable Cloud (managed backend) |
| AI Gateway | Lovable AI (Gemini models) |
| Edge Functions | Supabase Edge Functions (Deno) |

---

## Architecture

```text
src/
├── components/
│   ├── layout/
│   │   ├── AuroraBackground.tsx   # Animated gradient mesh + particles
│   │   ├── AppShell.tsx            # Three-zone workspace shell
│   │   ├── Sidebar.tsx             # Collapsible glass sidebar
│   │   ├── CommandBar.tsx          # Floating top search/command palette
│   │   └── ContextPanel.tsx        # Right panel (AI suggestions, progress)
│   ├── workspace/
│   │   ├── HomeView.tsx            # Hero greeting + momentum
│   │   ├── SearchView.tsx          # AI semantic search + video results
│   │   ├── MentorView.tsx          # Streaming chat UI
│   │   ├── PlannerView.tsx         # Adaptive schedule
│   │   ├── GraphView.tsx           # Interactive knowledge graph
│   │   ├── FocusView.tsx           # Deep work timer
│   │   ├── AnalyticsView.tsx       # Progress + mastery charts
│   │   └── LibraryView.tsx         # Chapter materials
│   └── ui/                         # shadcn/ui primitives
├── lib/
│   ├── workspace.ts                # View keys + navigation config
│   └── utils.ts                    # Tailwind / clsx utilities
├── pages/
│   └── Index.tsx                   # Main app entry
└── integrations/supabase/
    ├── client.ts                   # Supabase client (auto-generated)
    └── types.ts                    # Database types (auto-generated)

supabase/functions/
├── library-search/index.ts         # Semantic chapter search (AI-reranked)
├── chapter-summary/index.ts        # Streaming AI chapter summaries
└── youtube-search/index.ts         # Curated educational video search
```

---

## AI Edge Functions

### `library-search`
Receives a query, fetches the chapter catalog from the database, and uses the Lovable AI Gateway (Gemini 3 Flash) to:
- Identify semantically matching chapters
- Return ranked matches with relevance scores
- Synthesize contextual quotes for each match
- Extract key concepts

### `chapter-summary`
Streams an AI-generated chapter summary focused on the user's query. Returns a Server-Sent Event (SSE) stream for real-time typing animation in the UI.

### `youtube-search`
Searches YouTube for educational videos, then filters and ranks results by:
- Trusted channel bonus (Khan Academy, MIT, 3Blue1Brown, etc.)
- View count and like/view ratio
- Returns top matches with thumbnails and relevance scores

---

## Environment Variables

The following are auto-configured by Lovable Cloud:

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Backend API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public Supabase key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |
| `LOVABLE_API_KEY` | Lovable AI Gateway access |
| `YOUTUBE_API_KEY` | YouTube Data API v3 access |

---

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run tests
bun run test
```

---

## Design Tokens

All theming uses CSS custom properties (HSL) in `src/index.css`:

- `--background`, `--foreground` — Base surface colors
- `--primary`, `--primary-foreground` — Accent buttons / links
- `--accent-blue`, `--accent-violet`, `--accent-cyan`, `--accent-emerald`, `--accent-amber` — Accent palette
- `--gradient-aurora`, `--gradient-mesh`, `--gradient-glow` — Gradients
- `--glass`, `--glass-strong` — Translucent surface opacities

Custom utilities: `.glass`, `.glass-strong`, `.glow-ring`, `.aurora-bg`

---

## Roadmap

- [x] AI semantic search with internal library priority
- [x] Streaming chapter summaries
- [x] Curated YouTube video search
- [x] Glassmorphic design system
- [x] Multi-view workspace shell
- [ ] Real-time collaborative annotations
- [ ] Vector embeddings for semantic chunk retrieval
- [ ] OAuth social login
- [ ] Mobile-responsive gestures

---

## License

MIT
