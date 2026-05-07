
export const dynamic = 'force-dynamic';
import { uberService } from "@/lib/uber";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { Brand } from "@/types";

const SCOPES = "eats.store eats.store.status.write eats.order eats.report";

export async function POST(request: Request) {
  try {
    const { brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    // 1. Get Brand (avec Store ID) et Menu Items
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("*, menu_items(*)")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const typedBrand = brand as Brand;

    // 2. Récupérer l'intégration Uber de l'utilisateur
    const { data: integration, error: intError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", brand.user_id)
      .eq("provider", "uber_eats")
      .single();

    if (intError || !integration) {
      return NextResponse.json({ error: "Votre compte Uber Eats n'est pas lié. Cliquez sur 'Lier mon restaurant' dans le Dashboard." }, { status: 401 });
    }

    let accessToken = integration.access_token;

    // 3. Vérifier si le token est expiré et le rafraîchir si besoin
    const expiresAt = new Date(integration.expires_at).getTime();
    if (expiresAt < Date.now() + 60000) { // On rafraîchit s'il reste moins d'une minute
      console.log("🔄 Uber token expired, refreshing...");
      try {
        const refreshData = await uberService.refreshToken(integration.refresh_token);
        accessToken = refreshData.access_token;
        
        // Update DB
        await supabase
          .from("user_integrations")
          .update({
            access_token: refreshData.access_token,
            refresh_token: refreshData.refresh_token,
            expires_at: new Date(Date.now() + (refreshData.expires_in || 3600) * 1000).toISOString(),
          })
          .eq("id", integration.id);
          
        console.log("✅ Token refreshed successfully.");
      } catch (e: any) {
        return NextResponse.json({ error: "Échec du rafraîchissement du token Uber. Veuillez reconnecter votre compte." }, { status: 401 });
      }
    }

    // 4. Format menu expert (Modificateurs, Horaires, TVA)
    const menuData = uberService.formatMenuForUber(typedBrand, typedBrand.menu_items || []);

    // 5. Ciblage du Store
    const storeId = brand.uber_store_id;
    if (!storeId) {
      return NextResponse.json({ error: "Aucun ID de restaurant Uber (Store ID) n'est configuré pour cette marque." }, { status: 400 });
    }
    
    console.log(`🚀 Synchronisation vers Uber Store: ${storeId}...`);

    // 6. Appel API réel (PUT /menus)
    try {
      const uberResponse = await uberService.uploadMenu(storeId, accessToken, menuData);
      
      return NextResponse.json({ 
        success: true, 
        message: "Menu synchronisé avec succès sur Uber Eats !",
        details: uberResponse
      });
    } catch (uberError: any) {
      console.error("🔥 Uber API Error:", uberError.message);
      return NextResponse.json({ 
        success: false,
        error: "Erreur Uber API : " + uberError.message
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Critical Sync Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

