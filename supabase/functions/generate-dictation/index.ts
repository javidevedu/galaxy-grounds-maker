import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const topic = String(body.topic ?? "").slice(0, 200);
    const level = String(body.level ?? "A2").slice(0, 10);
    const count = Math.min(Math.max(parseInt(String(body.count ?? 1), 10) || 1, 1), 3);
    const context = String(body.context ?? "").slice(0, 500);

    if (!topic) {
      return new Response(JSON.stringify({ error: "El tema es obligatorio" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Create ${count} short English dictation paragraph(s) for CEFR level ${level}.
Main topic / grammar focus that must clearly appear in each paragraph: ${topic}.
${context ? `Extra context from the teacher: ${context}` : ""}

Rules for EVERY paragraph:
- Exactly 3 sentences, no more than 3 lines of text (max ~40 words total).
- The paragraph must present a small problem or situation (something that goes wrong, a dilemma or a difficulty).
- Natural, clear English appropriate for level ${level}.
- Punctuation must be simple and dictation friendly.

Return ONLY valid JSON (no markdown) with this exact shape:
{ "paragraphs": [ { "english": "...", "spanish": "..." } ] }
"spanish" is a faithful Spanish translation of "english".`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert English teacher. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI request failed", details: errorText }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content ?? "";
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ paragraphs: parsed.paragraphs ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-dictation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
