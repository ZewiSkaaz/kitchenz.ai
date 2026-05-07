import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";
import { z } from "zod";

let openaiInstance: OpenAI | null = null;

function getOpenAI() {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "",
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiInstance;
}

function getHF() {
  return new HfInference(process.env.HUGGINGFACE_TOKEN);
}

async function askAI(prompt: string, systemPrompt: string = "You are a professional culinary branding expert.", schema?: any) {
  // 1. Essai avec OpenAI (Priorité car rechargé + Qualité JSON supérieure)
  try {
    const openai = getOpenAI();
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: schema ? { type: "json_schema", json_schema: schema } : { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    }
  } catch (e) {
    console.warn("⚠️ OpenAI failed, falling back to Pollinations...", (e as any).message);
  }

  // 2. Fallback Pollinations (Gratuit)
  const models = ["openai", "mistral", "llama"];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          model: model,
          jsonMode: true
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status} from ${model}`);
      
      const text = await response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
      console.warn(`⚠️ Pollinations ${model} failed...`, (e as any).message);
      lastError = e;
    }
  }
  throw lastError || new Error("All AI models failed");
}
function healItem(item: any) {
  return {
    title: item.title || "Sans nom",
    description_seo: item.description_seo || item.description || "Délicieux plat préparé avec soin.",
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
    financials: {
      material_cost: item.financials?.material_cost || 3,
      net_margin_target: item.financials?.net_margin_target || 10,
      selling_price: item.financials?.selling_price || 15
    },
    category: item.category || "Plats",
    dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
    allergens: Array.isArray(item.allergens) ? item.allergens : [],
    prep_instructions: item.prep_instructions || "Assembler les ingrédients avec soin.",
    modifier_groups: Array.isArray(item.modifier_groups) ? item.modifier_groups : []
  };
}

/**
 * Retries for resilience
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.warn(`⚠️ API Error, retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

// ---------------------------------------------------------------------------
// PRICING & LOGIC
// ---------------------------------------------------------------------------
export const PRICING = {
  UBER_COMMISSION: 0.30,
  UBER_MARKETING_ADS: 0.15,
  STRIPE_FEE: 0.02,
  TVA_FOOD: 0.10,
  TVA_ALCOHOL: 0.20,
  PACKAGING_COST: 0.75,
};

function roundToPsychologicalPrice(price: number): number {
  const floor = Math.floor(price);
  const decimals = price - floor;
  if (decimals < 0.25) return floor - 0.10;
  if (decimals < 0.75) return floor + 0.90;
  return floor + 1.0;
}

export function calculateSellingPrice(materialCost: number, netMargin: number, tvaRate: number = PRICING.TVA_FOOD): number {
  const totalFees = PRICING.UBER_COMMISSION + PRICING.UBER_MARKETING_ADS + PRICING.STRIPE_FEE;
  const safetyMargin = Math.max(0.1, 1 - totalFees);
  const rawPrice = ((materialCost + netMargin + PRICING.PACKAGING_COST) * (1 + tvaRate) / safetyMargin);
  return roundToPsychologicalPrice(rawPrice);
}

// ---------------------------------------------------------------------------
// SCHEMAS (GPT-4o)
// ---------------------------------------------------------------------------
const brandCoreSchema = {
  name: "brand_core_generation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      tagline: { type: "string" },
      storytelling: { type: "string" },
      culinary_style: { type: "string" },
      logo_prompt: { type: "string" },
      background_prompt: { type: "string" },
      suggested_new_equipment: { type: "array", items: { type: "string" } },
    },
    required: ["name", "tagline", "storytelling", "culinary_style", "logo_prompt", "background_prompt", "suggested_new_equipment"],
    additionalProperties: false,
  },
};

