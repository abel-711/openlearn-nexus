import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Query too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("id, code, title, chapter_number, storage_path, part_id, subject_parts(slug, name, part_number, subjects(slug, name))")
      .order("sort_order");
    if (error) throw error;

    const catalog = (chapters ?? []).map((c: any) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      chapter: c.chapter_number,
      subject: c.subject_parts?.subjects?.name,
      part: c.subject_parts?.name,
    }));

    const systemPrompt = `You are the OPENLearn Vault retrieval engine. You receive a learner's query and a catalog of chapters (subject, part, chapter number, title). Your job:
1. Identify chapters whose topic semantically matches the query (handle synonyms, typos, related concepts).
2. Return up to 5 ranked matches with a relevance score 0-1.
3. For each match, write a 2-3 sentence contextual, AI-curated quote that explains how the topic appears in that chapter — written as if quoted from the chapter, but synthesized to read clean and pedagogical. Do NOT invent fake citations.
4. Extract 2-4 key matched concepts as short phrases.
5. If nothing matches well, return an empty matches array.
Always call the tool report_matches.`;

    const userPrompt = `Query: "${query}"\n\nCatalog (JSON):\n${JSON.stringify(catalog)}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_matches",
            description: "Report ranked chapter matches",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      chapter_id: { type: "string" },
                      relevance: { type: "number" },
                      quote: { type: "string" },
                      concepts: { type: "array", items: { type: "string" } },
                    },
                    required: ["chapter_id", "relevance", "quote", "concepts"],
                  },
                },
                summary: { type: "string", description: "1-2 sentence synthesis of how the vault covers this topic" },
              },
              required: ["matches", "summary"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_matches" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited, please retry shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      throw new Error("AI gateway error");
    }

    const ai = await aiResp.json();
    const args = ai.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { matches: [], summary: "" };

    // Hydrate matches with full chapter info + storage URL
    const byId = new Map((chapters ?? []).map((c: any) => [c.id, c]));
    const hydrated = (parsed.matches ?? [])
      .map((m: any) => {
        const ch: any = byId.get(m.chapter_id);
        if (!ch) return null;
        const { data: pub } = supabase.storage.from("materials").getPublicUrl(ch.storage_path);
        return {
          chapter_id: ch.id,
          code: ch.code,
          title: ch.title,
          chapter_number: ch.chapter_number,
          subject: ch.subject_parts?.subjects?.name,
          subject_slug: ch.subject_parts?.subjects?.slug,
          part: ch.subject_parts?.name,
          storage_path: ch.storage_path,
          pdf_url: pub.publicUrl,
          relevance: Math.max(0, Math.min(1, m.relevance ?? 0)),
          quote: m.quote,
          concepts: m.concepts ?? [],
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.relevance - a.relevance);

    return new Response(JSON.stringify({ matches: hydrated, summary: parsed.summary, query }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("library-search error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});