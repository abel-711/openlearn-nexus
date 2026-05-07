const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRUSTED_CHANNELS = [
  "freeCodeCamp.org",
  "MIT OpenCourseWare",
  "Khan Academy",
  "Stanford",
  "3Blue1Brown",
  "Neso Academy",
  "Gate Smashers",
  "Fireship",
];

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || "0"), mn = parseInt(m[2] || "0"), s = parseInt(m[3] || "0");
  return h > 0 ? `${h}:${String(mn).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${mn}:${String(s).padStart(2, "0")}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, max = 6 } = await req.json();
    const KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!KEY) throw new Error("YOUTUBE_API_KEY missing");
    if (!query) throw new Error("query required");

    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", `${query} explained tutorial`);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("relevanceLanguage", "en");
    searchUrl.searchParams.set("maxResults", String(Math.min(max * 3, 25)));
    searchUrl.searchParams.set("key", KEY);

    const sResp = await fetch(searchUrl);
    if (!sResp.ok) {
      const t = await sResp.text();
      console.error("YouTube search error", sResp.status, t);
      throw new Error(`YouTube error ${sResp.status}`);
    }
    const sData = await sResp.json();
    const ids: string[] = (sData.items ?? []).map((i: any) => i.id.videoId).filter(Boolean);
    if (!ids.length) return new Response(JSON.stringify({ videos: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.searchParams.set("part", "snippet,contentDetails,statistics");
    detailsUrl.searchParams.set("id", ids.join(","));
    detailsUrl.searchParams.set("key", KEY);
    const dResp = await fetch(detailsUrl);
    const dData = await dResp.json();

    const videos = (dData.items ?? []).map((v: any) => {
      const channel = v.snippet.channelTitle as string;
      const trusted = TRUSTED_CHANNELS.some((c) => channel.toLowerCase().includes(c.toLowerCase()));
      const views = parseInt(v.statistics?.viewCount ?? "0");
      const likes = parseInt(v.statistics?.likeCount ?? "0");
      const ratio = views > 0 ? likes / views : 0;
      const score = (trusted ? 0.5 : 0) + Math.min(0.3, Math.log10(views + 1) / 25) + Math.min(0.2, ratio * 5);
      return {
        id: v.id,
        title: v.snippet.title,
        channel,
        thumbnail: v.snippet.thumbnails?.medium?.url,
        duration: parseDuration(v.contentDetails.duration),
        views,
        trusted,
        relevance: Math.min(1, score),
        url: `https://www.youtube.com/watch?v=${v.id}`,
      };
    }).sort((a: any, b: any) => b.relevance - a.relevance).slice(0, max);

    return new Response(JSON.stringify({ videos }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("youtube-search error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});