const coreItemsSchema = {
  name: "core_items_generation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      main_dishes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description_seo: { type: "string" },
            ingredients: { type: "array", items: { type: "string" } },
            financials: {
              type: "object",
              properties: {
                material_cost: { type: "number" },
                net_margin_target: { type: "number" },
              },
              required: ["material_cost", "net_margin_target"],
              additionalProperties: false,
            },
            category: { type: "string" },
            dietary_tags: { type: "array", items: { type: "string" } },
            allergens: { type: "array", items: { type: "string" } },
            prep_instructions: { type: "string" },
          },
          required: ["title", "description_seo", "ingredients", "financials", "category", "dietary_tags", "allergens", "prep_instructions"],
          additionalProperties: false,
        },
      },
      generated_sides: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description_seo: { type: "string" },
            ingredients: { type: "array", items: { type: "string" } },
            financials: {
              type: "object",
              properties: {
                material_cost: { type: "number" },
                net_margin_target: { type: "number" },
              },
              required: ["material_cost", "net_margin_target"],
              additionalProperties: false,
            },
            category: { type: "string" },
            dietary_tags: { type: "array", items: { type: "string" } },
            allergens: { type: "array", items: { type: "string" } },
            prep_instructions: { type: "string" },
          },
          required: ["title", "description_seo", "ingredients", "financials", "category", "dietary_tags", "allergens", "prep_instructions"],
          additionalProperties: false,
        },
      },
      suggested_new_ingredients: { type: "array", items: { type: "string" } },
    },
    required: ["main_dishes", "generated_sides", "suggested_new_ingredients"],
    additionalProperties: false,
  },
};

const menuAssemblySchema = {
  name: "menu_assembly_generation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      combos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description_seo: { type: "string" },
            ingredients: { type: "array", items: { type: "string" } },
            financials: {
              type: "object",
              properties: {
                material_cost: { type: "number" },
                net_margin_target: { type: "number" },
              },
              required: ["material_cost", "net_margin_target"],
              additionalProperties: false,
            },
            category: { type: "string" },
            dietary_tags: { type: "array", items: { type: "string" } },
            allergens: { type: "array", items: { type: "string" } },
            prep_instructions: { type: "string" },
            modifier_groups: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  min_selection: { type: "number" },
                  max_selection: { type: "number" },
                  options: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        price_override: { type: "number" }
                      },
                      required: ["name", "price_override"],
                      additionalProperties: false
                    } 
                  }
                },
                required: ["name", "min_selection", "max_selection", "options"],
                additionalProperties: false
              }
            }
          },
          required: ["title", "description_seo", "ingredients", "financials", "category", "dietary_tags", "allergens", "prep_instructions", "modifier_groups"],
          additionalProperties: false,
        },
      },
    },
    required: ["combos"],
    additionalProperties: false,
  },
};

const BrandCoreZod = z.object({
  name: z.string(),
  tagline: z.string(),
  storytelling: z.string(),
  culinary_style: z.string(),
  logo_prompt: z.string(),
  background_prompt: z.string(),
  suggested_new_equipment: z.array(z.string())
});

const MenuItemZod = z.object({
  title: z.string(),
  description_seo: z.string(),
  ingredients: z.array(z.string()),
  financials: z.object({ material_cost: z.number(), net_margin_target: z.number(), selling_price: z.number().optional() }),
  category: z.string(),
  dietary_tags: z.array(z.string()),
  allergens: z.array(z.string()),
  prep_instructions: z.string()
});

const CoreItemsZod = z.object({
  main_dishes: z.array(MenuItemZod),
  generated_sides: z.array(MenuItemZod),
  suggested_new_ingredients: z.array(z.string())
});

const MenuAssemblyZod = z.object({
  combos: z.array(MenuItemZod.extend({ modifier_groups: z.array(z.any()) }))
});

// ---------------------------------------------------------------------------
// FUNCTIONS
// ---------------------------------------------------------------------------

