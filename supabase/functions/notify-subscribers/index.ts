import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NoticePayload {
  record: {
    id: string;
    title: string;
    content: string;
    department_id: string;
    status: string;
  };
  old_record: {
    status: string;
  } | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: NoticePayload = await req.json();

    const { record, old_record } = payload;

    // Only notify when status changes to 'approved'
    if (record.status !== 'approved' || (old_record && old_record.status === 'approved')) {
      return new Response(JSON.stringify({ message: "No action needed" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 1. Get the department name
    const { data: department } = await supabase
      .from('departments')
      .select('name')
      .eq('id', record.department_id)
      .single();

    // 2. Get ALL registered users (not just subscribers)
    // Fetch all user emails via admin API by listing all users
    const allEmails: string[] = [];
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });
      
      if (error) throw error;
      
      for (const user of users) {
        if (user.email) {
          allEmails.push(user.email);
        }
      }
      
      if (users.length < perPage) break;
      page++;
    }

    if (allEmails.length === 0) {
      return new Response(JSON.stringify({ message: "No registered users found" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Sending notifications to ${allEmails.length} registered users for notice: ${record.title}`);

    // 3. Also create in-app notifications for all users
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id');

    if (allProfiles && allProfiles.length > 0) {
      const notifications = allProfiles.map((profile) => ({
        user_id: profile.id,
        type: 'new_notice',
        title: `New Notice: ${record.title}`,
        message: `A new notice "${record.title}" has been published${department?.name ? ` by ${department.name}` : ''}.`,
        notice_id: record.id,
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // 4. Send emails using Resend (if API key is available)
    if (resendApiKey) {
      // Send in batches of 50 to avoid rate limits
      const batchSize = 50;
      for (let i = 0; i < allEmails.length; i += batchSize) {
        const batch = allEmails.slice(i, i + batchSize);
        
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "BBUC Notice Board <notices@bbuc.ac.ug>",
            bcc: batch, // Use BCC for privacy
            subject: `📢 New Notice: ${record.title}`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background-color: #1a365d; padding: 24px; text-align: center;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Bishop Barham University College</h2>
                  <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Online Notice Board</p>
                </div>
                <div style="padding: 32px 24px;">
                  <h1 style="color: #1a365d; font-size: 22px; margin: 0 0 8px;">${record.title}</h1>
                  <p style="color: #64748b; font-size: 13px; margin: 0 0 20px;">
                    Department: ${department?.name || 'General'} · Published just now
                  </p>
                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
                    <p style="margin: 0; color: #334155; line-height: 1.6;">
                      ${record.content.substring(0, 400)}${record.content.length > 400 ? '...' : ''}
                    </p>
                  </div>
                  <div style="text-align: center; margin-top: 28px;">
                    <a href="${Deno.env.get("PUBLIC_URL") || 'https://id-preview--f9c90327-40b3-40e6-acae-063fadc87c55.lovable.app'}/notices/${record.id}" 
                       style="background-color: #3182ce; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
                       Read Full Notice →
                    </a>
                  </div>
                </div>
                <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                    © ${new Date().getFullYear()} BBUC — Bishop Barham University College · Kabale, Uganda
                  </p>
                  <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0;">
                    You received this because you are a registered user of the BBUC Notice Board.
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          console.error(`Resend batch error: ${error}`);
        }
      }
    } else {
      console.log("RESEND_API_KEY not found. Skipping email sending. Would send to:", allEmails.length, "users");
    }

    // 5. Send push notifications via edge function
    try {
      const pushRes = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          title: `📢 ${record.title}`,
          message: `New notice published${department?.name ? ` by ${department.name}` : ''}`,
          notice_id: record.id,
        }),
      });
      const pushResult = await pushRes.json();
      console.log("Push notifications sent:", pushResult);
    } catch (pushError) {
      console.error("Push notification error:", pushError);
    }

    return new Response(JSON.stringify({ success: true, count: allEmails.length }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: unknown) {
    console.error("Error in notify-subscribers:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
