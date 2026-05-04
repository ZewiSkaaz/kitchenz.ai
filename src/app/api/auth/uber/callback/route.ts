import { uberService } from "@/lib/uber";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=no_code", request.url));
  }

  try {
    const tokens = await uberService.getAccessToken(code);
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.redirect(new URL("/login?error=no_session", request.url));
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
      return NextResponse.redirect(new URL("/dashboard?error=db_error", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard?success=uber_connected", request.url));
  } catch (error: any) {
    console.error("Uber Auth Error:", error.response?.data || error.message);
    return NextResponse.redirect(new URL("/dashboard?error=auth_failed", request.url));
  }
}
