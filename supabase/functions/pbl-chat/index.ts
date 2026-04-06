import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id, message, activity, history, action } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If action is "evaluate", generate final evaluation
    if (action === "evaluate") {
      const { data: messages } = await supabase
        .from("pbl_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at");

      const conversation = (messages || []).map((m: any) => `${m.role}: ${m.content}`).join("\n");

      const evalPrompt = `You are an expert English teacher evaluating a student's performance in a Problem-Based Learning activity.

Activity details:
- Title: ${activity.title}
- CEFR Level: ${activity.mcer_level}
- Knowledge Area: ${activity.knowledge_area}
- Grammar Topics: ${activity.grammar_topics}
- Skills evaluated: ${activity.skills?.join(", ")}

Here is the complete conversation:
${conversation}

Evaluate the student and return ONLY valid JSON (no markdown) with this structure:
{
  "score": 0-100,
  "grammar": { "score": 0-100, "errors": ["list of specific errors"], "feedback": "detailed feedback" },
  "vocabulary": { "score": 0-100, "strengths": ["words used well"], "weaknesses": ["areas to improve"], "feedback": "detailed feedback" },
  "comprehension": { "score": 0-100, "feedback": "how well they understood reading and listening tasks" },
  "communication": { "score": 0-100, "feedback": "how effectively they communicated to solve the problem" },
  "overall_feedback": "A comprehensive paragraph as a teacher would write, with encouragement and specific advice",
  "recommendations": ["specific study recommendations"]
}

Score based on CORRECT usage (positive scoring), not penalties. Be encouraging but honest.`;

      const evalResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert English teacher. Return only valid JSON." },
            { role: "user", content: evalPrompt },
          ],
        }),
      });

      if (!evalResponse.ok) {
        const errText = await evalResponse.text();
        console.error("AI eval error:", evalResponse.status, errText);
        if (evalResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (evalResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${evalResponse.status}`);
      }

      const evalData = await evalResponse.json();
      const evalContent = evalData.choices?.[0]?.message?.content || "";
      const jsonStr = evalContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const feedback = JSON.parse(jsonStr);

      await supabase.from("pbl_sessions").update({
        score: feedback.score,
        detailed_feedback: feedback,
        is_completed: true,
        finished_at: new Date().toISOString(),
      }).eq("id", session_id);

      return new Response(JSON.stringify({ success: true, feedback }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normal chat - save user message
    if (message) {
      await supabase.from("pbl_messages").insert({
        session_id,
        content: message,
        role: "user",
      });
    }

    // Build system prompt
    const studentName = history?.length === 0 ? "" : "";
    const messageCount = history?.length || 0;
    
    const systemPrompt = `You are a friendly and intelligent English learning companion in a Problem-Based Learning activity. Your name is "Alex".

ACTIVITY CONTEXT (internal - DO NOT reveal all at once):
- Title: ${activity.title}
- CEFR Level: ${activity.mcer_level}
- Knowledge Area: ${activity.knowledge_area}
- Grammar Topics to practice: ${activity.grammar_topics}
- Skills to integrate: ${activity.skills?.join(", ")}
${activity.student_name ? `- Student's name (from registration): ${activity.student_name}` : ""}

YOUR CONVERSATION STRATEGY:
You MUST follow a natural, gradual progression. NEVER dump all information at once.

PHASE 1 - WARM-UP (messages 1-2):
- Introduce yourself casually as Alex
- Ask the student their name (even though you may know it, this makes it personal)
- Make small talk: "How are you today?" or "Have you worked with [knowledge area] before?"

PHASE 2 - CONTEXT SETTING (messages 3-4):
- Address the student BY THEIR NAME from now on
- Gradually introduce the topic area: "${activity.knowledge_area}"
- Build curiosity: "So, I have an interesting situation I'd love your help with..."

PHASE 3 - PROBLEM INTRODUCTION (messages 5-6):
- Present the problem naturally, as if telling a story or sharing a situation
- Don't present it as a "test" or "exercise" — make it feel like a real scenario
- Ask the student's initial thoughts

PHASE 4 - GUIDED EXPLORATION (messages 7+):
- Ask progressive questions that require the target grammar: ${activity.grammar_topics}
- Integrate skills naturally:
   - READING: Present short texts, emails, articles, or instructions for the student to read and respond to
   - WRITING: Ask the student to write responses, explanations, or solutions
   - LISTENING: Wrap text in [AUDIO]...[/AUDIO] tags for the system to convert to speech
- Guide toward solving the problem step by step

PHASE 5 - WRAP UP (after 10-14 exchanges):
- Start wrapping up naturally
- Summarize what was accomplished together

CORRECTION STYLE:
- When you spot an error, correct it briefly inline like: "Great idea! (Just a small note: it should be 'have gone' instead of 'have went') Now, about your solution..."
- Don't make the student feel bad about errors
- Focus on the grammar topics being evaluated
- Be encouraging and supportive

IMPORTANT RULES:
- Speak at the ${activity.mcer_level} level - adjust vocabulary and complexity accordingly
- Stay in character as a friendly companion, NOT a teacher or examiner
- ALWAYS use the student's name once you know it
- Make the problem interesting and relevant to ${activity.knowledge_area}
- Always respond in English
- Keep responses concise (2-4 sentences usually)
- NEVER say things like "this is an exercise" or "I'm going to test you" — keep it conversational

${!history?.length ? "This is the VERY START. Say hi, introduce yourself as Alex, and ask for the student's name in a warm, friendly way. Do NOT mention the activity topic yet." : "Continue the conversation naturally based on the student's response and the current phase."}`;

    const aiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    if (history?.length) {
      for (const msg of history) {
        aiMessages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.content });
      }
    }

    if (message) {
      aiMessages.push({ role: "user", content: message });
    }

    // Stream response
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
      const errText = await response.text();
      console.error("AI chat error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    // Collect full response for saving, but stream to client
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));

            // Extract content from SSE for saving
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line.slice(6).trim() !== "[DONE]") {
                try {
                  const parsed = JSON.parse(line.slice(6));
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) fullContent += content;
                } catch { /* ignore partial */ }
              }
            }
          }

          // Save assistant message after streaming completes
          if (fullContent) {
            await supabase.from("pbl_messages").insert({
              session_id,
              content: fullContent,
              role: "assistant",
            });
          }

          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("pbl-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
