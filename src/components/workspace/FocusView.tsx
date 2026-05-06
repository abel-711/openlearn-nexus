import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export const FocusView = () => {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  const total = 25 * 60;
  const pct = secs / total;
  const r = 120, c = 2 * Math.PI * r;
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");

  return (
    <div className="grid place-items-center py-6">
      <div className="relative">
        <motion.div
          className="absolute -inset-20 rounded-full bg-gradient-glow opacity-20 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="glass-strong relative grid h-[420px] w-[420px] place-items-center rounded-full shadow-elevated">
          <svg viewBox="0 0 280 280" className="absolute inset-6 -rotate-90">
            <circle cx="140" cy="140" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <motion.circle
              cx="140" cy="140" r={r} fill="none" stroke="url(#fg)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={c}
              animate={{ strokeDashoffset: c * (1 - pct) }}
              transition={{ duration: 0.4 }}
              style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary)/0.6))" }}
            />
            <defs>
              <linearGradient id="fg" x1="0" x2="1">
                <stop offset="0%" stopColor="hsl(var(--accent-cyan))" />
                <stop offset="50%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent-violet))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Deep work</div>
            <div className="font-display text-7xl font-semibold tracking-tighter text-gradient-aurora">{m}:{s}</div>
            <div className="mt-2 text-xs text-muted-foreground">Eigenvectors · Linear Algebra</div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button onClick={() => setRunning((r) => !r)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-glow px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow">
          {running ? <><Pause className="h-4 w-4"/>Pause</> : <><Play className="h-4 w-4"/>Begin</>}
        </button>
        <button onClick={() => { setSecs(total); setRunning(false); }} className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <button className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm">
          <Sparkles className="h-4 w-4 text-primary" /> Ambient AI
        </button>
      </div>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-3 gap-3">
        {[
          { l: "Sessions today", v: "3" },
          { l: "Focus time", v: "1h 42m" },
          { l: "Avg depth", v: "92%" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</div>
            <div className="font-display text-2xl">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
