import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkLatestTest() {
  const { data: brands, error: brandError } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (brandError || !brands.length) {
    console.error("Aucun test trouvé.");
    return;
  }

  const lastBrand = brands[0];
  console.log("--- DERNIER TEST : " + lastBrand.name + " ---");
  console.log("LOGO URL: " + lastBrand.logo_url);
  console.log("BACKGROUND URL: " + lastBrand.background_url);
  console.log("IDENTITY: ", JSON.stringify(lastBrand.identity, null, 2));

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("brand_id", lastBrand.id);

  console.log("MENU ITEMS: ", JSON.stringify(items, null, 2));
}

checkLatestTest();
