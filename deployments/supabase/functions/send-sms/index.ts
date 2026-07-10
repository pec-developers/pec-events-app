import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY") || "";
const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID") || "";

serve(async (req) => {
  try {
    // 1. Validate request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Parse the payload sent by Supabase GoTrue
    const payload = await req.json();
    const phone = payload.user?.phone;
    const otp = payload.sms?.otp;

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: "Missing phone or OTP code in payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Format phone number (MSG91 expects number format without leading '+')
    const formattedPhone = phone.replace(/^\+/, "");

    // 4. Construct MSG91 OTP API URL and request body
    // MSG91 sends custom variables as JSON keys inside the body corresponding to template placeholders.
    // e.g., if your template in MSG91 has the placeholder {{otp}}, we send { "otp": otp }.
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", MSG91_TEMPLATE_ID);
    url.searchParams.set("mobile", formattedPhone);
    url.searchParams.set("authkey", MSG91_AUTH_KEY);

    const msg91Response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otp: otp
      })
    });

    const responseText = await msg91Response.text();

    if (!msg91Response.ok) {
      console.error("MSG91 API error response:", responseText);
      return new Response(
        JSON.stringify({ error: `MSG91 failed with status ${msg91Response.status}: ${responseText}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully sent OTP to ${phone}`);
    
    // Return empty 200 OK to notify Supabase GoTrue that delivery succeeded
    return new Response(null, { status: 200 });

  } catch (err) {
    console.error("Internal error in Send SMS Hook:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
