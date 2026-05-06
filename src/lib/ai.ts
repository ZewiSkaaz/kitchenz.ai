import OpenAI from "openai";

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
  // Deprecated — remplacé par OpenAI gpt-image-1
  throw new Error("HuggingFace is no longer used. Use generateMenuItemImage or generateBrandImages directly.");
}

/**
 * Fonction d'aide pour retenter les appels API en cas d'échec
 * MASTER V2.2 - Resilience Engine
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// PRICING CONSTANTS (MASTER AUDIT V2.2)
// ---------------------------------------------------------------------------

export const PRICING = {
  UBER_COMMISSION: 0.30, // Commission standard Uber Eats
  UBER_MARKETING_ADS: 0.15, // Budget moyen recommandé pour la visibilité (Ads)
  STRIPE_FEE: 0.02, // Frais de transaction
  TVA_FOOD: 0.10,
  TVA_ALCOHOL: 0.20,
  PACKAGING_COST: 0.75, // Ajusté pour le premium
};

function roundToPsychologicalPrice(price: number): number {
  const floor = Math.floor(price);
  const decimals = price - floor;
  if (decimals < 0.25) return floor - 0.10; // ex: 14.90
  if (decimals < 0.75) return floor + 0.90; // ex: 15.90
  return floor + 1.0;
}

export function calculateSellingPrice(
  materialCost: number, 
  netMargin: number, 
  tvaRate: number = PRICING.TVA_FOOD
): number {
  // Formule Master : Coût / (1 - Somme des frais)
  const totalFees = PRICING.UBER_COMMISSION + PRICING.UBER_MARKETING_ADS + PRICING.STRIPE_FEE;
  // On ajoute une sécurité pour ne pas diviser par zéro ou négatif si les frais changent
  const safetyMargin = Math.max(0.1, 1 - totalFees);
  const rawPrice = ((materialCost + netMargin + PRICING.PACKAGING_COST) * (1 + tvaRate) / safetyMargin);
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
  const response = await withRetry(() => openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "Tu réponds EXCLUSIVEMENT en français (sauf les prompts d'images en anglais)." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: brandCoreSchema },
  }));

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
    - Fournis 'material_cost' (coût matières premières EN EUROS) et 'net_margin_target' (marge nette visée EN EUROS).
    - PLAGES OBLIGATOIRES : material_cost entre 1.50€ et 8€, net_margin_target entre 2€ et 8€.
    - Un burger doit coûter 3-5€ en matières premières, un side 1-2€.
    - NE PAS mettre des valeurs absurdes comme 50€ ou 100€.
    
    ${flexibilityOptions?.allowNewIngredients ? "AUTORISATION : Ajoute jusqu'à 3 ingrédients rentables hors liste." : "STRICT : Uniquement les ingrédients fournis."}
  `;

  const openai = getOpenAI();
  const response = await withRetry(() => openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "Tu es un chef cuisinier expert en rentabilité et SEO Uber Eats. Réponds EXCLUSIVEMENT en français." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: coreItemsSchema },
  }));

  const rawData = JSON.parse(response.choices[0].message.content || "{}");
  const validatedData = CoreItemsZod.parse(rawData);
  
  // Guardrails : éviter les prix aberrants de l'IA (Ciblage 12-18€ pour les plats)
  const clampFinancials = (item: any, isMain: boolean) => {
    if (item.financials) {
      // Coût matière réaliste (ex: 2.50€ à 5.50€)
      item.financials.material_cost = Math.max(1.50, Math.min(isMain ? 6 : 3, item.financials.material_cost));
      // Marge nette réaliste (ex: 3€ à 6€)
      item.financials.net_margin_target = Math.max(2, Math.min(6, item.financials.net_margin_target));
      item.financials.selling_price = calculateSellingPrice(item.financials.material_cost, item.financials.net_margin_target);
    }
  };

  if (validatedData.main_dishes) validatedData.main_dishes.forEach((i: any) => clampFinancials(i, true));
  if (validatedData.generated_sides) validatedData.generated_sides.forEach((i: any) => clampFinancials(i, false));

  return validatedData;
}

export async function generateMenuAssembly(
  coreItems: any,
  drinks: string[],
  desserts: string[],
  brandCore: any
) {
  const mainDishTitles = (coreItems.main_dishes || []).map((d: any) => d.title).join(", ");
  const sideTitles = (coreItems.generated_sides || []).map((d: any) => d.title).join(", ");
  const drinkList = drinks.join(", ") || "Coca-Cola, Eau";
  const dessertList = desserts.join(", ") || "Cookie";

  const prompt = `
    Agis en tant qu'Expert Marketing Uber Eats pour la marque "${brandCore.name}" (${brandCore.culinary_style}).
    
    TU DOIS ABSOLUMENT utiliser UNIQUEMENT les plats suivants pour créer les combos :
    - Plats Principaux disponibles : ${mainDishTitles}
    - Accompagnements disponibles : ${sideTitles}
    - Boissons disponibles : ${drinkList}
    - Desserts disponibles : ${dessertList}
    
    Crée EXACTEMENT 3 Menus Combos cohérents avec ces plats.
    RÈGLE DE NOMMAGE : Le titre DOIT être "Menu [Nom du Plat Principal]".
    RÈGLE D'UPSELL : Pour CHAQUE combo, crée un groupe de modificateurs nommé "🔥 SUPPLÉMENTS GOURMANDS" avec 2-3 options payantes cohérentes avec le concept.
    INTERDIT : N'invente AUCUN plat qui n'est pas dans la liste ci-dessus.
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

  // Guardrails combos : Ciblage 18.90€ - 26.90€ (Le sweet spot Uber Eats)
  const clampCombo = (item: any) => {
    if (item.financials) {
      item.financials.material_cost = Math.max(3, Math.min(8, item.financials.material_cost));
      item.financials.net_margin_target = Math.max(3, Math.min(7, item.financials.net_margin_target));
      item.financials.selling_price = calculateSellingPrice(item.financials.material_cost, item.financials.net_margin_target);
    }
  };

  if (validatedData.combos) validatedData.combos.forEach(clampCombo);
  return validatedData;
}

const inventorySchema = {
  name: "inventory_analysis",
  strict: true,
  schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            qty: { type: "string" },
            category: { type: "string", enum: ["Protéines", "Légumes/Fruits", "Laitages", "Épicerie", "Liquides", "Boulangerie", "Autre"] },
            is_processed: { type: "boolean" }
          },
          required: ["name", "qty", "category", "is_processed"],
          additionalProperties: false
        }
      }
    },
    required: ["items"],
    additionalProperties: false
  }
};

export async function analyzeInventoryImage(base64Image: string) {
  const prompt = `
    Agis en tant qu'Expert Logistique Dark Kitchen. Analyse cette image de stock.
    
    MISSIONS :
    1. Identifie uniquement les ingrédients alimentaires exploitables.
    2. Quantifie précisément (ex: "5kg", "3 packs", "12 unités").
    3. Catégorise chaque item selon le schéma fourni.
    4. Ignore strictement : étagères, sols, outils, emballages vides, logos de marques de transport.
  `;
  
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }]}],
    response_format: { type: "json_schema", json_schema: inventorySchema }
  });
  
  const data = JSON.parse(response.choices[0].message.content || '{"items":[]}');
  return data.items || [];
}

/**
 * GÉNÉRATION PHOTO HARDENED (Audit #2)
 * Unifie l'arrière-plan et maximise l'appétence culinaire.
 */
