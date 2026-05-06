import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { uberService } from "@/lib/uber";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  
  const baseUrl = "https://kitchenz-ai.onrender.com";

  if (errorParam) {
    return NextResponse.redirect(new URL(`/dashboard?error=${errorParam}&desc=${encodeURIComponent(errorDesc || '')}`, baseUrl));
  }

  try {
    // 1. Get code from URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    
    // 2. Initialize Server-Side Supabase Client
    const cookieStore = cookies();
    const supabaseServer = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // 3. Get User Session
    const { data: { session } } = await supabaseServer.auth.getSession();
    if (!session) {
      console.error("❌ No session found in Uber callback");
      return NextResponse.redirect(new URL("/login?error=no_session", request.url));
    }

    // 4. Exchange code for tokens
    const params = new URLSearchParams({
      client_id: process.env.UBER_CLIENT_ID!,
      client_secret: process.env.UBER_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.UBER_REDIRECT_URI || 'https://kitchenz-ai.onrender.com/api/auth/uber/callback',
      code: code!,
    });

    const tokenRes = await fetch('https://login.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    
    const tokens = await tokenRes.json();
    if (tokens.error) {
      console.error("❌ Uber Token Error:", tokens.error);
      return NextResponse.redirect(new URL("/dashboard?error=auth_failed", request.url));
    }

    // 5. Store in DB
    const { error } = await supabaseServer
      .from("user_integrations")
      .upsert({
        user_id: session.user.id,
        provider: "uber_eats",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
      }, { onConflict: "user_id,provider" });

    if (error) {
      console.error("❌ DB Storage Error:", error.message);
      return NextResponse.redirect(new URL("/dashboard?error=db_error", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard?success=uber_connected", request.url));
  } catch (error: any) {
    console.error("Uber Auth Error:", error.response?.data || error.message);
    return NextResponse.redirect(new URL("/dashboard?error=auth_failed", baseUrl));
  }
}

