/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if VAPID keys already exist
    const { data: existing } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "vapid_public_key")
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ publicKey: (existing.value as { value: string }).value }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate ECDSA P-256 key pair for VAPID
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    const publicKeyBase64Url = arrayBufferToBase64Url(publicKeyRaw);

    // Store keys in system_settings
    await supabase.from("system_settings").upsert([
      { key: "vapid_public_key", value: { value: publicKeyBase64Url } },
      { key: "vapid_private_key", value: privateKeyJwk },
    ], { onConflict: "key" });

    return new Response(
      JSON.stringify({ publicKey: publicKeyBase64Url, generated: true }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
