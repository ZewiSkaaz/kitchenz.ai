import { generateBrandCore, generateCoreItems, generateMenuAssembly } from "../src/lib/ai";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: ".env.local" });

async function stressTest() {
  console.log("🔥 STRESS TEST DU MOTEUR IA EN COURS...");
  
  const massiveInventory = [
    "Pois chiches", "Tahini", "Agneau", "Poulet", "Bœuf", "Semoule", "Lentilles", "Tomates", "Concombres", "Oignons", 
    "Ail", "Persil", "Coriandre", "Menthe", "Citron", "Huile d'olive", "Cumin", "Paprika", "Curcuma", "Cannelle", 
    "Pain Libanais", "Aubergines", "Poivrons", "Yaourt", "Feta", "Olives", "Pignons de pin", "Dattes", "Miel", "Pistaches"
  ];
  
  const equipment = ["Four à pain", "Broche verticale", "Marmite 50L", "Mixeur pro", "Plancha", "Friteuse"];

  try {
    console.log("⏱️ Phase 1: Brand Identity (Complex concept)...");
    const brand = await generateBrandCore(massiveInventory, equipment, "L'Épopée du Levant", "Un concept fusion entre cuisine libanaise traditionnelle et gastronomie moderne, axé sur le partage et le luxe abordable.", "Élégant, sombre, or et velours, ambiance mille et une nuits moderne.", { allowNewIngredients: false }, "Paris");
    
    console.log("⏱️ Phase 2: Generating Core Items (8 items)...");
    const items = await generateCoreItems(massiveInventory, brand, { allowNewIngredients: false });
    
    console.log("⏱️ Phase 3: Assembling Menu Combos (5 combos)...");
    const menu = await generateMenuAssembly(items, ["Thé menthe", "Limonade maison"], ["Baklava", "Loukoum"], brand);

    const report = {
      timestamp: new Date().toISOString(),
      success: true,
      data_integrity: {
        item_count: items.main_dishes.length + items.generated_sides.length,
        combo_count: menu.combos.length,
        ingredient_compliance: items.main_dishes.every(i => i.ingredients.every(ing => massiveInventory.includes(ing) || ing.toLowerCase().includes("sel") || ing.toLowerCase().includes("poivre")))
      },
      audit_result: { brand, items, menu }
    };

    fs.writeFileSync("STRESS_TEST_REPORT.json", JSON.stringify(report, null, 2));
    console.log("\n✅ STRESS TEST TERMINE !");
    console.log("Vérification de l'intégrité des ingrédients :", report.data_integrity.ingredient_compliance ? "PARFAITE" : "ATTENTION (Hallucinations détectées)");
    console.log("Prix de vente moyen généré :", 0);
  } catch (e) {
    console.error("❌ ECHEC DU STRESS TEST :", e);
  }
}

stressTest();
