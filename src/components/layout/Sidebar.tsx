import { motion } from "framer-motion";
import { Home, Search, Sparkles, CalendarDays, Network, Focus, BarChart3, ChevronsLeft, ChevronsRight, Pin, FileText, Plus } from "lucide-react";
import { ViewKey, VIEWS } from "@/lib/workspace";
import { cn } from "@/lib/utils";

const ICONS: Record<ViewKey, React.ComponentType<{ className?: string }>> = {
  home: Home, search: Search, mentor: Sparkles, planner: CalendarDays, graph: Network, focus: Focus, analytics: BarChart3,
};

const subjects = [
  { name: "Quantum Physics", color: "accent-violet" },
  { name: "Linear Algebra", color: "accent-blue" },
  { name: "Neural Networks", color: "accent-cyan" },
  { name: "Macro Economics", color: "accent-emerald" },
];

const recents = [
  "Eigenvectors — Chapter 4",
  "Backprop derivation",
  "Wavefunction collapse notes",
];

interface Props {
  view: ViewKey;
  onChange: (v: ViewKey) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ view, onChange, collapsed, onToggle }: Props) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      className="glass relative z-10 m-3 mr-0 flex flex-col rounded-2xl shadow-elevated"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-glow shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
          <span className="absolute -inset-1 -z-10 rounded-2xl bg-gradient-glow opacity-40 blur-md" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-display text-sm font-semibold leading-none text-gradient-aurora">OPENLearn</div>
            <div className="font-display text-xs text-muted-foreground">Vault</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3">
        {VIEWS.map((v) => {
          const Icon = ICONS[v.key];
          const active = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => onChange(v.key)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
                active
                  ? "bg-gradient-glow/15 text-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-xl border border-primary/30 bg-primary/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
              {!collapsed && (
                <span className="flex-1 truncate font-medium">{v.label}</span>
              )}
              {!collapsed && active && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-6 flex-1 overflow-y-auto px-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pinned</span>
            <button className="grid h-5 w-5 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <ul className="space-y-1">
            {subjects.map((s) => (
              <li key={s.name} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground">
                <span className={`h-2 w-2 rounded-full bg-${s.color}`} style={{ backgroundColor: `hsl(var(--${s.color}))` }} />
                <span className="flex-1 truncate">{s.name}</span>
                <Pin className="h-3 w-3 opacity-0 group-hover:opacity-60" />
              </li>
            ))}
          </ul>

          <div className="mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recent</div>
          <ul className="space-y-1">
            {recents.map((r) => (
              <li key={r} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary/60 hover:text-foreground">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto border-t border-border/40 p-3">
        {!collapsed ? (
          <div className="glass flex items-center gap-3 rounded-xl p-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-cyan text-xs font-semibold text-primary-foreground">AY</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">Aiden Yu</div>
              <div className="truncate text-[10px] text-muted-foreground">Level 12 · 1,840 XP</div>
            </div>
            <button onClick={onToggle} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={onToggle} className="grid w-full place-items-center rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
