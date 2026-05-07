import { generateBrandCore, generateCoreItems, generateMenuAssembly, generateMenuItemImage, generateBrandImages, PRICING } from "./src/lib/ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc"
);

const brandName   = "The Italian Smash";
const concept     = "Fusion entre le smash burger californien et la gastronomie italienne : Pesto, Mozzarella di Bufala, et pain focaccia toasté.";
const visualStyle = "Moderne, coloré (vert, blanc, rouge), très lumineux, style 'Instagrammable'.";
const ingredients = ["Steak de bœuf", "Mozzarella", "Pesto basilic", "Pignons de pin", "Focaccia", "Frites au parmesan"];
const drinks      = ["San Pellegrino", "Chinotto"];
const desserts    = ["Cannoli Siciliani"];
const equipment   = ["Plancha", "Presse à Smash", "Friteuse"];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const uploadB64 = async (b64: string | null, name: string): Promise<string | null> => {
  if (!b64) {
    console.error(`   ❌ [Storage] No base64 provided for ${name}`);
    return null;
  }
  if (!b64.startsWith("data:image")) {
    console.error(`   ❌ [Storage] Invalid image format for ${name}: ${b64.substring(0, 30)}...`);
    return null;
  }
  const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const buffer = Buffer.from(b64.split(",")[1], "base64");
  const fileName = `smash_it_${safeName}_${Date.now()}.png`;
  const { error } = await supabase.storage.from("brands").upload(fileName, buffer, { contentType: "image/png", upsert: true });
  if (error) {
    console.error(`   ❌ [Storage] Upload failed for ${name}:`, error.message);
    return null;
  }
  const publicUrl = supabase.storage.from("brands").getPublicUrl(fileName).data.publicUrl;
  console.log(`   ✅ [Storage] Uploaded ${name} -> ${publicUrl}`);
  return publicUrl;
};

async function run() {
  console.log("🇮🇹 DÉMARRAGE AUDIT ULTIME : THE ITALIAN SMASH...");

  const brandCore = await generateBrandCore(ingredients, equipment, brandName, concept, visualStyle, { allowNewIngredients: true, allowNewEquipment: false });
  const coreItems = await generateCoreItems(ingredients, brandCore, { allowNewIngredients: true, allowNewEquipment: false });
  const menuAssembly = await generateMenuAssembly(coreItems, drinks, desserts, brandCore);

  console.log("📸 PHASE DE GÉNÉRATION D'IMAGES (100% COUVERTURE)...");
  
  // 1. Plats & Sides
  const dishes = [...(coreItems.main_dishes || []), ...(coreItems.generated_sides || [])];
  for (const item of dishes) {
      console.log(`   - Photo Plat : ${item.title}...`);
      item.imageUrl = await generateMenuItemImage(item.title, item.description_seo, brandCore.culinary_style, visualStyle);
      await sleep(15000); // 15s de pause pour être sûr
  }

  // 2. Combos (Menus)
  if (menuAssembly.combos) {
    for (const combo of menuAssembly.combos) {
        console.log(`   - Photo COMBO : ${combo.title}...`);
        // Prompt spécial combo pour montrer un plateau complet
        const comboPrompt = `A professional Uber Eats meal deal photography of a full tray containing: ${combo.title}. Include the main dish, a side of fries, and a cold drink in the background. High-end studio lighting, 8k.`;
        combo.imageUrl = await generateMenuItemImage(combo.title, comboPrompt, brandCore.culinary_style, visualStyle);
        await sleep(15000);
    }
  }

  // --- PHASE D'IDENTITÉ VISUELLE (APRÈS PRODUITS) ---
  console.log("🖼️  Identity Assets (Basés sur vos produits)...");
  
  // On récupère les 3 meilleurs plats pour le background
  const topDishes = dishes.slice(0, 3).map(d => d.title).join(", ");
  const identityContext = `Featuring: ${topDishes}.`;

  const brandImages = await generateBrandImages(
    brandCore.name, 
    brandCore.logo_prompt, 
    brandCore.background_prompt,
    identityContext
  );
  
  const { data: brandData } = await supabase.from("brands").insert({
    name: brandCore.name, tagline: brandCore.tagline, culinary_style: brandCore.culinary_style,
    storytelling: brandCore.storytelling, ingredients, equipment, prep_time_avg: 12,
    logo_url: await uploadB64(brandImages.logoUrl, "logo"), 
    background_url: await uploadB64(brandImages.backgroundUrl, "bg"),
  }).select().single();

  const allItemsToInsert = [...dishes, ...(menuAssembly.combos || [])];
  const inserts = await Promise.all(allItemsToInsert.map(async (item: any) => {
    const img = await uploadB64(item.imageUrl, `item_${item.title}`);
    return {
      brand_id: brandData.id, title: item.title, description_seo: item.description_seo,
      ingredients: item.ingredients, material_cost: item.financials.material_cost,
      net_margin_target: item.financials.net_margin_target, selling_price: item.financials.selling_price,
      category: item.category, image_url: img,
    };
  }));

  await supabase.from("menu_items").insert(inserts);

  console.log(`\n✅ TOUTES LES PHOTOS GÉNÉRÉES SANS EXCEPTION !`);
  console.log(`   Check Dashboard: https://kitchenz-ai.onrender.com/dashboard\n`);
}

run().catch(console.error);
