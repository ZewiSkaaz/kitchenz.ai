
export const dynamic = 'force-dynamic';
import { uberService } from "@/lib/uber";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  
  const baseUrl = "https://kitchenz-ai.onrender.com";

  if (errorParam) {
    return NextResponse.redirect(new URL(`/dashboard?error=${errorParam}&desc=${encodeURIComponent(errorDesc || '')}`, baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=no_code", baseUrl));
  }

  try {
    // Exchange code for tokens manually
    const params = new URLSearchParams({
      client_id: process.env.UBER_CLIENT_ID!,
      client_secret: process.env.UBER_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.UBER_REDIRECT_URI || 'https://kitchenz-ai.onrender.com/api/auth/uber/callback',
      code,
    });
    const tokenRes = await fetch('https://sandbox-login.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const tokens = await tokenRes.json();
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL("/login?error=no_session", baseUrl));
    }

    // Store tokens in user_integrations
    const { error } = await supabase
      .from("user_integrations")
      .upsert({
        user_id: session.user.id,
        provider: "uber_eats",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      }, { onConflict: "user_id,provider" });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=db_error", baseUrl));
    }

    return NextResponse.redirect(new URL("/dashboard?success=uber_connected", baseUrl));
  } catch (error: any) {
    console.error("Uber Auth Error:", error.response?.data || error.message);
    return NextResponse.redirect(new URL("/dashboard?error=auth_failed", baseUrl));
  }
}

