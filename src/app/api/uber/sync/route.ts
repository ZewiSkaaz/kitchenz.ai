
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

    // 1. Auth via Client Credentials (Standard pour Server-to-Server)
    const tokenData = await uberService.getClientCredentialsToken(SCOPES);
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "Could not obtain Uber access token" }, { status: 401 });
    }

    // 2. Get Brand (avec Store ID) et Menu Items
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("*, menu_items(*)")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const typedBrand = brand as Brand;

    // 3. Format menu expert (Modificateurs, Horaires, TVA)
    const menuData = uberService.formatMenuForUber(typedBrand, typedBrand.menu_items || []);

    // 4. Ciblage du Store
    // On utilise l'ID réel s'il existe, sinon on reste en sandbox démo
    const storeId = brand.uber_store_id || "sandbox_store_" + brandId.substring(0, 8);
    
    console.log(`🚀 Synchronisation réelle vers Uber (${storeId})...`);

    // 5. Appel API réel (PUT /menus)
    try {
      const uberResponse = await uberService.uploadMenu(storeId, accessToken, menuData);
      
      return NextResponse.json({ 
        success: true, 
        message: "Menu synchronisé avec succès sur Uber Eats !",
        uber_status: "PUBLISHED",
        details: uberResponse
      });
    } catch (uberError: any) {
      const errorDetail = uberError.response?.data || uberError.message;
      console.error("🔥 Uber API Error:", JSON.stringify(errorDetail, null, 2));
      
      return NextResponse.json({ 
        success: false,
        error: "Erreur Uber API : " + (errorDetail.message || "Erreur inconnue"),
        debug: errorDetail
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Critical Sync Error:", error.message);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

