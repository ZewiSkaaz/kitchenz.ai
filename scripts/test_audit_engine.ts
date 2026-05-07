import { generateBrandCore, generateCoreItems, generateMenuAssembly } from "../src/lib/ai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load env
dotenv.config({ path: ".env.local" });

async function runTestAudit() {
  console.log("🚀 DEMARRAGE DE L'AUDIT DE TEST (MOTEUR IA)...");
  
  const testData = {
    brandName: "Smash Sultan",
    concept: "Transformation d'un Kebab traditionnel en marque de Smash Burger premium spécialisée dans la livraison.",
    visualStyle: "Street-food haut de gamme, néons, contrastes forts, gourmandise extrême.",
    ingredients: ["Viande de bœuf hachée", "Buns Briochés", "Cheddar Mature", "Oignons Rouges", "Sauce Signature", "Piments", "Pita (Stock existant)", "Frites"],
    equipment: ["Plancha", "Presse à Smash", "Friteuse", "Bac GN", "Couteaux Chef"],
    location: "Paris, France"
  };

  try {
    // 1. BRAND CORE
    console.log("Step 1/3: Génération de l'ADN de marque...");
    const brandCore = await generateBrandCore(
      testData.ingredients,
      testData.equipment,
      testData.brandName,
      testData.concept,
      testData.visualStyle,
      { allowNewIngredients: true },
      testData.location
    );
    console.log("✅ Identity created:", brandCore.name, "-", brandCore.tagline);

    // 2. CORE ITEMS
    console.log("Step 2/3: Création des plats et accompagnements...");
    const coreItems = await generateCoreItems(
      testData.ingredients,
      brandCore,
      { allowNewIngredients: true }
    );
    console.log(`✅ Items created: ${coreItems.main_dishes.length} plats, ${coreItems.generated_sides.length} sides.`);

    // 3. MENU ASSEMBLY
    console.log("Step 3/3: Assemblage des menus combos...");
    const menuAssembly = await generateMenuAssembly(
      coreItems,
      ["Coca-Cola", "Oasis", "Eau"],
      ["Cookie Maison", "Tiramisu"],
      brandCore
    );
    console.log(`✅ Menu assembled: ${menuAssembly.combos.length} combos.`);

    // SAVE RESULT
    const finalResult = {
      brand_identity: brandCore,
      menu_items: [
        ...coreItems.main_dishes,
        ...coreItems.generated_sides,
        ...menuAssembly.combos
      ]
    };

    const outputPath = path.join(process.cwd(), "test_audit_result.json");
    fs.writeFileSync(outputPath, JSON.stringify(finalResult, null, 2));
    
    console.log("\n✨ TEST REUSSI !");
    console.log(`Résultat enregistré dans: ${outputPath}`);
    console.log("Marge nette moyenne estimée:", (finalResult.menu_items.reduce((acc, i) => acc + i.financials.net_margin_target, 0) / finalResult.menu_items.length).toFixed(2) + "€");

  } catch (error) {
    console.error("❌ ERREUR LORS DU TEST:", error);
    process.exit(1);
  }
}

runTestAudit();
