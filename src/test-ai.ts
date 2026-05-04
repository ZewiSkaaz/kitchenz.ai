import { generateBrandCore, generateCoreItems, generateMenuAssembly } from "./lib/ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  console.log("🚀 Démarrage du Test IA en 3 étapes...");
  
  const ingredients = ["Poulet", "Pain brioché", "Cheddar", "Sauce secrète", "Salade"];
  const equipment = ["Friteuse", "Plancha"];
  const concept = "Un fast food premium autour du poulet frit";
  const visualStyle = "Cyberpunk, néons jaunes et roses";
  const drinks = ["Coca-Cola", "Sprite"];
  const desserts = ["Cookie", "Glace Vanille"];

  try {
    console.log("⏱️ Étape 1 : Brand Core...");
    const brandCore = await generateBrandCore(ingredients, equipment, concept, visualStyle);
    console.log("✅ Identité :", brandCore.name, "-", brandCore.tagline);

    console.log("\n⏱️ Étape 2 : Core Items...");
    const coreItems = await generateCoreItems(ingredients, brandCore);
    console.log(`✅ Généré : ${coreItems.main_dishes.length} plats, ${coreItems.generated_sides.length} sides`);

    console.log("\n⏱️ Étape 3 : Menu Assembly...");
    const menuAssembly = await generateMenuAssembly(coreItems, drinks, desserts, brandCore);
    console.log(`✅ Généré : ${menuAssembly.combos.length} combos, ${menuAssembly.special_offers.length} offres spéciales`);

    console.log("\n🎉 TEST RÉUSSI. Le workflow de génération est opérationnel.");
  } catch (error) {
    console.error("❌ Erreur pendant le test :", error);
  }
}

test();
