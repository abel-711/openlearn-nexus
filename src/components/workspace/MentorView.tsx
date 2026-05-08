import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Mic, BookOpen, Loader2, GraduationCap, Brain, Lightbulb,
  RotateCcw, ChevronRight, FileText, Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string };
type Chapter = {
  id: string; code: string; title: string; chapter_number: number | null;
  storage_path: string; subject: string; part: string; pdf_url: string;
};
type Level = "simple" | "medium" | "advanced";

const LEVELS: { key: Level; label: string; icon: typeof Brain; hint: string }[] = [
  { key: "simple", label: "Simple", icon: Lightbulb, hint: "Beginner-friendly" },
  { key: "medium", label: "Balanced", icon: Brain, hint: "Undergrad depth" },
  { key: "advanced", label: "Advanced", icon: GraduationCap, hint: "Rigorous" },
];

const STARTERS = [
  "Explain backpropagation step by step",
  "Solve a linear algebra eigenvalue problem",
  "What's the intuition behind the Fourier transform?",
  "How do I prepare for my next exam this week?",
];

/** Parse [[CODE]] markers and ```followups``` block out of streamed text. */
function parseAssistant(raw: string) {
  let body = raw;
  let followups: string[] = [];

  const fuMatch = body.match(/```followups\s*([\s\S]*?)```/i);
  if (fuMatch) {
    try {
      const parsed = JSON.parse(fuMatch[1].trim());
      if (Array.isArray(parsed)) followups = parsed.filter((x) => typeof x === "string").slice(0, 4);
    } catch { /* ignore partial */ }
    body = body.replace(fuMatch[0], "").trim();
  }

  const codeRe = /\[\[([A-Z0-9][A-Z0-9\-_.]+)\]\]/g;
  const cited = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = codeRe.exec(body)) !== null) cited.add(m[1]);

  return { body, citationCodes: Array.from(cited), followups };
}

/** Render markdown with citations replaced by superscript chips. */
function renderMarkdownWithCitations(body: string, chapters: Map<string, Chapter>) {
  // Replace [[CODE]] with markdown links to a special anchor we intercept in components.
  const codeRe = /\[\[([A-Z0-9][A-Z0-9\-_.]+)\]\]/g;
  let counter = 0;
  const order = new Map<string, number>();
  const transformed = body.replace(codeRe, (_, code) => {
    if (!order.has(code)) order.set(code, ++counter);
    return `[^${order.get(code)}^](#cite-${code})`;
  });
  return { transformed, order };
}

