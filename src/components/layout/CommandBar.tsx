import { motion } from "framer-motion";
import { Search, Sparkles, Command, Bell, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const SUGGESTIONS = [
  { label: "Explain entanglement intuitively", kind: "Mentor" },
  { label: "Plan revision for Calculus midterm", kind: "Planner" },
  { label: "Find every note about gradient descent", kind: "Search" },
  { label: "Open Knowledge Graph: Linear Algebra", kind: "Graph" },
];

export const CommandBar = ({ onAsk }: { onAsk: (q: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative z-20 flex items-center gap-3 px-4 pt-3">
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className="glass group relative flex h-11 flex-1 items-center gap-3 rounded-2xl px-4 text-left shadow-soft transition-all hover:shadow-glow"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm text-muted-foreground">
          Ask anything · search your vault · summon a concept
        </span>
        <kbd className="hidden items-center gap-1 rounded-md border border-border/60 bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
          <Command className="h-3 w-3" /> K
        </kbd>
        <span className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "linear-gradient(135deg, hsl(var(--accent-blue)/0.3), hsl(var(--accent-violet)/0.3))", filter: "blur(20px)", zIndex: -1 }} />
      </motion.button>

      <button className="glass grid h-11 w-11 place-items-center rounded-2xl text-muted-foreground hover:text-foreground">
        <Bell className="h-4 w-4" />
      </button>
      <button className="glass grid h-11 w-11 place-items-center rounded-2xl text-muted-foreground hover:text-foreground">
        <Sun className="h-4 w-4" />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong mx-auto mt-32 w-[min(640px,92vw)] overflow-hidden rounded-2xl shadow-elevated"
          >
            <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && q.trim()) {
                    onAsk(q.trim());
                    setOpen(false);
                    setQ("");
                  }
                }}
                placeholder="Ask the Vault…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded-md border border-border/60 bg-secondary/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suggested</div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => { onAsk(s.label); setOpen(false); }}
                  className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-secondary/60"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-glow/20 text-primary"><Sparkles className="h-3.5 w-3.5" /></span>
                    {s.label}
                  </span>
                  <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">{s.kind}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
