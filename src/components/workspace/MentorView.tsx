import { motion } from "framer-motion";
import { Sparkles, Send, Paperclip, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "ai"; content: string; citations?: string[] };

const SEED: Msg[] = [
  { role: "user", content: "Explain backpropagation like I'm a senior undergrad." },
  {
    role: "ai",
    content:
      "Backpropagation is just the chain rule, automated. We compute the loss, then walk backward layer by layer, multiplying local gradients to find how each weight should change to reduce the loss the fastest.",
    citations: ["Goodfellow §6.5", "CS231n notes"],
  },
];

export const MentorView = ({ initial }: { initial?: string }) => {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, streaming]);
  useEffect(() => { if (initial) ask(initial); /* eslint-disable-next-line */ }, [initial]);

  const ask = (q: string) => {
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setText("");
    const reply = "Great question. Here's the intuition first, then the math: we treat the network as a chain of differentiable functions, then apply the chain rule layer by layer to attribute the loss back to each weight. The gradient tells us the steepest local descent direction.";
    let i = 0;
    setStreaming("");
    const id = setInterval(() => {
      i += 3;
      setStreaming(reply.slice(0, i));
      if (i >= reply.length) {
        clearInterval(id);
        setStreaming(null);
        setMsgs((m) => [...m, { role: "ai", content: reply, citations: ["Vault: Notes/NN-derivations", "Goodfellow Ch.6"] }]);
      }
    }, 28);
  };

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col gap-4">
      <div className="glass flex items-center gap-3 rounded-2xl px-5 py-3 shadow-soft">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-glow shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-display text-sm font-semibold">Vault Mentor</div>
          <div className="text-[11px] text-muted-foreground">Tuned to your notes · responses are grounded</div>
        </div>
        <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/40 px-2.5 py-1 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" /> online
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-2 py-2">
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft ${m.role === "user" ? "bg-gradient-glow text-primary-foreground" : "glass"}`}>
                {m.content}
                {m.citations && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.citations.map((c) => (
                      <span key={c} className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {streaming !== null && (
            <div className="flex justify-start">
              <div className="glass max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft">
                {streaming}
                <span className="ml-1 inline-block h-3 w-1 -translate-y-0.5 bg-primary align-middle" style={{ animation: "blink 1s step-end infinite" }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Suggestions */}
      <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-2 px-2">
        {["Show me the math", "Give a worked example", "Compare to forward-mode autodiff"].map((s) => (
          <button key={s} onClick={() => ask(s)} className="glass rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:shadow-glow">
            {s}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="glass mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl px-3 py-2 shadow-soft">
        <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && text.trim() && ask(text.trim())}
          placeholder="Ask the mentor anything…"
          className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"><Mic className="h-4 w-4" /></button>
        <button onClick={() => text.trim() && ask(text.trim())} className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-glow text-primary-foreground shadow-glow">
          <Send className="h-4 w-4" />
        </button>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};