export const MentorView = ({ initial }: { initial?: string }) => {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [level, setLevel] = useState<Level>("medium");
  const [chapters, setChapters] = useState<Map<string, Chapter>>(new Map());
  const [followups, setFollowups] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load chapter catalog once for citation resolution
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chapters")
        .select("id, code, title, chapter_number, storage_path, subject_parts(name, subjects(name))");
      if (!data) return;
      const map = new Map<string, Chapter>();
      for (const c of data as any[]) {
        const { data: pub } = supabase.storage.from("materials").getPublicUrl(c.storage_path);
        map.set(c.code, {
          id: c.id, code: c.code, title: c.title, chapter_number: c.chapter_number,
          storage_path: c.storage_path, pdf_url: pub.publicUrl,
          subject: c.subject_parts?.subjects?.name ?? "",
          part: c.subject_parts?.name ?? "",
        });
      }
      setChapters(map);
    })();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, streaming]);

  useEffect(() => {
    if (initial) ask(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const ask = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || busy) return;
    setText("");
    setFollowups([]);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setBusy(true);
    setStreaming("");

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`,
        {
          method: "POST",
          signal: ctrl.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            level,
            messages: next.map((m) => ({ role: m.role, content: m.content })),
          }),
        },
      );

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limited — please retry shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error("Mentor failed to respond.");
        setStreaming(null); setBusy(false); return;
      }

      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              acc += c;
              // hide followups block while streaming
              const visible = acc.replace(/```followups[\s\S]*$/i, "").trimEnd();
              setStreaming(visible);
            }
          } catch {
            buf = line + "\n" + buf; break;
          }
        }
      }

      const parsed = parseAssistant(acc);
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: parsed.body }]);
      setFollowups(parsed.followups);
      setStreaming(null);
    } catch (e: any) {
      if (e?.name !== "AbortError") toast.error(`Mentor error: ${e.message}`);
      setStreaming(null);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();
  const reset = () => { setMsgs([]); setFollowups([]); setStreaming(null); };

  const isEmpty = msgs.length === 0 && streaming === null;

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col gap-4">
      {/* Header */}
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3 shadow-soft">
        <motion.div
          className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-glow shadow-glow"
          animate={{ scale: busy ? [1, 1.08, 1] : 1 }}
          transition={{ duration: 1.2, repeat: busy ? Infinity : 0 }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : <Sparkles className="h-4 w-4 text-primary-foreground" />}
        </motion.div>
        <div className="min-w-0">
          <div className="font-display text-sm font-semibold">Vault Mentor</div>
          <div className="text-[11px] text-muted-foreground">
            Grounded in {chapters.size} chapters · {busy ? "thinking…" : "ready"}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 rounded-xl border border-border/50 bg-secondary/30 p-1">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLevel(l.key)}
              title={l.hint}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] transition-all ${
                level === l.key
                  ? "bg-gradient-glow text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <l.icon className="h-3 w-3" />
              {l.label}
            </button>
          ))}
        </div>

        {msgs.length > 0 && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-2 py-2">
          {isEmpty && <EmptyState onPick={(s) => ask(s)} />}

          {msgs.map((m) => (
            <MessageBubble key={m.id} msg={m} chapters={chapters} />
          ))}

          {streaming !== null && (
            <StreamingBubble text={streaming} chapters={chapters} />
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Follow-up chips */}
      <AnimatePresence>
        {followups.length > 0 && !busy && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-2"
          >
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              <Wand2 className="h-3 w-3 text-primary" /> Continue with
            </span>
            {followups.map((f) => (
              <button
                key={f}
                onClick={() => ask(f)}
                className="glass inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-foreground/90 hover:shadow-glow"
              >
                {f} <ChevronRight className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <div className="glass mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl px-3 py-2 shadow-soft">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (text.trim()) ask(text);
            }
          }}
          placeholder="Ask about any chapter, derivation, problem, or concept…"
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
          title="Voice (coming soon)"
        >
          <Mic className="h-4 w-4" />
        </button>
        {busy ? (
          <button
            onClick={stop}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/60 px-3 text-xs hover:bg-secondary/60"
          >
            <span className="h-2 w-2 rounded-sm bg-destructive" /> Stop
          </button>
        ) : (
          <button
            onClick={() => text.trim() && ask(text)}
            disabled={!text.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-glow text-primary-foreground shadow-glow disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ---------------- subcomponents ---------------- */

const EmptyState = ({ onPick }: { onPick: (s: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="glass relative overflow-hidden rounded-3xl p-8 shadow-elevated"
  >
    <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gradient-glow opacity-25 blur-3xl" />
    <div className="relative">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/40 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" /> Mentor mode
      </div>
      <h2 className="font-display text-3xl font-semibold leading-tight">
        Ask me anything from your <span className="text-gradient-aurora">Vault</span>.
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        I read your library — chapters, notes, materials — and teach you with intuition,
        derivations, examples, and citations. Try one of these to begin:
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="glass rounded-xl px-3 py-2 text-left text-xs text-foreground/90 transition-all hover:shadow-glow"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  </motion.div>
);

const MessageBubble = ({ msg, chapters }: { msg: Msg; chapters: Map<string, Chapter> }) => {
  if (msg.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-gradient-glow px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-soft">
          {msg.content}
        </div>
      </motion.div>
    );
  }
  return <AssistantBubble text={msg.content} chapters={chapters} />;
};

const StreamingBubble = ({ text, chapters }: { text: string; chapters: Map<string, Chapter> }) => (
  <AssistantBubble text={text} chapters={chapters} streaming />
);

const AssistantBubble = ({
  text, chapters, streaming = false,
}: { text: string; chapters: Map<string, Chapter>; streaming?: boolean }) => {
  const { transformed, order } = useMemo(
    () => renderMarkdownWithCitations(text, chapters),
    [text, chapters],
  );

  const cited = useMemo(() => {
    return Array.from(order.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([code, n]) => ({ code, n, chapter: chapters.get(code) }))
      .filter((c) => c.chapter);
  }, [order, chapters]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="glass relative w-full max-w-full rounded-2xl px-5 py-4 shadow-soft">
        <article className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-code:rounded prose-code:bg-secondary/50 prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-background/60 prose-pre:border prose-pre:border-border/50">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              a: ({ href, children, ...rest }) => {
                if (href?.startsWith("#cite-")) {
                  const code = href.replace("#cite-", "");
                  const ch = chapters.get(code);
                  if (!ch) return <sup className="text-muted-foreground">{children}</sup>;
                  return (
                    <a
                      href={ch.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      title={`${ch.subject} · ${ch.title}`}
                      className="ml-0.5 inline-flex items-center rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary no-underline hover:bg-primary/20"
                    >
                      {children}
                    </a>
                  );
                }
                return <a href={href} target="_blank" rel="noreferrer" {...rest}>{children}</a>;
              },
            }}
          >
            {transformed || (streaming ? "…" : "")}
          </ReactMarkdown>
          {streaming && (
            <span className="ml-1 inline-block h-3 w-1 -translate-y-0.5 animate-pulse bg-primary align-middle" />
          )}
        </article>

        {cited.length > 0 && (
          <div className="mt-4 border-t border-border/40 pt-3">
            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <BookOpen className="h-3 w-3 text-primary" /> Sources from your Vault
            </div>
            <div className="flex flex-col gap-1.5">
              {cited.map(({ code, n, chapter }) => (
                <a
                  key={code}
                  href={chapter!.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-2 rounded-lg border border-border/40 bg-secondary/20 p-2 text-xs transition-all hover:border-primary/40 hover:bg-secondary/40"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-primary/15 font-mono text-[10px] text-primary">
                    {n}
                  </span>
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{chapter!.title}</div>
                    <div className="truncate text-[10px] text-muted-foreground">
                      {chapter!.subject}{chapter!.part ? ` · ${chapter!.part}` : ""}
                      {chapter!.chapter_number ? ` · Ch. ${chapter!.chapter_number}` : ""}
                      {" · "}<span className="font-mono">{code}</span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};