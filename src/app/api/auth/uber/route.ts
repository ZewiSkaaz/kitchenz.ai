import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientID = process.env.UBER_CLIENT_ID;
  const redirectURI = process.env.UBER_REDIRECT_URI || 'https://kitchenz-ai.onrender.com/api/auth/uber/callback';
  
  // Scopes nécessaires pour gérer le restaurant et les commandes
  const scopes = encodeURIComponent("eats.store eats.store.status.write eats.order eats.report");
  
  const uberAuthUrl = `https://login.uber.com/oauth/v2/authorize?client_id=${clientID}&response_type=code&redirect_uri=${encodeURIComponent(redirectURI)}&scope=${scopes}`;

  console.log("🚀 Redirecting user to Uber OAuth...");
  return NextResponse.redirect(uberAuthUrl);
}
