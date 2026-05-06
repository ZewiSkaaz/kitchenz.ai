import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
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
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("❌ No session found in Uber callback");
      return NextResponse.redirect(new URL("/login?error=no_session", baseUrl));
    }

    // Exchange code for tokens
    const params = new URLSearchParams({
      client_id: process.env.UBER_CLIENT_ID!,
      client_secret: process.env.UBER_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.UBER_REDIRECT_URI || 'https://kitchenz-ai.onrender.com/api/auth/uber/callback',
      code,
    });

    const tokenRes = await fetch('https://login.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    
    const tokens = await tokenRes.json();
    if (tokens.error) {
      console.error("❌ Uber Token Error:", tokens.error);
      return NextResponse.redirect(new URL("/dashboard?error=auth_failed", baseUrl));
    }

    // Store in DB
    const { error: dbError } = await supabase
      .from("user_integrations")
      .upsert({
        user_id: session.user.id,
        provider: "uber_eats",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
      }, { onConflict: "user_id,provider" });

    if (dbError) {
      console.error("❌ DB Storage Error:", dbError.message);
      return NextResponse.redirect(new URL(`/dashboard?error=db_error&msg=${encodeURIComponent(dbError.message)}`, baseUrl));
    }

    return NextResponse.redirect(new URL("/dashboard?success=uber_connected", baseUrl));
  } catch (error: any) {
    console.error("Uber Auth Error:", error.message);
    return NextResponse.redirect(new URL(`/dashboard?error=auth_failed&msg=${encodeURIComponent(error.message)}`, baseUrl));
  }
}
