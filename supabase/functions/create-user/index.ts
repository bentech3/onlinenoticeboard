import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: "viewer" | "creator" | "approver" | "super_admin";
  departmentId?: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the requesting user is a super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: requestingUser },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !requestingUser) {
      throw new Error("Unauthorized");
    }

    // Check if requesting user is super_admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .single();

    if (!roleData || roleData.role !== "super_admin") {
      throw new Error("Only super admins can create users");
    }

    const requestData: CreateUserRequest = await req.json();
    const { email, password, fullName, role, departmentId } = requestData;

    // Validate input
    if (!email || !password || !fullName || !role) {
      throw new Error("Missing required fields");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Create user with admin API (auto-confirms email)
    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createError || !newUser?.user) {
      throw createError || new Error("User creation failed");
    }

    // Update profile with department if provided
    if (departmentId || fullName) {
      await adminClient
        .from("profiles")
        .update({ 
          department_id: departmentId || null,
          full_name: fullName 
        })
        .eq("id", newUser.user.id);
    }

    // Role management: Ensure only one role exists
    // Small delay to let any automation triggers finish
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Delete any existing roles to avoid duplicates
    await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", newUser.user.id);

    // Assign requested role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role });

    if (roleError) {
      console.error("Role assignment error, trying upsert:", roleError);
      await adminClient
        .from("user_roles")
        .upsert({ user_id: newUser.user.id, role });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: newUser.user.id, email: newUser.user.email },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    // Attempt to extract a clear error message
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as any).message;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error
    }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
