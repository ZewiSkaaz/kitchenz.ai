import { uberService } from "@/lib/uber";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SCOPES = "eats.store eats.store.orders eats.store.orders.status eats.order eats.report";

export async function POST(request: Request) {
  try {
    const { brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    // 1. Get access token from cookie or generate fresh one via client credentials
    const cookieStore = cookies();
    let accessToken = cookieStore.get("uber_access_token")?.value;

    if (!accessToken) {
      // Re-generate token via client credentials
      const tokenData = await uberService.getClientCredentialsToken(SCOPES);
      accessToken = tokenData.access_token;
    }

    // 2. Get Brand and Menu Items from Supabase
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("*, menu_items(*)")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // 3. Format menu for Uber
    const menuData = uberService.formatMenuForUber(brand, brand.menu_items);

    // 4. In sandbox, we use a test store ID
    // In production, this would come from the user's Uber store
    const storeId = "sandbox_store_" + brandId.substring(0, 8);
    
    // Log the menu data that would be sent (sandbox test)
    console.log("Menu ready for Uber:", JSON.stringify(menuData, null, 2));
    console.log("Would upload to store:", storeId);
    console.log("Access token obtained:", accessToken ? "YES" : "NO");

    // Return success with the formatted data (sandbox mode)
    return NextResponse.json({ 
      success: true, 
      message: "Menu formaté et prêt pour Uber Eats (mode Sandbox)",
      items_count: brand.menu_items?.length || 0,
      store_id: storeId,
      token_obtained: !!accessToken
    });

  } catch (error: any) {
    console.error("Uber Sync Error:", error.response?.data || error.message);
    return NextResponse.json({ 
      error: error.response?.data?.message || error.message 
    }, { status: 500 });
  }
}
