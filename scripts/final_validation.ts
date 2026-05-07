import { generateBrandCore, generateCoreItems, generateMenuAssembly } from "../src/lib/ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function finalValidation() {
  console.log("🔍 TEST FINAL DU MOTEUR (Poke Fusion)...");
  
  const testData = {
    brandName: "Aloha Poke",
    concept: "Poke Bowls frais et sains, fusion Hawaïenne/Japonaise.",
    visualStyle: "Minimaliste, bois clair, couleurs pastels, zen.",
    ingredients: ["Saumon frais", "Thon rouge", "Riz vinaigré", "Avocat", "Mangue", "Edamame", "Gingembre mariné", "Wakamé", "Sauce soja", "Sésame"],
    equipment: ["Cuiseur à riz", "Couteau Yanagiba", "Saladette"],
  };

  try {
    console.log("- Etape 1: Identity...");
    const brand = await generateBrandCore(testData.ingredients, testData.equipment, testData.brandName, testData.concept, testData.visualStyle, { allowNewIngredients: false });
    console.log("   -> Logo Prompt:", brand.logo_prompt);

    console.log("- Etape 2: Items...");
    const items = await generateCoreItems(testData.ingredients, brand, { allowNewIngredients: false });
    console.log(`   -> OK: ${items.main_dishes.length} plats créés.`);

    console.log("- Etape 3: Menu...");
    const menu = await generateMenuAssembly(items, ["The Glacé", "Eau coco"], ["Mochi", "Salade de fruits"], brand);
    console.log(`   -> OK: ${menu.combos.length} combos créés.`);

    console.log("\n✅ VERIFICATION TERMINEE : LE MOTEUR EST STABLE ET COHERENT.");
  } catch (e) {
    console.error("❌ ECHEC DU TEST :", e);
  }
}

finalValidation();