export async function generateBrandCore(
  ingredients: string[],
  equipment: string[],
  brandName: string,
  concept: string,
  visualStyle: string,
  flexibilityOptions?: { allowNewIngredients?: boolean; allowNewEquipment?: boolean },
  location?: string
) {
  const systemPrompt = `You are a branding expert. Respond ONLY with valid JSON. No talk.`;
  const locationHint = location ? ` Located in: ${location}.` : "";
  const flexHint = flexibilityOptions?.allowNewIngredients ? " You may suggest up to 3 new ingredients." : "";
  const prompt = `Create an identity for: ${brandName}. Concept: ${concept}. Style: ${visualStyle}.${locationHint}${flexHint}
  Return structure:
  {
    "name": "${brandName}",
    "tagline": "...",
    "storytelling": "...",
    "culinary_style": "...",
    "logo_prompt": "simple minimalist logo description in english",
    "background_prompt": "restaurant background description in english",
    "suggested_new_equipment": []
  }`;
  const data = await askAI(prompt, systemPrompt, brandCoreSchema);
  return BrandCoreZod.parse(data);
}

export async function generateCoreItems(
  ingredients: string[],
  brandCore: any,
  flexibilityOptions?: { allowNewIngredients?: boolean; allowNewEquipment?: boolean }
) {
  const systemPrompt = `You are a Chef. Respond ONLY with valid JSON. No talk.`;
  const flexHint = flexibilityOptions?.allowNewIngredients ? " You may suggest up to 3 new ingredients." : "";
  const prompt = `Create 4 main dishes and 3 sides for "${brandCore.name}".${flexHint}
  Return structure:
  {
    "main_dishes": [
      { "title": "...", "description_seo": "...", "ingredients": [], "financials": { "material_cost": 3, "net_margin_target": 10 }, "category": "Plats", "dietary_tags": [], "allergens": [], "prep_instructions": "..." }
    ],
    "generated_sides": [
       { "title": "...", "description_seo": "...", "ingredients": [], "financials": { "material_cost": 1, "net_margin_target": 5 }, "category": "Sides", "dietary_tags": [], "allergens": [], "prep_instructions": "..." }
    ],
    "suggested_new_ingredients": []
  }`;
  const data = await askAI(prompt, systemPrompt, coreItemsSchema);
  data.main_dishes = (data.main_dishes || []).map(healItem).map((i: any) => ({...i, financials: {...i.financials, selling_price: calculateSellingPrice(i.financials.material_cost, i.financials.net_margin_target)}}));
  data.generated_sides = (data.generated_sides || []).map(healItem).map((i: any) => ({...i, financials: {...i.financials, selling_price: calculateSellingPrice(i.financials.material_cost, i.financials.net_margin_target)}}));
  return CoreItemsZod.parse(data);
}

export async function generateMenuAssembly(coreItems: any, drinks: string[], desserts: string[], brandCore: any) {
  const systemPrompt = `Expert Marketing. Respond ONLY with valid JSON. No talk.`;
  const prompt = `Assemble 3 menu combos for "${brandCore.name}".
  Return structure:
  {
    "combos": [
      { 
        "title": "Nom du Menu", 
        "description_seo": "...", 
        "ingredients": ["Item 1", "Item 2"], 
        "financials": { "material_cost": 5, "net_margin_target": 15 },
        "category": "Menus",
        "dietary_tags": [],
        "allergens": [],
        "prep_instructions": "...",
        "modifier_groups": []
      }
    ]
  }`;
  const data = await askAI(prompt, systemPrompt, menuAssemblySchema);
  data.combos = (data.combos || []).map(healItem).map((i: any) => ({...i, financials: {...i.financials, selling_price: calculateSellingPrice(i.financials.material_cost, i.financials.net_margin_target)}}));
  return MenuAssemblyZod.parse(data);
}

/**
 * 📸 ANALYSE D'IMAGE D'INVENTAIRE (GPT-4o Vision)
 */
export async function analyzeInventoryImage(base64Image: string): Promise<{ name: string; qty: string }[]> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: 'Analyze this kitchen inventory photo. List all visible food ingredients with their estimated quantities. Respond ONLY with valid JSON: { "items": [{ "name": "string", "qty": "string" }] }' },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    return data.items || [];
  } catch (error) {
    console.warn("⚠️ analyzeInventoryImage failed:", (error as any).message);
    return [];
  }
}

