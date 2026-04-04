import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const admins = [
      { email: "2@admin.local", password: "22" },
      { email: "3@admin.local", password: "333" },
    ];

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const results: string[] = [];

    for (const admin of admins) {
      const existing = existingUsers?.users?.find(u => u.email === admin.email);

      if (existing) {
        await supabase.from("user_roles").upsert({
          user_id: existing.id,
          role: "admin",
        }, { onConflict: "user_id,role" });
        results.push(`${admin.email}: already exists`);
      } else {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
        });

        if (createError) {
          results.push(`${admin.email}: error - ${createError.message}`);
          continue;
        }

        await supabase.from("user_roles").insert({
          user_id: newUser.user.id,
          role: "admin",
        });
        results.push(`${admin.email}: created`);
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("setup-admin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
