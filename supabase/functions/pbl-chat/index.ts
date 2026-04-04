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
    const systemPrompt = `You are a friendly and intelligent English learning companion in a Problem-Based Learning activity. Your name is "Alex".

ACTIVITY CONTEXT:
- Title: ${activity.title}
- CEFR Level: ${activity.mcer_level}
- Knowledge Area: ${activity.knowledge_area}
- Grammar Topics to practice: ${activity.grammar_topics}
- Skills to integrate: ${activity.skills?.join(", ")}

YOUR ROLE:
1. Present a contextual problem related to "${activity.knowledge_area}" that requires the student to use the grammar topics: ${activity.grammar_topics}
2. Guide the student through solving the problem via conversation
3. Ask progressive questions that require the student to use the target grammar
4. Integrate different skills naturally:
   - READING: Present short texts, instructions, or scenarios for the student to read and respond to
   - WRITING: Ask the student to write responses, explanations, or solutions
   - LISTENING: When you want to include a listening activity, wrap the text in [AUDIO]...[/AUDIO] tags. The system will convert this to speech for the student to listen to.
5. Detect grammar and vocabulary errors in the student's responses
6. Provide gentle, encouraging corrections WITHOUT breaking conversation flow
7. Keep the conversation natural and engaging

CORRECTION STYLE:
- When you spot an error, correct it briefly inline like: "Great idea! (Just a small note: it should be 'have gone' instead of 'have went') Now, about your solution..."
- Don't make the student feel bad about errors
- Focus on the grammar topics being evaluated

IMPORTANT RULES:
- Speak at the ${activity.mcer_level} level - adjust vocabulary and complexity accordingly
- Stay in character as a helpful companion, not a strict teacher
- Make the problem interesting and relevant to ${activity.knowledge_area}
- After 8-12 exchanges, start wrapping up the conversation naturally
- Always respond in English
- Keep responses concise (2-4 sentences usually)

${!history?.length ? "This is the START of the conversation. Introduce yourself briefly, present the problem, and ask the first question." : "Continue the conversation naturally based on the student's response."}`;

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
