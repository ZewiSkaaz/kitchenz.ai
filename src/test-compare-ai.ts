import { OpenAI } from "openai";
import { HfInference } from "@huggingface/inference";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

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
      return filePath;
    }
  } catch (e) {
    console.error("❌ Erreur DALL-E:", e);
  }
}

async function testFlux() {
  console.log("🚀 Génération FLUX.1 [dev] en cours...");
  if (!process.env.HUGGINGFACE_TOKEN) {
    console.log("⚠️ HUGGINGFACE_TOKEN manquant dans .env.local. Test FLUX ignoré.");
    return;
  }
  try {
    const blob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-dev",
      inputs: LOGO_PROMPT,
      parameters: {
        guidance_scale: 3.5,
        num_inference_steps: 28,
      },
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const filePath = path.join(process.cwd(), "logo_flux.png");
    fs.writeFileSync(filePath, buffer);
    console.log("✅ Logo FLUX sauvegardé : logo_flux.png");
    return filePath;
  } catch (e) {
    console.error("❌ Erreur FLUX:", e);
  }
}

async function run() {
  console.log(`--- COMPARATIF LOGO : ${BRAND_NAME} ---`);
  await testDalle();
  await testFlux();
  console.log("\nComparaison terminée. Vérifie les fichiers logo_dalle.png et logo_flux.png à la racine.");
}

run();
