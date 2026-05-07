import {
  generateBrandCore,
  generateCoreItems,
  generateMenuAssembly,
  generateBrandImages,
  generateMenuItemImage,
} from "./lib/ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

// ─── Paramètres de test ────────────────────────────────────────────────────
const ingredients = ["Poulet", "Pain brioché", "Cheddar", "Sauce secrète", "Salade"];
const equipment   = ["Friteuse", "Plancha"];
const brandName   = "Zack Burger";
const concept     = "Un fast food premium autour du poulet frit";
const visualStyle = "Industriel chic, bois sombre et métal brossé";
const drinks      = ["Coca-Cola", "Sprite", "Thé glacé maison"];
const desserts    = ["Cookie maison", "Glace Vanille"];

function saveBase64Image(dataUrl: string, filename: string) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  const outPath = path.join(process.cwd(), filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✅ Sauvegardé → ${filename}`);
}

async function run() {
  console.log("═══════════════════════════════════════════════════");
  console.log(`  🍔 TEST KITCHENZ.AI — Brand: "${brandName}"`);
  console.log("═══════════════════════════════════════════════════\n");

  // ── Étape 1 : Brand Core ─────────────────────────────────────────────────
  console.log("⏱️  Étape 1 : Génération de l'identité de marque...");
  const brandCore = await generateBrandCore(ingredients, equipment, brandName, concept, visualStyle);
  console.log(`  ✅ Marque   : ${brandCore.name}`);
  console.log(`  ✅ Tagline  : ${brandCore.tagline}`);
  console.log(`  ✅ Style    : ${brandCore.culinary_style}`);
  console.log(`  📝 Logo prompt     : ${brandCore.logo_prompt.substring(0, 80)}...`);
  console.log(`  📝 BG prompt       : ${brandCore.background_prompt.substring(0, 80)}...\n`);

  // ── Étape 2 : Core Items ─────────────────────────────────────────────────
  console.log("⏱️  Étape 2 : Génération des plats & sides...");
  const coreItems = await generateCoreItems(ingredients, brandCore);
  console.log(`  ✅ Plats principaux : ${coreItems.main_dishes.length}`);
  console.log(`  ✅ Sides            : ${coreItems.generated_sides.length}`);
  coreItems.main_dishes.forEach(d => console.log(`     → ${d.title} (${d.financials.selling_price}€)`));

  // ── Étape 3 : Menu Assembly ──────────────────────────────────────────────
  console.log("\n⏱️  Étape 3 : Assemblage des menus combinés...");
  const menuAssembly = await generateMenuAssembly(coreItems, drinks, desserts, brandCore);
  console.log(`  ✅ Combos générés : ${menuAssembly.combos.length}`);
  menuAssembly.combos.forEach(c => console.log(`     → ${c.title} (${c.financials.selling_price}€)`));

  // ── Étape 4 : Images de marque (Logo DALL-E 3 + Background Pollinations) ─
  console.log("\n⏱️  Étape 4 : Génération Logo (DALL-E 3) + Background (Pollinations FLUX)...");
  const dishContext = coreItems.main_dishes.slice(0, 2).map(d => d.title).join(", ");
  const { logoUrl, backgroundUrl, sceneSeed } = await generateBrandImages(
    brandCore.name,
    brandCore.logo_prompt,
    brandCore.background_prompt,
    dishContext
  );
  console.log(`  🌱 sceneSeed partagé : ${sceneSeed}`);
  if (logoUrl)       saveBase64Image(logoUrl, "test_logo_dalle.png");
  else               console.log("  ⚠️  Logo non généré");
  if (backgroundUrl) saveBase64Image(backgroundUrl, "test_background.png");
  else               console.log("  ⚠️  Background non généré");

  // ── Étape 5 : Photos produits avec sceneSeed partagé ────────────────────
  console.log("\n⏱️  Étape 5 : Photos produits — même background (sceneSeed partagé)...");
  const itemsToTest = coreItems.main_dishes.slice(0, 3);

  for (let i = 0; i < itemsToTest.length; i++) {
    const item = itemsToTest[i];
    console.log(`  📸 Génération photo [${i + 1}/${itemsToTest.length}] : ${item.title}`);
    const imgUrl = await generateMenuItemImage(
      item.title,
      item.description_seo,
      brandCore.culinary_style,
      visualStyle,
      brandCore.background_prompt, // 👈 Injecté pour cohérence
      sceneSeed                     // 👈 Seed partagé = même décor
    );
    if (imgUrl) saveBase64Image(imgUrl, `test_product_${i + 1}_${item.title.replace(/\s+/g, "_").toLowerCase()}.png`);
    else        console.log(`  ⚠️  Image non générée pour ${item.title}`);
  }

  // ── Résumé ───────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  🎉 TEST TERMINÉ — Vérifier les fichiers générés :");
  console.log("  • test_logo_dalle.png");
  console.log("  • test_background.png");
  console.log("  • test_product_1_*.png");
  console.log("  • test_product_2_*.png");
  console.log("  • test_product_3_*.png");
  console.log("  → Tous les produits partagent le même sceneSeed & background prompt.");
  console.log("═══════════════════════════════════════════════════");
}

run().catch(err => {
  console.error("❌ Erreur critique :", err);
  process.exit(1);
});
