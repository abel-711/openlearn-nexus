import { motion } from "framer-motion";
import { useState } from "react";

type Node = { id: string; label: string; x: number; y: number; color: string; r: number };
const NODES: Node[] = [
  { id: "la", label: "Linear Algebra", x: 50, y: 50, color: "accent-blue", r: 28 },
  { id: "eig", label: "Eigenvectors", x: 25, y: 28, color: "accent-violet", r: 20 },
  { id: "pca", label: "PCA", x: 22, y: 70, color: "accent-cyan", r: 18 },
  { id: "svd", label: "SVD", x: 45, y: 82, color: "accent-cyan", r: 16 },
  { id: "qm", label: "Quantum", x: 78, y: 32, color: "accent-violet", r: 22 },
  { id: "nn", label: "Neural Nets", x: 80, y: 70, color: "accent-emerald", r: 22 },
  { id: "bp", label: "Backprop", x: 92, y: 50, color: "accent-amber", r: 14 },
];
const EDGES: [string, string][] = [
  ["la","eig"],["la","pca"],["la","svd"],["la","qm"],["la","nn"],
  ["eig","qm"],["eig","pca"],["pca","svd"],["nn","bp"],["nn","la"],
];

const find = (id: string) => NODES.find((n) => n.id === id)!;

export const GraphView = () => {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl p-5 shadow-soft">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Knowledge graph</div>
        <h2 className="font-display text-2xl font-semibold">Your concept universe</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hover any node to inspect dependencies. Brighter links = stronger relations.</p>
      </div>

      <div className="glass relative h-[60vh] overflow-hidden rounded-2xl shadow-elevated">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="bg" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.15)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#bg)" />
          {EDGES.map(([a, b], i) => {
            const A = find(a), B = find(b);
            const active = hover === a || hover === b;
            return (
              <line
                key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke={active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.18)"}
                strokeWidth={active ? 0.45 : 0.18}
                style={{ filter: active ? "drop-shadow(0 0 1px hsl(var(--primary)))" : undefined, transition: "all 0.3s" }}
              />
            );
          })}
        </svg>
        {NODES.map((n) => (
          <motion.button
            key={n.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.05 }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            whileHover={{ scale: 1.12 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${n.x}%`, top: `${n.y}%`,
              width: n.r * 2, height: n.r * 2,
              background: `radial-gradient(circle, hsl(var(--${n.color})/0.9), hsl(var(--${n.color})/0.4))`,
              boxShadow: `0 0 ${hover===n.id?40:20}px hsl(var(--${n.color})/${hover===n.id?0.9:0.5})`,
              border: "1px solid hsl(var(--foreground)/0.15)",
            }}
          >
            <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground/80">{n.label}</span>
          </motion.button>
        ))}
        {/* Floating legend */}
        <div className="glass-strong absolute bottom-4 left-4 rounded-xl p-3 text-xs">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Legend</div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {[["accent-blue","Foundations"],["accent-violet","Theory"],["accent-cyan","Methods"],["accent-emerald","Applications"]].map(([c,l]) => (
              <div key={c} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{background:`hsl(var(--${c}))`}}/>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
