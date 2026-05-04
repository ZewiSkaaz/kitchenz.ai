import { uberService } from "@/lib/uber";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    // 1. Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Get Uber Integration tokens
    const { data: integration, error: intError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("provider", "uber_eats")
      .single();

    if (intError || !integration) {
      return NextResponse.json({ error: "Uber Eats not connected" }, { status: 400 });
    }

    // TODO: Handle token refresh if expired

    // 3. Get Brand and Menu Items
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("*, menu_items(*)")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // 4. Format and Upload Menu
    const menuData = uberService.formatMenuForUber(brand, brand.menu_items);
    
    // For demo/testing, we might need a fixed storeId if not yet fetched
    const storeId = integration.store_id || "demo_store_id"; 

    const result = await uberService.uploadMenu(storeId, integration.access_token, menuData);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Uber Sync Error:", error.response?.data || error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