/**
 * 📸 GÉNÉRATION PHOTO (FLUX via Pollinations)
 *
 * @param sceneSeed     Seed commun à toute la session → même décor pour tous les produits
 * @param backgroundPrompt  Contexte visuel de la marque injecté dans chaque photo
 */
export async function generateMenuItemImage(
  itemTitle: string,
  itemDescription: string,
  culinaryStyle: string,
  visualStyle: string,
  backgroundPrompt: string = "",
  sceneSeed?: number
): Promise<string | null> {
  try {
    const seed = sceneSeed ?? Math.floor(Math.random() * 1000000);
    const bgContext = backgroundPrompt
      ? ` Consistent setting: ${backgroundPrompt}.`
      : "";
    const prompt = `Professional food photography, overhead shot of ${itemTitle}. ${itemDescription}.${bgContext} Same background and table surface as all other dishes in this menu. Shot on a high-end camera, natural side lighting, shallow depth of field, realistic textures, styled plating. Style: "${visualStyle}" and "${culinaryStyle}". Strict rule: NO TEXT, NO LOGO, NO WATERMARK.`;
    const encodedPrompt = encodeURIComponent(prompt);
    
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Pollinations HTTP ${response.status}`);
    
    const buffer = await response.arrayBuffer();
    return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
  } catch (error) {
    console.warn(`⚠️ Pollinations failed for ${itemTitle}:`, (error as any).message);
    return null;
  }
}

/**
 * Génère le logo (DALL-E 3 via OpenAI) + le background de marque (FLUX via Pollinations)
 * Retourne aussi le sceneSeed pour l'utiliser dans toutes les photos produits
 */
export async function generateBrandImages(
  brandName: string,
  logoPrompt: string,
  backgroundPrompt: string,
  mainDishesContext?: string
): Promise<{ logoUrl: string | null; backgroundUrl: string | null; sceneSeed: number }> {
  const sceneSeed = Math.floor(Math.random() * 1000000);

  try {
    // 🎨 Logo → DALL-E 3 (meilleur pour le texte et les instructions précises)
    let logoUrl: string | null = null;
    try {
      const openai = getOpenAI();
      const logoResp = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional minimalist restaurant logo for "${brandName}". ${logoPrompt}. Clean typography, flat design, solid white background. NO taglines, NO background imagery.`,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural",
        response_format: "b64_json",
      });
      const b64 = (logoResp.data?.[0] as any)?.b64_json;
      if (b64) logoUrl = `data:image/png;base64,${b64}`;
    } catch (logoErr) {
      console.warn("⚠️ DALL-E logo failed, fallback Pollinations:", (logoErr as any).message);
      // Fallback Pollinations si OpenAI échoue
      const fbUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`Professional minimalist restaurant logo for "${brandName}". ${logoPrompt}. Clean typography, flat design, solid background. NO taglines.`)}?width=1024&height=1024&nologo=true&seed=${sceneSeed}&model=flux`;
      const fbRes = await fetch(fbUrl);
      if (fbRes.ok) logoUrl = `data:image/png;base64,${Buffer.from(await fbRes.arrayBuffer()).toString("base64")}`;
    }

    // 🏠 Background → FLUX via Pollinations (gratuit, cohérent)
    const bgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`Cinematic wide restaurant background photo. ${backgroundPrompt}. Featuring: ${mainDishesContext || ""}. High resolution, natural light, warm atmosphere. NO people, NO text.`)}?width=1024&height=768&nologo=true&seed=${sceneSeed}&model=flux`;
    const bgRes = await fetch(bgUrl);
    const backgroundUrl = bgRes.ok
      ? `data:image/png;base64,${Buffer.from(await bgRes.arrayBuffer()).toString("base64")}`
      : null;

    return { logoUrl, backgroundUrl, sceneSeed };
  } catch (error) {
    console.error("❌ generateBrandImages error:", (error as any).message);
    return { logoUrl: null, backgroundUrl: null, sceneSeed };
  }
}
