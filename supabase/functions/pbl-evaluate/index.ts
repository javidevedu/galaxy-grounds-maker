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

    const conversationText = (messages || [])
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'AI Companion'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an expert English language evaluator. Analyze the following conversation between a student and an AI learning companion.

ACTIVITY CONTEXT:
- CEFR Level: ${activity.mcer_level}
- Knowledge Area: ${activity.knowledge_area}
- Grammar Topics evaluated: ${activity.grammar_topics}
- Skills: ${activity.skills?.join(', ')}

CONVERSATION:
${conversationText}

Evaluate the student's performance and respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "score": <number 0-100 based on correct usage, not errors>,
  "feedback": {
    "skills": {
      "grammar": {
        "score": <number 0-100>,
        "comment": "<brief feedback on grammar usage>"
      },
      "vocabulary": {
        "score": <number 0-100>,
        "comment": "<brief feedback on vocabulary>"
      },
      "comprehension": {
        "score": <number 0-100>,
        "comment": "<brief feedback on comprehension>"
      },
      "context_usage": {
        "score": <number 0-100>,
        "comment": "<brief feedback on using English in context>"
      }
    },
    "tips": ["<tip1>", "<tip2>", "<tip3>"],
    "general_comment": "<overall encouraging feedback like a teacher would give>"
  }
}

RULES:
- Score based on CORRECT usage, not penalize for errors
- Be encouraging and constructive
- Tips should be actionable and specific
- Adapt feedback to CEFR level ${activity.mcer_level}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Please evaluate the student's performance now." },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI eval error:", response.status);
      return new Response(JSON.stringify({ score: 0, feedback: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let result;
    try {
      // Try to extract JSON from possible markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch?.[0] || content);
    } catch {
      console.error("Failed to parse evaluation:", content);
      result = { score: 0, feedback: null };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pbl-evaluate error:", e);
    return new Response(JSON.stringify({ score: 0, feedback: null }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
