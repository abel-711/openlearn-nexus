import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, PlayCircle, Zap, Brain, Trophy } from "lucide-react";
import { ViewKey } from "@/lib/workspace";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export const HomeView = ({ onNavigate }: { onNavigate: (v: ViewKey) => void }) => (
  <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-6">
    {/* Hero */}
    <motion.div variants={item} className="glass relative overflow-hidden rounded-3xl p-8 shadow-elevated">
      <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gradient-glow opacity-30 blur-3xl animate-aurora-shift" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-gradient-cyan opacity-20 blur-3xl animate-aurora-shift" />
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/40 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald shadow-[0_0_10px_hsl(var(--accent-emerald))]" />
          Vault online · 1,284 documents
        </div>
         <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
           Good evening, <span className="text-gradient-aurora">Abel Paul N</span>.<br />
           Your mind is <span className="text-gradient-aurora">primed</span> for deep work.
         </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          You have <span className="text-foreground">3 high-leverage</span> sessions queued and a fresh AI brief on
          <span className="text-foreground"> Linear Algebra</span>. Where shall we begin?
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => onNavigate("focus")} className="group inline-flex items-center gap-2 rounded-xl bg-gradient-glow px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
            <PlayCircle className="h-4 w-4" />
            Start focus session
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button onClick={() => onNavigate("mentor")} className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium hover:shadow-glow">
            <Sparkles className="h-4 w-4 text-primary" />
            Ask the AI mentor
          </button>
          <button onClick={() => onNavigate("planner")} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">
            View today's plan →
          </button>
        </div>
      </div>
    </motion.div>

    {/* Momentum cards */}
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { icon: Zap, title: "Daily flow", value: "2h 14m", sub: "of 3h goal", tint: "accent-amber" },
        { icon: Brain, title: "Concepts mastered", value: "+12", sub: "this week", tint: "accent-violet" },
        { icon: Trophy, title: "Mastery score", value: "78", sub: "↑ 6 pts", tint: "accent-emerald" },
      ].map((m) => (
        <motion.div variants={item} whileHover={{ y: -3 }} key={m.title} className="glass group relative overflow-hidden rounded-2xl p-5 shadow-soft transition-shadow hover:shadow-glow">
          <span className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60" style={{ background: `hsl(var(--${m.tint}))` }} />
          <m.icon className="h-5 w-5" style={{ color: `hsl(var(--${m.tint}))` }} />
          <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{m.title}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold">{m.value}</span>
            <span className="text-xs text-muted-foreground">{m.sub}</span>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Continue */}
    <motion.div variants={item} className="glass rounded-2xl p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Continue where you left off</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground">View all →</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
           { t: "linear Algebra\n", s: "Linear Algebra · 62% read", c: "accent-blue" },
          { t: "Backpropagation derivation", s: "Neural Networks · 31% read", c: "accent-cyan" },
          { t: "Wavefunction collapse", s: "Quantum Physics · 84% read", c: "accent-violet" },
          { t: "Inflation dynamics", s: "Macro Economics · 12% read", c: "accent-emerald" },
        ].map((d) => (
          <button key={d.t} className="group flex items-center gap-4 rounded-xl border border-border/40 bg-secondary/30 p-3 text-left transition-all hover:border-primary/40 hover:bg-secondary/60">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: `linear-gradient(135deg, hsl(var(--${d.c})/0.3), hsl(var(--${d.c})/0.1))` }}>
              <div className="h-5 w-5 rounded" style={{ background: `hsl(var(--${d.c}))`, boxShadow: `0 0 10px hsl(var(--${d.c}))` }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{d.t}</div>
              <div className="truncate text-xs text-muted-foreground">{d.s}</div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);
