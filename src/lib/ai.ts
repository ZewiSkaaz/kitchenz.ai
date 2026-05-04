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
  return new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN || process.env.HUGGINGFACE_TOKEN || "");
}

// ---------------------------------------------------------------------------
// PRICING CONSTANTS (Paramétrables)
// ---------------------------------------------------------------------------

export const PRICING = {
  UBER_COMMISSION: 0.30,    // 30% commission Uber Eats
  TVA_FOOD: 0.10,           // 10% TVA restauration livrée
  TVA_ALCOHOL: 0.20,        // 20% TVA boissons alcoolisées
  PACKAGING_COST: 0.50,     // 0.50€ coût emballage moyen par commande
};

/**
 * Arrondi psychologique pour Uber Eats (.90, .95 ou .00)
 */
function roundToPsychologicalPrice(price: number): number {
  const floor = Math.floor(price);
  const decimals = price - floor;
  
  if (decimals < 0.25) return floor; // 14.20 -> 14.00
  if (decimals < 0.75) return floor + 0.90; // 14.40 -> 14.90
  return floor + 1.0; // 14.80 -> 15.00
}

// Formule de calcul du prix de vente TTC avec Arrondi Psychologique
export function calculateSellingPrice(
  materialCost: number, 
  netMargin: number, 
  tvaRate: number = PRICING.TVA_FOOD
): number {
  const rawPrice = ((materialCost + netMargin + PRICING.PACKAGING_COST) * (1 + tvaRate) / (1 - PRICING.UBER_COMMISSION));
  return roundToPsychologicalPrice(rawPrice);
}

// ---------------------------------------------------------------------------
// SCHEMAS
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

// ---------------------------------------------------------------------------
// ZOD SCHEMAS
// ---------------------------------------------------------------------------
const BrandCoreZod = z.object({
  name: z.string(),
  tagline: z.string(),
  storytelling: z.string(),
  culinary_style: z.string(),
  logo_prompt: z.string(),
  background_prompt: z.string(),
  suggested_new_equipment: z.array(z.string())
});

const FinancialsZod = z.object({
  material_cost: z.number(),
  net_margin_target: z.number(),
  selling_price: z.number().optional()
});

const MenuItemZod = z.object({
  title: z.string(),
  description_seo: z.string(),
  ingredients: z.array(z.string()),
  financials: FinancialsZod,
  category: z.string(),
  dietary_tags: z.array(z.string()),
  allergens: z.array(z.string()),
  prep_instructions: z.string()
});

const ModifierOptionZod = z.object({
  name: z.string(),
  price_override: z.number()
});

const ModifierGroupZod = z.object({
  name: z.string(),
  min_selection: z.number(),
  max_selection: z.number(),
  options: z.array(ModifierOptionZod)
});

const ComboItemZod = MenuItemZod.extend({
  modifier_groups: z.array(ModifierGroupZod)
});

const CoreItemsZod = z.object({
  main_dishes: z.array(MenuItemZod),
  generated_sides: z.array(MenuItemZod),
  suggested_new_ingredients: z.array(z.string())
});

const MenuAssemblyZod = z.object({
  combos: z.array(ComboItemZod)
});

// ---------------------------------------------------------------------------
// WORKFLOW FUNCTIONS
// ---------------------------------------------------------------------------

export async function generateBrandCore(
  ingredients: string[],
  equipment: string[],
  brandName: string,
  concept: string,
  visualStyle: string,
  flexibilityOptions?: { allowNewIngredients: boolean; allowNewEquipment: boolean },
  location?: string
) {
  const prompt = `
    Agis en tant qu'agence de branding pour Dark Kitchen.
    Crée une identité de marque virtuelle basée sur ces éléments :
    - Ingrédients : ${ingredients.join(", ")}
    - Matériel : ${equipment.join(", ")}
    - Nom imposé : ${brandName || "Trouve un nom percutant"}
    - Concept souhaité : ${concept || "Invente un concept rentable basé sur les ingrédients"}
    - Style visuel souhaité : ${visualStyle || "Moderne et appétissant"}
    ${location ? `- Localisation : ${location} (Adapte le storytelling pour cette zone géographique)` : ""}

    ${flexibilityOptions?.allowNewEquipment ? "INFO INVESTISSEMENT : Tu as l'autorisation de suggérer 1 nouveau petit matériel si cela permet d'améliorer radicalement le concept." : "CONTRAINTE STRICTE : N'utilise QUE le matériel listé."}

    Génère un nom percutant, un slogan (tagline), un storytelling court (2 phrases), et le style culinaire.
    Génère aussi deux prompts précis (en anglais) pour DALL-E 3 afin de créer le logo et la bannière.
  `;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "Tu réponds EXCLUSIVEMENT en français (sauf les prompts d'images en anglais)." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: brandCoreSchema },
  });

  const rawData = JSON.parse(response.choices[0].message.content || "{}");
  return BrandCoreZod.parse(rawData);
}

