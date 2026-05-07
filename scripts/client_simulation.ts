import { generateBrandCore, generateCoreItems, generateMenuAssembly } from "../src/lib/ai";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: ".env.local" });

async function clientSimulation() {
  console.log("🚀 SIMULATION CLIENT : LE GONE DU TACOS (LYON)...");
  
  const ingredients = ["Tortilla", "Viande hachée", "Filet de poulet", "Sauce fromagère maison", "Boursin", "Frites", "Oignons frits"];
  const equipment = ["Plancha", "Presse à panini", "Friteuse"];

  try {
    console.log("1. Création de l'identité de marque...");
    const brand = await generateBrandCore(ingredients, equipment, "Le Gone du Tacos", "Tacos Lyonnais authentique avec sauce fromagère maison et gratinage Boursin.", "Urbain, moderne, esprit 'Bouchon' moderne.", { allowNewIngredients: false }, "Lyon, France");
    
    console.log("2. Développement des recettes signatures...");
    const items = await generateCoreItems(ingredients, brand, { allowNewIngredients: false });
    
    console.log("3. Optimisation des menus combos...");
    const menu = await generateMenuAssembly(items, ["Oasis", "Coca-Cola"], ["Tarte aux pralines", "Mousse chocolat"], brand);

    const audit = { brand, items, menu };
    fs.writeFileSync("client_audit_simulation.json", JSON.stringify(audit, null, 2));
    console.log("✅ Audit terminé avec succès.");
  } catch (e) {
    console.error("❌ Erreur simulation:", e);
  }
}

clientSimulation();
