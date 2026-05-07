import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, FileText, BookOpen, Download, NotebookPen, Wand2, Youtube, Loader2, ExternalLink, Bookmark, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Match = {
  chapter_id: string;
  code: string;
  title: string;
  chapter_number: number | null;
  subject: string;
  subject_slug: string;
  part: string;
  pdf_url: string;
  storage_path: string;
  relevance: number;
  quote: string;
  concepts: string[];
};

type Video = {
  id: string; title: string; channel: string; thumbnail: string;
  duration: string; views: number; trusted: boolean; relevance: number; url: string;
};

const SUGGESTIONS = [
  "Coordination compounds", "Electrochemistry", "Integrals",
  "Inverse trigonometric functions", "Alternating current", "Biomolecules",
];

export const SearchView = ({ initialQuery }: { initialQuery?: string }) => {
  const [q, setQ] = useState(initialQuery ?? "");
  const [matches, setMatches] = useState<Match[]>([]);
  const [summary, setSummary] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [loadingYt, setLoadingYt] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiText, setAiText] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("savedVideos") || "[]"); } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const run = async (query: string) => {
    if (!query.trim()) return;
    setMatches([]); setSummary(""); setVideos([]); setAiText({});
    setLoadingLib(true); setLoadingYt(true);

    const libP = supabase.functions.invoke("library-search", { body: { query } })
      .then(({ data, error }) => {
        if (error) throw error;
        if ((data as any)?.error) throw new Error((data as any).error);
        setMatches(data.matches || []);
        setSummary(data.summary || "");
      })
      .catch((e: any) => toast.error(`Library search failed: ${e.message}`))
      .finally(() => setLoadingLib(false));

    const ytP = supabase.functions.invoke("youtube-search", { body: { query, max: 6 } })
      .then(({ data, error }) => {
        if (error) throw error;
        setVideos(data.videos || []);
      })
      .catch((e: any) => toast.error(`Video search failed: ${e.message}`))
      .finally(() => setLoadingYt(false));

    await Promise.all([libP, ytP]);
  };

  useEffect(() => { if (initialQuery) run(initialQuery); /* eslint-disable-next-line */ }, [initialQuery]);

  const generateSummary = async (m: Match) => {
    setAiBusy(m.chapter_id);
    setAiText((p) => ({ ...p, [m.chapter_id]: "" }));
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chapter-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ chapter_title: m.title, subject: m.subject, query: q }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limited, try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Summary failed");
        setAiBusy(null); return;
      }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) setAiText((prev) => ({ ...prev, [m.chapter_id]: (prev[m.chapter_id] || "") + c }));
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } finally { setAiBusy(null); }
  };

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("savedVideos", JSON.stringify(next));
      return next;
    });
  };

  const highlight = (text: string, terms: string[]) => {
    if (!terms.length) return text;
    const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return text.split(re).map((part, i) =>
      re.test(part) ? <mark key={i} className="rounded bg-primary/20 px-0.5 text-foreground">{part}</mark> : <span key={i}>{part}</span>,
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative overflow-hidden rounded-3xl p-6 shadow-elevated"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-60"
          style={{ background: "conic-gradient(from 0deg, hsl(var(--accent-blue)/0.25), hsl(var(--accent-violet)/0.25), hsl(var(--accent-cyan)/0.25), hsl(var(--accent-blue)/0.25))", filter: "blur(28px)" }}
          animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative flex items-center gap-3">
          <motion.div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-glow shadow-glow"
            animate={{ scale: loadingLib || loadingYt ? [1, 1.08, 1] : 1 }} transition={{ duration: 1.2, repeat: Infinity }}>
            {loadingLib || loadingYt ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : <Search className="h-4 w-4 text-primary-foreground" />}
          </motion.div>
          <input
            ref={inputRef}
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(q)}
            className="flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted-foreground/60"
            placeholder="Ask the Vault — semantic search across chapters, notes & videos…"
          />
          <button onClick={() => run(q)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-glow px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90">
            <Sparkles className="h-4 w-4" /> Search
          </button>
        </div>
        {!q && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setQ(s); run(s); }}
                className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                {s}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {(loadingLib || summary) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass relative overflow-hidden rounded-2xl p-6 shadow-soft">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-glow opacity-20 blur-3xl" />
            <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> AI Synthesis {matches.length > 0 && `· ${matches.length} library sources`}
            </div>
            {loadingLib && !summary ? (
              <div className="space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-secondary/60" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-secondary/40" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-secondary/30" />
              </div>
            ) : (
              <p className="text-base leading-relaxed">{summary}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {matches.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <Layers className="h-3 w-3 text-primary" /> From your Vault
          </div>
          {matches.map((m, i) => (
            <motion.div key={m.chapter_id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass group rounded-2xl p-5 shadow-soft transition-shadow hover:shadow-glow">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-cyan/20 text-accent-cyan">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-display text-base font-semibold">{m.title}</h4>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Library → <span className="text-foreground">{m.subject}</span> · {m.part}
                        {m.chapter_number ? <> · Ch. {m.chapter_number}</> : null} · <span className="font-mono">{m.code}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{Math.round(m.relevance * 100)}%</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-gradient-glow" style={{ width: `${m.relevance * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <blockquote className="mt-3 rounded-xl border-l-2 border-primary/60 bg-secondary/30 p-4 text-sm italic text-foreground/90">
                    "{highlight(m.quote, m.concepts)}"
                  </blockquote>

                  {m.concepts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.concepts.map((c) => (
                        <span key={c} className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{c}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={m.pdf_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                      <BookOpen className="h-3.5 w-3.5" /> Open Chapter
                    </a>
                    <a href={m.pdf_url} download
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:bg-secondary/60">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </a>
                    <button
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:bg-secondary/60"
                      onClick={() => toast.info("Notes coming soon")}>
                      <NotebookPen className="h-3.5 w-3.5" /> Open Notes
                    </button>
                    <button
                      disabled={aiBusy === m.chapter_id}
                      onClick={() => generateSummary(m)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-glow px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-60">
                      {aiBusy === m.chapter_id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      Generate AI Summary
                    </button>
                  </div>

                  <AnimatePresence>
                    {aiText[m.chapter_id] && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden rounded-xl border border-border/40 bg-background/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                        {aiText[m.chapter_id]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {!loadingLib && matches.length === 0 && q && (
        <div className="glass rounded-2xl p-5 text-sm text-muted-foreground">
          No matching chapters in your Vault — see curated videos below.
        </div>
      )}

      {(loadingYt || videos.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            <Youtube className="h-3 w-3 text-[hsl(var(--accent-violet))]" /> Curated learning videos
          </div>
          {loadingYt ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => <div key={i} className="glass h-40 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {videos.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass group flex gap-3 overflow-hidden rounded-2xl p-3 shadow-soft hover:shadow-glow">
                  <a href={v.url} target="_blank" rel="noreferrer" className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    <img src={v.thumbnail} alt={v.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    <span className="absolute bottom-1 right-1 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">{v.duration}</span>
                  </a>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="line-clamp-2 text-sm font-medium leading-snug">{v.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{v.channel}</span>
                      {v.trusted && <span className="rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0 text-[9px] text-primary">Trusted</span>}
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-14 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-gradient-glow" style={{ width: `${v.relevance * 100}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{Math.round(v.relevance * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleSave(v.id)} title="Save for revision"
                          className={`grid h-7 w-7 place-items-center rounded-md hover:bg-secondary/60 ${saved.includes(v.id) ? "text-primary" : "text-muted-foreground"}`}>
                          <Bookmark className="h-3.5 w-3.5" fill={saved.includes(v.id) ? "currentColor" : "none"} />
                        </button>
                        <a href={v.url} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20">
                          <ExternalLink className="h-3 w-3" /> Watch
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};