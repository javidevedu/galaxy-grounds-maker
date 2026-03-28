import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { attempt_id, question_id, student_answer, topics, model_answer } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `You are an English language teacher grading a student's writing assignment.

The student was asked to write a text using these topics/grammar structures: ${topics}

Model answer for reference: ${model_answer}

Student's answer: "${student_answer}"

Analyze the student's writing and return ONLY valid JSON (no markdown) with this structure:
{
  "spelling_errors": [
    { "word": "misspelled word", "correction": "correct spelling", "context": "the sentence where it appears" }
  ],
  "grammar_errors": [
    { "error": "description of error", "correction": "how to fix it", "context": "the sentence" }
  ],
  "topics_used": ["list of required topics the student successfully used"],
  "topics_missing": ["list of required topics the student did NOT use"],
  "overall_score": 0-10,
  "feedback": "Brief overall feedback paragraph"
}

Be thorough but fair. If the student's text is empty or nonsensical, give a score of 0.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
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
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response");

    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const feedback = JSON.parse(jsonStr);

    // Update the answer with feedback
    await supabase.from("answers").update({
      writing_feedback: feedback,
    }).eq("attempt_id", attempt_id).eq("question_id", question_id);

    return new Response(JSON.stringify({ success: true, feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grade-writing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
