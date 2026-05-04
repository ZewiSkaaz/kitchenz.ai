import { uberService } from "@/lib/uber";
import { NextResponse } from "next/server";

const SCOPES = "eats.store eats.store.orders.read eats.store.status.write eats.order eats.report eats.store.orders.cancel eats.store.orders.restaurant.delivery.status";

export async function GET() {
  try {
    const tokens = await uberService.getClientCredentialsToken(SCOPES);
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
