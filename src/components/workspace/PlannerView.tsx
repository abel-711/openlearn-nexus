import { motion } from "framer-motion";
import { Clock, Sparkles, CheckCircle2, Circle } from "lucide-react";

const HOURS = ["08", "10", "12", "14", "16", "18", "20"];
const SESSIONS = [
  { start: 1, span: 2, title: "Linear Algebra · spectral methods", color: "accent-blue", done: true },
  { start: 3, span: 1, title: "Recall sprint", color: "accent-amber", done: true },
  { start: 4, span: 2, title: "Neural Nets · backprop derivation", color: "accent-cyan", done: false },
  { start: 6, span: 1, title: "Light review", color: "accent-emerald", done: false },
];

const HEAT = Array.from({ length: 35 }).map((_, i) => ((i * 17) % 5));

export const PlannerView = () => (
  <div className="flex flex-col gap-6">
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Today</div>
          <h2 className="font-display text-2xl font-semibold">Adaptive plan · Wed, Nov 6</h2>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-glow px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
          <Sparkles className="h-4 w-4" /> Re-plan with AI
        </button>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <div className="grid grid-cols-7 gap-2 text-[10px] text-muted-foreground">
          {HOURS.map((h) => <span key={h}>{h}:00</span>)}
        </div>
        <div className="relative mt-2 h-24 rounded-xl border border-border/40 bg-secondary/20">
          {SESSIONS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${(s.span / 7) * 100}%` }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: "easeOut" }}
              className="absolute top-2 h-20 overflow-hidden rounded-lg p-3 shadow-soft"
              style={{
                left: `${(s.start / 7) * 100}%`,
                background: `linear-gradient(135deg, hsl(var(--${s.color})/0.4), hsl(var(--${s.color})/0.15))`,
                border: `1px solid hsl(var(--${s.color})/0.5)`,
                boxShadow: `0 0 24px hsl(var(--${s.color})/0.3)`,
              }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                {s.title}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {s.span * 60}m
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>

    <div className="grid gap-4 md:grid-cols-2">
      {/* Heatmap */}
      <div className="glass rounded-2xl p-5 shadow-soft">
        <div className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">Revision heatmap · 5 weeks</div>
        <div className="grid grid-cols-7 gap-1.5">
          {HEAT.map((v, i) => (
            <div key={i} className="aspect-square rounded" style={{
              background: v === 0 ? "hsl(var(--secondary))" : `hsl(var(--accent-emerald) / ${0.2 + v * 0.18})`,
              boxShadow: v > 2 ? `0 0 8px hsl(var(--accent-emerald)/0.4)` : undefined,
            }} />
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="glass rounded-2xl p-5 shadow-soft">
        <div className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">Upcoming milestones</div>
        <ul className="space-y-3">
          {[
            { t: "Calculus midterm", d: "in 4 days", p: 64 },
            { t: "ML project draft", d: "in 9 days", p: 32 },
            { t: "Quantum problem set", d: "in 12 days", p: 18 },
          ].map((u) => (
            <li key={u.t} className="rounded-xl border border-border/40 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{u.t}</span>
                <span className="text-xs text-muted-foreground">{u.d}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <motion.div initial={{ width: 0 }} animate={{ width: `${u.p}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-glow" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
