import { uberService } from "@/lib/uber";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const SCOPES = "eats.store eats.store.status.write eats.order eats.report";

export async function GET() {
  try {
    const tokens = await uberService.getClientCredentialsToken(SCOPES);
    
    // Attempt to save in Supabase if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Use service role if available or anon if permitted by RLS
      await supabase.from("user_integrations").upsert({
        user_id: session.user.id,
        provider: "uber",
        access_token: tokens.access_token,
        expires_at: new Date(Date.now() + (tokens.expires_in || 2592000) * 1000).toISOString()
      });
    }

    // Store in a cookie or return token info for the dashboard
    const response = NextResponse.redirect("https://kitchenz-ai.onrender.com/dashboard?success=uber_connected");
    response.cookies.set("uber_access_token", tokens.access_token, {
      httpOnly: true,
      secure: true,
      maxAge: tokens.expires_in || 2592000,
      path: "/"
    });
    return response;
  } catch (error: any) {
    console.error("Uber Client Credentials Error:", error.response?.data || error.message);
    const desc = encodeURIComponent(JSON.stringify(error.response?.data || error.message));
    return NextResponse.redirect(`https://kitchenz-ai.onrender.com/dashboard?error=auth_failed&desc=${desc}`);
  }
}
