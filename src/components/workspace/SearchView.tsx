import { motion } from "framer-motion";
import { Search, Sparkles, ArrowRight, FileText, Network } from "lucide-react";
import { useState } from "react";

const RESULTS = [
  {
    title: "Eigenvectors as natural axes of transformation",
    snippet: "An eigenvector of A is a non-zero vector v such that Av = λv. Geometrically, it's a direction that the matrix only stretches…",
    source: "Linear Algebra · Ch.4",
    confidence: 0.94,
    tags: ["Algebra", "Geometry"],
  },
  {
    title: "Spectral decomposition intuition",
    snippet: "Every symmetric matrix decomposes into an orthonormal basis of eigenvectors. This unlocks PCA, quantum mechanics, and graph spectra…",
    source: "Notes · Spectral methods",
    confidence: 0.88,
    tags: ["Algebra", "ML"],
  },
  {
    title: "Why eigenvectors matter for Google's PageRank",
    snippet: "The dominant eigenvector of the web's transition matrix encodes long-run visitor probabilities — exactly the ranking signal…",
    source: "Web archive",
    confidence: 0.81,
    tags: ["Applications"],
  },
];

export const SearchView = ({ initialQuery }: { initialQuery?: string }) => {
  const [q, setQ] = useState(initialQuery ?? "What are eigenvectors really?");
  return (
    <div className="flex flex-col gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-strong relative overflow-hidden rounded-3xl p-6 shadow-elevated">
        <div className="absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-glow shadow-glow">
            <Search className="h-4 w-4 text-primary-foreground" />
          </div>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground"
            placeholder="Ask anything…"
          />
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-glow px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" /> Synthesize
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["definition", "intuition", "applications", "edge cases", "related concepts"].map((t) => (
            <button key={t} className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* AI synthesis */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass relative overflow-hidden rounded-2xl p-6 shadow-soft">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-glow opacity-20 blur-3xl" />
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> AI Synthesis · 3 sources
        </div>
        <p className="text-base leading-relaxed">
          An <span className="text-gradient-aurora font-semibold">eigenvector</span> is a direction that a linear transformation
          only <em>stretches</em> — never rotates. The factor of stretch is the <span className="text-gradient-aurora font-semibold">eigenvalue</span>.
          They reveal the <span className="text-foreground">"natural axes"</span> of a system, which is why they appear in PCA,
          quantum states, vibration modes, and PageRank.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {RESULTS.map((r, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground">
              [{i+1}] {r.source}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Clustered results */}
      <div className="grid gap-3">
        {RESULTS.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            whileHover={{ y: -2 }}
            className="glass group rounded-2xl p-5 shadow-soft transition-shadow hover:shadow-glow"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-cyan/20 text-accent-cyan">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-display text-base font-semibold">{r.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">conf {Math.round(r.confidence*100)}%</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-glow" style={{ width: `${r.confidence*100}%` }} />
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.snippet}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.source}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                  ))}
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Concept links */}
      <div className="glass rounded-2xl p-5">
        <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Network className="h-3 w-3" /> Concept neighborhood
        </div>
        <div className="flex flex-wrap gap-2">
          {["Determinant", "Diagonalization", "PCA", "Spectral theorem", "Markov chain", "Quadratic form", "Singular values"].map((c) => (
            <button key={c} className="rounded-full border border-border/60 bg-secondary/30 px-3 py-1.5 text-xs hover:border-primary/40 hover:bg-secondary/60">
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
