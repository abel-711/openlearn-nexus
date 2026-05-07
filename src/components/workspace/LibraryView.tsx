import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Download, FileText, Loader2, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Subject = { id: string; slug: string; name: string; color: string | null };
type Part = { id: string; subject_id: string; slug: string; name: string; part_number: number };
type Chapter = {
  id: string;
  part_id: string;
  code: string;
  title: string;
  chapter_number: number | null;
  kind: string;
  storage_path: string;
  sort_order: number;
};

const KIND_LABEL: Record<string, string> = {
  chapter: "Chapter",
  appendix: "Appendix",
  answers: "Answers",
  preface: "Preface",
};

export const LibraryView = ({ initialSubject }: { initialSubject?: string }) => {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activePart, setActivePart] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const [s, p, c] = await Promise.all([
        supabase.from("subjects").select("*").order("name"),
        supabase.from("subject_parts").select("*").order("part_number"),
        supabase.from("chapters").select("*").order("sort_order"),
      ]);
      setSubjects(s.data ?? []);
      setParts(p.data ?? []);
      setChapters(c.data ?? []);
      const first = (s.data ?? []).find((x) => x.slug === initialSubject) ?? (s.data ?? [])[0];
      if (first) {
        setActiveSubject(first.id);
        const firstPart = (p.data ?? []).find((pp) => pp.subject_id === first.id);
        if (firstPart) setActivePart(firstPart.id);
      }
      setLoading(false);
    })();
  }, [initialSubject]);

  const subjectParts = useMemo(
    () => parts.filter((p) => p.subject_id === activeSubject),
    [parts, activeSubject]
  );
  const partChapters = useMemo(() => {
    const list = chapters.filter((c) => c.part_id === activePart);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [chapters, activePart, query]);

  const activeSubjectObj = subjects.find((s) => s.id === activeSubject);

  const publicUrl = (path: string) =>
    supabase.storage.from("materials").getPublicUrl(path).data.publicUrl;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading library…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative overflow-hidden rounded-3xl p-6 shadow-elevated"
      >
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-gradient-glow opacity-20 blur-3xl" />
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-glow shadow-glow">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold">Material Library</h1>
            <p className="text-sm text-muted-foreground">
              Browse chapters and download PDFs across all subjects.
            </p>
          </div>
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chapters…"
              className="w-64 rounded-xl border border-border/60 bg-secondary/40 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40"
            />
          </div>
        </div>

        {/* Subject tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {subjects.map((s) => {
            const isActive = s.id === activeSubject;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSubject(s.id);
                  const fp = parts.find((p) => p.subject_id === s.id);
                  setActivePart(fp?.id ?? null);
                }}
                className={cn(
                  "group relative rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-foreground shadow-glow"
                    : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: `hsl(var(--${s.color || "primary"}))` }}
                />
                {s.name}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        {/* Parts column */}
        <div className="glass flex flex-col gap-1 rounded-2xl p-3 shadow-soft">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {activeSubjectObj?.name ?? "Subject"}
          </div>
          {subjectParts.map((p) => {
            const active = p.id === activePart;
            const count = chapters.filter((c) => c.part_id === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setActivePart(p.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all",
                  active
                    ? "bg-primary/10 text-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <span className="font-medium">{p.name}</span>
                <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chapters list */}
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {partChapters.map((c, i) => (
              <motion.a
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ y: -2 }}
                href={publicUrl(c.storage_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group flex items-center gap-4 rounded-2xl p-4 shadow-soft transition-shadow hover:shadow-glow"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-cyan/20 text-accent-cyan">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-semibold">
                      {c.chapter_number ? `Ch. ${c.chapter_number} · ` : ""}
                      {c.title}
                    </h4>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px]">
                      {KIND_LABEL[c.kind] ?? c.kind}
                    </span>
                    <span className="font-mono text-[10px] uppercase">{c.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Download className="h-4 w-4 opacity-60 transition group-hover:text-primary group-hover:opacity-100" />
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
          {partChapters.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
              No chapters match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};