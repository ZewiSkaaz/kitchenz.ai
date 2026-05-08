import { NextResponse, NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Récupération et nettoyage des credentials
  const clientID = process.env.UBER_CLIENT_ID?.trim();
  
  // 2. Construction dynamique du Redirect URI (évite les mismatches entre dev et prod)
  const host = req.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectURI = `${protocol}://${host}/api/auth/uber/callback`;

  console.log("🛠️ Uber Auth Config Check:", {
    hasID: !!clientID,
    redirectURI,
    env: process.env.NODE_ENV
  });

  if (!clientID) {
    console.error("❌ ERREUR : UBER_CLIENT_ID est manquant ou vide.");
    return NextResponse.redirect(new URL('/dashboard?error=missing_uber_config', req.url));
  }

  // 3. Scopes - Assurez-vous qu'ils sont activés dans votre Dashboard Uber > Settings
  const scopes = [
    "eats.store",
    "eats.store.status.write",
    "eats.order",
    "eats.report"
  ].join(" ");

  // 4. Construction de l'URL finale
  const uberAuthUrl = new URL("https://login.uber.com/oauth/v2/authorize");
  uberAuthUrl.searchParams.append("client_id", clientID);
  uberAuthUrl.searchParams.append("response_type", "code");
  uberAuthUrl.searchParams.append("redirect_uri", redirectURI);
  uberAuthUrl.searchParams.append("scope", scopes);

  console.log("🚀 Redirection vers Uber...");
  return NextResponse.redirect(uberAuthUrl.toString());
}