/**
 * GÉNÉRATION PHOTO via OpenAI gpt-image-1
 * Modèle natif OpenAI — bien supérieur à FLUX pour la cohérence et les logos.
 */
export async function generateMenuItemImage(
  itemTitle: string,
  itemDescription: string,
  culinaryStyle: string,
  visualStyle: string
): Promise<string | null> {
  try {
    const openai = getOpenAI();
    const bgSurface = visualStyle.toLowerCase().includes("clair") || visualStyle.toLowerCase().includes("minimal")
      ? "on a clean white marble kitchen counter"
      : "on a dark slate textured ceramic plate, rustic wooden table";

    const imagePrompt = `Authentic, raw food photography of ${itemTitle}. ${itemDescription}. Shot on a 35mm lens, high-end culinary photography, natural morning window light, realistic textures, slight imperfections like fresh herb scattering, visible steam, shallow depth of field. Professional food styling, no artificial gloss, no CGI. Background: ${bgSurface}. Aesthetic: ${visualStyle}, ${culinaryStyle}. Minimalist, clean, authentic, restaurant-grade quality. No text, no watermarks, no branding.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
      response_format: "b64_json",
    } as any);

    const b64 = (response.data?.[0] as any)?.b64_json;
    if (!b64) return null;
    return `data:image/png;base64,${b64}`;
  } catch (error) {
    console.warn(`⚠️ Image generation failed for ${itemTitle}:`, (error as any).message);
    return null;
  }
}

export async function generateBrandImages(
  brandName: string,
  logoPrompt: string,
  backgroundPrompt: string,
  mainDishesContext?: string
): Promise<{ logoUrl: string | null; backgroundUrl: string | null }> {
  try {
    const openai = getOpenAI();

    const [logoRes, bgRes] = await Promise.all([
      openai.images.generate({
        model: "dall-e-3",
        prompt: `A simple, clean minimalist restaurant logo for "${brandName}". Flat vector style, solid matte background, sharp typography. Style: ${logoPrompt}. Minimalist, iconic, professional. NO 3D, NO SHADOWS, NO GRADIENTS.`,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural",
        response_format: "b64_json",
      } as any),
      openai.images.generate({
        model: "dall-e-3",
        prompt: `Atmospheric wide-angle interior or tabletop shot for a premium restaurant. Natural warm lighting, shot on film. Featuring: ${mainDishesContext || ""}. Style: ${backgroundPrompt}. No text.`,
        n: 1,
        size: "1792x1024", 
        quality: "hd",
        style: "natural",
        response_format: "b64_json",
      } as any),
    ]);

    const logoB64 = (logoRes.data?.[0] as any)?.b64_json;
    const bgB64 = (bgRes.data?.[0] as any)?.b64_json;

    return {
      logoUrl: logoB64 ? `data:image/png;base64,${logoB64}` : null,
      backgroundUrl: bgB64 ? `data:image/png;base64,${bgB64}` : null,
    };
  } catch (error) {
    console.warn("⚠️ Brand image generation failed:", (error as any).message);
    return { logoUrl: null, backgroundUrl: null };
  }
}
