const { OpenAI } = require("openai");
const { HfInference } = require("@huggingface/inference");
const fs = require("fs");
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: ".env.local" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

const BRAND_NAME = "Zack Burger";
const LOGO_PROMPT = `A minimalist professional vector logo for a high-end burger brand named "${BRAND_NAME}". Flat design, modern typography, circular emblem, orange and charcoal gray colors, white background.`;

async function testDalle() {
  console.log("🚀 Génération DALL-E 3 en cours...");
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: LOGO_PROMPT,
      n: 1,
      size: "1024x1024",
    });
    const url = response.data[0].url;
    if (url) {
      const res = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(process.cwd(), "logo_dalle.png");
      fs.writeFileSync(filePath, res.data);
      console.log("✅ Logo DALL-E sauvegardé : logo_dalle.png");
    }
  } catch (e) {
    console.error("❌ Erreur DALL-E:", e.message);
  }
}

async function testFlux() {
  console.log("🚀 Génération FLUX.1 [schnell] en cours...");
  if (!process.env.HUGGINGFACE_TOKEN) {
    console.log("⚠️ HUGGINGFACE_TOKEN manquant dans .env.local.");
    return;
  }
  try {
    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: LOGO_PROMPT,
      parameters: {
        width: 1024,
        height: 1024,
      },
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const filePath = path.join(process.cwd(), "logo_flux.png");
    fs.writeFileSync(filePath, buffer);
    console.log("✅ Logo FLUX sauvegardé (HD) : logo_flux.png");
  } catch (e) {
    console.error("❌ Erreur FLUX:", e.message);
  }
}

async function run() {
  console.log(`--- COMPARATIF LOGO : ${BRAND_NAME} ---`);
  await testDalle();
  await testFlux();
  console.log("\nComparaison terminée. Vérifie les fichiers logo_dalle.png et logo_flux.png à la racine.");
}

run();