export async function generateCoreItems(
  ingredients: string[],
  brandCore: any,
  flexibilityOptions?: { allowNewIngredients: boolean; allowNewEquipment: boolean }
) {
  const prompt = `
    Agis en tant que Chef Exécutif. Pour la marque "${brandCore.name}" (${brandCore.culinary_style}), 
    crée une carte de Plats Principaux et d'Accompagnements (Sides).

    RÈGLES SEO UBER EATS (CRITIQUE) :
    - Titre : Injecte des "Power Words" si pertinent (ex: "L'Original", "Signature", "Fait Maison").
    - Description SEO : Doit être longue (200+ caractères), appétissante, et inclure des émojis (ex: 🔥, 🥑, 🧀).
    - Mots-clés : Utilise des termes recherchés (ex: "Gourmet", "Réconfortant", "Croustillant").

    RÈGLES FINANCIÈRES (CRITIQUE) :
    - Fournis 'material_cost' et 'net_margin_target' (Cible : Marges élevées).
    
    ${flexibilityOptions?.allowNewIngredients ? "AUTORISATION : Ajoute jusqu'à 3 ingrédients rentables hors liste." : "STRICT : Uniquement les ingrédients fournis."}
  `;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "Tu es un chef cuisinier expert en rentabilité et SEO Uber Eats. Réponds EXCLUSIVEMENT en français." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: coreItemsSchema },
  });

  const rawData = JSON.parse(response.choices[0].message.content || "{}");
  const validatedData = CoreItemsZod.parse(rawData);
  
  const applyPricing = (item: any) => {
    if (item.financials) {
      item.financials.selling_price = calculateSellingPrice(item.financials.material_cost, item.financials.net_margin_target);
    }
  };

  if (validatedData.main_dishes) validatedData.main_dishes.forEach(applyPricing);
  if (validatedData.generated_sides) validatedData.generated_sides.forEach(applyPricing);

  return validatedData;
}

export async function generateMenuAssembly(
  coreItems: any,
  drinks: string[],
  desserts: string[],
  brandCore: any
) {
  const prompt = `
    Agis en tant qu'Expert Marketing Uber Eats. Assemble 3 "Menus Combos".

    RÈGLE D'UPSELL (MAX RENTABILITÉ) :
    - Pour CHAQUE combo, crée un groupe de modificateurs nommé "🔥 LES SUPPLÉMENTS GOURMANDS".
    - Ce groupe doit contenir des options payantes (ex: Double Fromage, Bacon croustillant, Sauce secrète).
    - 'price_override' doit être le PRIX DE VENTE du supplément (ex: 1.50, 2.00).

    RÈGLE DE NOMMAGE : Le titre doit être "Menu [Nom du Plat]".
  `;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "Tu es un expert marketing expert en augmentation du panier moyen. Réponds EXCLUSIVEMENT en français." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: menuAssemblySchema },
  });

  const rawData = JSON.parse(response.choices[0].message.content || "{}");
  const validatedData = MenuAssemblyZod.parse(rawData);

  const applyPricing = (item: any) => {
    if (item.financials) {
      item.financials.selling_price = calculateSellingPrice(item.financials.material_cost, item.financials.net_margin_target);
    }
  };

  if (validatedData.combos) validatedData.combos.forEach(applyPricing);
  return validatedData;
}

export async function analyzeInventoryImage(base64Image: string) {
  const prompt = `Analyse cette image d'inventaire. Extrais les ingrédients visibles sous forme de liste JSON { name, qty }.`;
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }]}],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content || "{}").items || [];
}

export async function generateMenuItemImage(itemTitle: string, itemDescription: string, culinaryStyle: string, visualStyle: string) {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Gourmet food photography of ${itemTitle}, ${itemDescription}. Professional studio lighting, 8k resolution, macro lens. Style: "${visualStyle}" and "${culinaryStyle}". No text.`,
        model: "black-forest-labs/FLUX.1-schnell",
        width: 1024, height: 1024,
      }),
    });
    const result = await response.json();
    return result.dataUrl;
  } catch (error) { return null; }
}

export async function generateBrandImages(logoPrompt: string, backgroundPrompt: string, mainDishesContext?: string) {
  try {
    const [logoRes, bgRes] = await Promise.all([
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `A professional minimalist vector logo. Solid black background. Aesthetic: ${logoPrompt}`,
          model: "black-forest-labs/FLUX.1-schnell",
          width: 1024, height: 1024,
        }),
      }).then(r => r.json()),
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Cinematic landscape banner featuring: ${mainDishesContext}. Aesthetic: ${backgroundPrompt}`,
          model: "black-forest-labs/FLUX.1-schnell",
          width: 1024, height: 768,
        }),
      }).then(r => r.json())
    ]);
    return { logoUrl: logoRes.dataUrl, backgroundUrl: bgRes.dataUrl };
  } catch (error) { return { logoUrl: null, backgroundUrl: null }; }
}
