import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, activity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an intelligent and friendly English learning companion in a Problem-Based Learning (PBL) activity.

ACTIVITY DETAILS:
- Title: ${activity.title}
- CEFR Level: ${activity.mcer_level}
- Knowledge Area: ${activity.knowledge_area}
- Grammar Topics to practice: ${activity.grammar_topics}
- Skills to integrate: ${activity.skills?.join(', ')}

YOUR ROLE:
1. Present a contextualized problem related to the knowledge area "${activity.knowledge_area}" that requires using the grammar topics listed above.
2. Guide the student through solving the problem via interactive conversation.
3. Ask progressive questions that help the student think and respond in English.
4. Integrate activities naturally:
   - READING: Present short texts or passages for comprehension
   - WRITING: Ask the student to write responses, explanations, or summaries
   - LISTENING: Describe scenarios for the student to respond to (mark listening prompts with 🎧)
5. Detect errors in grammar, vocabulary, and comprehension IN REAL TIME.
6. Provide corrections immediately but naturally — don't break the flow. Use a friendly format like: "Great idea! Just a small note: instead of '...' you could say '...' ✨"
7. Keep the conversation natural and engaging, like a supportive peer.
8. Adapt your language complexity to CEFR level ${activity.mcer_level}.
9. After several exchanges, guide toward solving the problem.

IMPORTANT RULES:
- Always respond in English
- Be encouraging and positive — focus on what the student does RIGHT
- Never use the words "quiz", "exam", or pressure language — this is a learning activity
- Keep messages concise and conversational
- Use emojis sparingly to keep it friendly
- If this is the first message (no prior conversation), introduce yourself, present the problem, and ask the first question`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    // If no user messages yet, add a trigger
    if (!messages || messages.length === 0) {
      aiMessages.push({
        role: "user",
        content: "Hi! I'm ready to start the activity.",
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pbl-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
