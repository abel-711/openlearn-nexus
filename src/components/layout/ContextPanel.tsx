import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Flame, Target, BookOpen } from "lucide-react";

const Ring = ({ value, label, color }: { value: number; label: string; color: string }) => {
  const r = 22, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
          <circle cx="28" cy="28" r={r} stroke="hsl(var(--border))" strokeWidth="4" fill="none" />
          <motion.circle
            cx="28" cy="28" r={r}
            stroke={`hsl(var(--${color}))`} strokeWidth="4" fill="none" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (value / 100) * c }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px hsl(var(--${color}) / 0.6))` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-xs font-semibold">{value}%</div>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
};

export const ContextPanel = () => (
  <aside className="hidden w-80 shrink-0 flex-col gap-3 p-3 lg:flex">
    {/* AI insight */}
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="glass relative overflow-hidden rounded-2xl p-4 shadow-soft">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-glow opacity-30 blur-2xl" />
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-glow/20 text-primary"><Sparkles className="h-3.5 w-3.5" /></span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">AI Insight</span>
      </div>
      <p className="text-sm leading-relaxed">
        You're <span className="text-gradient-aurora font-semibold">38% faster</span> on Linear Algebra problems this week. Try a harder set tonight.
      </p>
      <button className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
        Generate practice set →
      </button>
    </motion.div>

    {/* Progress rings */}
    <div className="glass rounded-2xl p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Mastery</span>
        <TrendingUp className="h-3.5 w-3.5 text-accent-emerald" />
      </div>
      <div className="flex items-center justify-between">
        <Ring value={82} label="Algebra" color="accent-blue" />
        <Ring value={64} label="Physics" color="accent-violet" />
        <Ring value={48} label="ML" color="accent-cyan" />
      </div>
    </div>

    {/* Streak */}
    <div className="glass rounded-2xl p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Streak</span>
        <Flame className="h-3.5 w-3.5 text-accent-amber" />
      </div>
      <div className="flex items-end gap-2">
        <div className="font-display text-3xl font-bold text-gradient-aurora">17</div>
        <div className="pb-1 text-xs text-muted-foreground">days in flow</div>
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className={`h-6 flex-1 rounded ${i < 11 ? "bg-gradient-glow" : "bg-secondary/60"}`} style={i<11?{boxShadow:"0 0 8px hsl(var(--primary)/0.4)"}:{}} />
        ))}
      </div>
    </div>

    {/* Related */}
    <div className="glass rounded-2xl p-4 shadow-soft">
      <div className="mb-2 flex items-center gap-2">
        <BookOpen className="h-3.5 w-3.5 text-accent-cyan" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Related</span>
      </div>
      <ul className="space-y-2 text-xs">
        {["Singular value decomposition", "Markov chains", "Information theory"].map((t) => (
          <li key={t} className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-secondary/60">
            <span>{t}</span>
            <Target className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
          </li>
        ))}
      </ul>
    </div>
  </aside>
);
