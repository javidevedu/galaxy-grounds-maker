import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate JWT manually since verify_jwt is disabled for signing-keys compatibility
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { quiz_id, target_audience, mcer_level, topics, skills, num_questions, writing_word_limit } = await req.json();
    const totalQuestions = Math.min(20, Math.max(10, num_questions || 14));
    const wordLimit = writing_word_limit || 100;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const selectedSkills: string[] = skills || ['reading', 'writing', 'listening', 'speaking'];

    const audienceMap: Record<string, string> = {
      high_school: "High school students",
      university: "University students",
      independent: "Independent learners",
    };
    const audienceLabel = audienceMap[target_audience] || target_audience;

    // MCER level descriptors for accurate question calibration
    const mcerDescriptors: Record<string, string> = {
      A1: `BEGINNER (A1): Use only the most basic vocabulary (common everyday words: family, colors, numbers, greetings, simple objects). Grammar: present simple (I am, I have, I like), basic articles (a/an/the), simple plurals, basic prepositions (in, on, at). Sentences must be very short (5-8 words). Avoid any idioms, phrasal verbs, or complex structures. Reading passages: 2-3 very simple sentences. Listening scripts: 2-3 slow, clear sentences.`,
      A2: `ELEMENTARY (A2): Use basic everyday vocabulary (shopping, daily routines, weather, food, hobbies). Grammar: present simple & continuous, past simple (regular/irregular), basic modals (can, must), comparatives/superlatives, there is/are, countable/uncountable. Sentences should be short and straightforward (8-12 words). Minimal use of connectors (and, but, because). Reading passages: 3-4 simple sentences. Listening scripts: 3-4 clear sentences at normal-slow pace.`,
      B1: `INTERMEDIATE (B1): Use varied everyday and some abstract vocabulary. Grammar: all simple tenses + present perfect, future (will/going to), first & second conditionals, passive voice (simple), relative clauses (who, which, that), reported speech basics. Sentences can be compound (12-18 words). Use connectors (however, although, therefore). Reading passages: short paragraphs with some complexity. Listening scripts: 4-5 sentences at normal pace with some natural speech patterns.`,
      B2: `UPPER-INTERMEDIATE (B2): Use a wide range of vocabulary including some idiomatic expressions and topic-specific terms. Grammar: all tenses including past perfect, third conditional, advanced passive, causatives, wish/if only, modal perfects (should have, could have), complex relative clauses, gerunds vs infinitives. Sentences should be complex (15-25 words) with subordination. Reading passages: full paragraphs with nuanced meaning. Listening scripts: 5-6 sentences at natural pace with connected speech.`,
      C1: `ADVANCED (C1): Use sophisticated vocabulary, collocations, idiomatic expressions, and academic/professional language. Grammar: mixed conditionals, inversion, cleft sentences, advanced subjunctive, nuanced modal usage, complex noun phrases. Expect subtle meaning, inference, and critical analysis. Reading passages: complex texts with implicit meaning. Listening scripts: natural speech with reductions and connected speech.`,
      C2: `MASTERY (C2): Use near-native vocabulary including rare words, nuanced idioms, and specialized terminology. Grammar: all structures used naturally with stylistic variation. Questions should test inference, tone, register, and subtle meaning differences. Reading and listening: authentic, complex material.`,
    };

    const levelDescription = mcerDescriptors[mcer_level] || mcerDescriptors['A2'];

    // Distribute questions evenly across selected skills
    const skillCount = selectedSkills.length;
    const basePerSkill = Math.floor(totalQuestions / skillCount);
    let remainder = totalQuestions % skillCount;
    const distribution: Record<string, number> = {};
    for (const skill of selectedSkills) {
      distribution[skill] = basePerSkill + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }

    // Build question generation instructions per skill
    const skillInstructions: string[] = [];

    if (selectedSkills.includes('reading') && distribution['reading'] > 0) {
      skillInstructions.push(`READING SECTION (type: "multiple_choice"):
Generate ${distribution['reading']} reading comprehension questions. Each should have a short reading passage in the question_text, followed by a question about it. Include option_a, option_b, option_c, option_d. correct_answer must be A, B, C, or D.
CRITICAL: The reading passages and questions MUST match the MCER level. Use ONLY vocabulary and grammar structures appropriate for ${mcer_level}. The distractors (wrong answers) should also use level-appropriate language. Mix the evaluated topics across the questions.`);
    }

    if (selectedSkills.includes('writing') && distribution['writing'] > 0) {
      skillInstructions.push(`WRITING SECTION (type: "writing"):
Generate ${distribution['writing']} writing prompts. Each should have:
- question_text: A context/prompt that instructs the student to write a text of approximately ${wordLimit} words, using specific vocabulary and grammar from the evaluated topics. The prompt complexity must match ${mcer_level} level. Be specific about which grammar structures or vocabulary they must incorporate.
- correct_answer: A model answer of approximately ${wordLimit} words that demonstrates proper use of the required topics at ${mcer_level} level.
Do NOT include options (option_a, option_b, etc.) for writing questions.`);
    }

    if (selectedSkills.includes('listening') && distribution['listening'] > 0) {
      skillInstructions.push(`LISTENING SECTION (type: "listening"):
Generate ${distribution['listening']} listening questions. Each should have:
- audio_script: A passage to be read aloud. The vocabulary, grammar, and sentence complexity MUST match ${mcer_level} level exactly.
- question_text: A question about the audio script using level-appropriate language.
- option_a, option_b, option_c, option_d: Four answer choices in level-appropriate language.
- correct_answer: A, B, C, or D
Mix the evaluated topics across the questions.`);
    }

    if (selectedSkills.includes('speaking') && distribution['speaking'] > 0) {
      skillInstructions.push(`SPEAKING SECTION (type: "speaking"):
Generate ${distribution['speaking']} speaking prompts. Each should have:
- question_text: A paragraph (3-5 sentences) that the student must read aloud. The vocabulary and grammar MUST match ${mcer_level} level. Use words and structures from the evaluated topics.
- correct_answer: The exact text they should read (same as question_text).
Do NOT include options for speaking questions.`);
    }

    const prompt = `You are creating an English proficiency test calibrated PRECISELY to MCER (CEFR) level ${mcer_level}.

=== LEVEL REQUIREMENTS (FOLLOW STRICTLY) ===
${levelDescription}

=== TEST PARAMETERS ===
Target audience: ${audienceLabel}
MCER Level: ${mcer_level}
Topics to evaluate (mix these across all questions): ${topics}
Total questions: exactly ${totalQuestions}

=== CRITICAL INSTRUCTIONS ===
1. Every single question, passage, option, and audio script MUST use ONLY vocabulary and grammar appropriate for ${mcer_level}. Do NOT use structures or words above this level.
2. The topics listed are the CONTENT themes to be tested, but the LANGUAGE COMPLEXITY must match ${mcer_level}.
3. For example, if the topic is "technology" at A1 level, use only basic words like "phone", "computer", "use" — NOT "artificial intelligence" or "implementation".
4. Distractors (wrong answers) must also be at the appropriate level — don't make wrong answers obviously wrong by using overly complex language.

=== SECTIONS ===

${skillInstructions.join('\n\n')}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "A"
    },
    {
      "type": "writing",
      "question_text": "Write a paragraph about...",
      "correct_answer": "Model answer..."
    },
    {
      "type": "listening",
      "audio_script": "...",
      "question_text": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_answer": "B"
    },
    {
      "type": "speaking",
      "question_text": "Read this paragraph aloud: ...",
      "correct_answer": "..."
    }
  ]
}

IMPORTANT: Only include question types for the sections listed above. Mix the evaluated topics across all questions so students are tested on multiple topics throughout.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert English language test creator. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from AI");

    // Parse JSON, removing any markdown wrapping
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Delete existing questions for this quiz
    await supabase.from("questions").delete().eq("quiz_id", quiz_id);

    // Insert new questions
    const questionsToInsert = parsed.questions.map((q: any, i: number) => ({
      quiz_id,
      type: q.type,
      question_text: q.question_text,
      option_a: q.option_a || null,
      option_b: q.option_b || null,
      option_c: q.option_c || null,
      option_d: q.option_d || null,
      correct_answer: q.correct_answer,
      audio_script: q.audio_script || null,
      sort_order: i,
    }));

    const { error: insertError } = await supabase.from("questions").insert(questionsToInsert);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, count: questionsToInsert.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-questions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
