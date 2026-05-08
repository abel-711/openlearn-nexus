import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMsg = { role: "user" | "assistant"; content: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, level } = await req.json() as { messages: ChatMsg[]; level?: "simple" | "medium" | "advanced" };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load chapter catalog (lightweight: title + subject + part + code)
    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("id, code, title, chapter_number, subject_parts(name, subjects(name))")
      .order("sort_order");
    if (error) throw error;

    const catalog = (chapters ?? []).map((c: any) => ({
      code: c.code,
      title: c.title,
      ch: c.chapter_number,
      subject: c.subject_parts?.subjects?.name,
      part: c.subject_parts?.name,
    }));

    const levelGuidance = {
      simple: "Explain like the student is a beginner. Use everyday analogies, avoid jargon, and keep math minimal.",
      medium: "Explain at undergraduate level. Balance intuition with rigor. Show key formulas.",
      advanced: "Explain rigorously with full derivations, edge cases, and references to related advanced topics.",
    }[level ?? "medium"];

    const systemPrompt = `You are the OPENLearn Vault Mentor — an expert, warm, deeply knowledgeable personal tutor for this student.

You have access to the student's library catalog (chapters they own). When a question relates to chapters in the catalog, you MUST ground your answer in those chapters and cite them inline using the marker [[CODE]] where CODE is the chapter code (e.g. [[MATH-12-LA-01]]). Use multiple citations when relevant.

TEACHING STYLE:
- ${levelGuidance}
- Always teach — never give one-line answers. Build intuition first, then formalism.
- Structure with short paragraphs, headings, and bullet points where useful.
- Use markdown: **bold**, lists, tables, fenced \`\`\`code\`\`\` blocks with language tags.
- Use LaTeX for math: $inline$ and $$display$$ blocks.
- Connect concepts: mention prerequisites and related ideas.
- For numerical problems: show step-by-step solution. For derivations: justify each step. For code: explain the logic before/after the snippet.
- Use analogies, examples, and worked cases.
- If the library covers the topic, prefer its framing. If it does not, answer from general expertise but say so briefly.

CONVERSATIONAL MEMORY:
- Reference earlier turns naturally ("as we discussed above…").
- Adapt depth based on follow-ups.

CITATION RULES:
- Only cite codes that appear in the catalog below. Never invent codes.
- Place [[CODE]] markers immediately after the relevant claim, not in a bibliography.

FOLLOW-UPS:
At the very end of your response, on its own line, output a JSON block:
\`\`\`followups
["short follow-up question 1", "short follow-up 2", "short follow-up 3"]
\`\`\`
These should be the most useful next questions a curious student would ask.

LIBRARY CATALOG (JSON):
${JSON.stringify(catalog)}`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-12), // keep recent context
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: aiMessages,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      throw new Error(`AI error ${resp.status}`);
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("mentor-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});