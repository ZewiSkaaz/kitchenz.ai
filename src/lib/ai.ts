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
  UBER_COMMISSION: 0.30,    // 30% commission Uber Eats (ajustable : Deliveroo = 0.25)
  TVA_FOOD: 0.10,           // 10% TVA restauration livrée
  TVA_ALCOHOL: 0.20,        // 20% TVA boissons alcoolisées
  PACKAGING_COST: 0.50,     // 0.50€ coût emballage moyen par commande
};

// Formule de calcul du prix de vente TTC
// Le restaurateur reçoit : prix_TTC × (1 - commission_uber)
// Dont il doit reverser la TVA : montant_reçu / (1 + TVA) = HT reçu
// HT reçu = material_cost + net_margin + packaging
// Donc : prix_TTC = (material_cost + net_margin + packaging) × (1 + TVA) / (1 - commission)
export function calculateSellingPrice(
  materialCost: number, 
  netMargin: number, 
  tvaRate: number = PRICING.TVA_FOOD
): number {
  return parseFloat(
    ((materialCost + netMargin + PRICING.PACKAGING_COST) * (1 + tvaRate) / (1 - PRICING.UBER_COMMISSION)).toFixed(2)
  );
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
                  options: { type: "array", items: { type: "string" } }
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
// ZOD SCHEMAS (VALIDATION)
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

const ModifierGroupZod = z.object({
  name: z.string(),
  min_selection: z.number(),
  max_selection: z.number(),
  options: z.array(z.string())
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

    ${flexibilityOptions?.allowNewEquipment ? "INFO INVESTISSEMENT : Tu as l'autorisation de suggérer 1 nouveau petit matériel (ex: Friteuse, Blender) si cela permet d'améliorer radicalement le concept et la carte." : "CONTRAINTE STRICTE : N'utilise QUE le matériel listé, tu ne peux rien suggérer d'autre."}

    Génère un nom percutant (ou utilise le nom imposé), un slogan (tagline), un storytelling court (2 phrases), et le style culinaire.
    Génère aussi deux prompts précis (en anglais) pour DALL-E 3 afin de créer le logo et la bannière de la boutique Uber Eats.
    Remplis "suggested_new_equipment" avec les nouveaux matériels que tu as décidé d'ajouter (ou un tableau vide si aucun).
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
    crée une carte de Plats Principaux et d'Accompagnements (Sides) en utilisant principalement ces ingrédients : ${ingredients.join(", ")}.

    RÈGLE D'IDENTITÉ DE MARQUE (LA PLUS IMPORTANTE) :
    - CHAQUE plat principal DOIT correspondre au style culinaire "${brandCore.culinary_style}".
    - Si le concept est mexicain, TOUS les plats doivent être des tacos, burritos, quesadillas, bowls mexicains, etc.
    - Si le concept est libanais, TOUS les plats doivent être des kebabs, wraps, mezze, etc.
    - Tu peux fusionner avec des techniques françaises ou modernes, mais le FORMAT et L'IDENTITÉ du plat doivent rester fidèles au concept.
    - NE CRÉE JAMAIS un plat de cuisine française classique (ex: "Pavé de saumon au beurre") en l'étiquetant "façon mexicaine". Le plat DOIT être authentiquement lié au concept.

    RÈGLES CULINAIRES (CRITIQUE) :
    - Les recettes DOIVENT être parfaitement logiques, cohérentes et délicieuses.
    - Ne crée pas d'associations absurdes (ex: pas de confiture dans un burger au poisson).
    - Tu n'es pas obligé d'utiliser TOUS les ingrédients dans chaque plat, choisis uniquement ceux qui vont bien ensemble.
    
    ${flexibilityOptions?.allowNewIngredients ? "INFO INVESTISSEMENT : Tu es autorisé à ajouter jusqu'à 3 NOUVEAUX ingrédients (qui ne sont pas dans la liste) si et seulement si cela permet d'augmenter significativement la rentabilité ou la qualité perçue des plats. Ajoute-les aux listes d'ingrédients des recettes. Tu DOIS ABSOLUMENT les lister dans le champ 'suggested_new_ingredients'." : "CONTRAINTE STRICTE : N'utilise STRICTEMENT QUE les ingrédients fournis dans la liste. Aucun ajout n'est toléré. Le champ 'suggested_new_ingredients' doit être vide."}

    RÈGLES FINANCIÈRES Uber Eats (CRITIQUE) :
    - Tu NE DOIS FOURNIR QUE le coût matière (material_cost) et la marge nette cible (net_margin_target).
    - NE CALCULE PAS et NE FOURNIS PAS le prix de vente (selling_price). C'est le backend qui le calculera avec la formule : (material_cost + net_margin_target) / 0.6.
    - FOURCHETTES DE PRIX RÉALISTES (prix final client sur Uber Eats) :
      * Plat Principal : entre 11€ et 16€ → donc net_margin_target entre 3€ et 6€
      * Accompagnement (Side) : entre 4€ et 7€ → donc net_margin_target entre 1.5€ et 3€
    - Exemple : Un plat à 4€ de coût matière avec une marge nette de 4.60€ donne un prix de vente de (4 + 4.60) / 0.6 = 14.33€. C'est le bon ordre de grandeur.
    
    RÈGLES SEO & ALLERGÈNES (NOUVEAU) :
    - Indique les 'dietary_tags' pertinents (ex: ["Halal", "Vegan", "Sans Gluten", "Végétarien"]). Un tableau vide si rien de spécial.
    - Liste tous les 'allergens' majeurs présents (ex: ["Gluten", "Lactose", "Arachides", "Œufs"]). Un tableau vide si aucun.
    - La 'description_seo' doit être très appétissante.
    - Rédige des 'prep_instructions' courtes (3 étapes max) pour la fiche technique cuisine.
  `;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "Tu es un chef cuisinier expert en rentabilité. Réponds EXCLUSIVEMENT en français." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: coreItemsSchema },
  });

  let rawData;
  try {
    rawData = JSON.parse(response.choices[0].message.content || "{}");
  } catch (e: any) {
    console.error("Erreur parsing JSON OpenAI:", e);
    throw new Error(`L'IA a renvoyé un format de menu illisible (JSON corrompu) : ${e.message}`);
  }

  let validatedData;
  try {
    validatedData = CoreItemsZod.parse(rawData);
  } catch (e: any) {
    console.error("Erreur validation Zod Menu:", e);
    throw new Error(`Le menu généré ne respecte pas les critères de qualité (Zod Error) : ${e.message}`);
  }
  
  // Calcul mathématique strict du Selling Price (formule corrigée)
  const applyPricing = (item: any) => {
    if (item.financials) {
      item.financials.selling_price = calculateSellingPrice(
        item.financials.material_cost, 
        item.financials.net_margin_target
      );
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
    Agis en tant qu'Expert Marketing Uber Eats.
    Assemble des "Menus Combos" pour la marque "${brandCore.name}".

    NE GÉNÈRE PAS d'offres spéciales ou de promotions. C'est au restaurateur de les créer lui-même.

    Éléments à assembler :
    - Plats Principaux disponibles : ${coreItems.main_dishes.map((d: any) => d.title).join(", ")}
    - Sides disponibles : ${coreItems.generated_sides.map((s: any) => s.title).join(", ")}
    - Boissons existantes : ${drinks.length ? drinks.join(", ") : "Sodas classiques"}
    - Desserts existants : ${desserts.length ? desserts.join(", ") : "Brownie, Cookie"}

    Crée 3 Menus Combos (Plat + Side + Boisson).
    
    RÈGLES DE NOMMAGE (CRITIQUE) :
    - Le titre d'un Menu Combo DOIT TOUJOURS prendre le nom de son Plat Principal (ex: "Menu Poulet Crémeux", "Menu Smash Burger"). 
    - Ne nomme JAMAIS un menu avec le nom d'un dessert ou d'un accompagnement.

    RÈGLES UBER EATS (MODIFIER GROUPS) :
    - Sur Uber Eats, un combo n'est pas un texte figé. Le client choisit ses options.
    - Pour CHAQUE combo, tu DOIS créer des 'modifier_groups' (ex: name: "Choisissez votre Boisson", options: ["Coca-Cola", "Sprite"], min_selection: 1, max_selection: 1).
    - Crée systématiquement un groupe pour l'accompagnement (side) et un groupe pour la boisson ou le dessert.

    RÈGLES FINANCIÈRES COMBOS (CRUCIAL) :
    - Le coût matière cumulé (material_cost) doit être la somme logique des composants (Plat + Side + ~0.5€ boisson).
    - La marge nette cible (net_margin_target) doit être entre 3€ et 5€ par menu.
    - Le prix de vente final sera calculé par la formule (material_cost + net_margin_target) / 0.6.
    - FOURCHETTE DE PRIX RÉALISTE pour un Menu Combo : entre 15€ et 20€. Donc ajuste tes material_cost et net_margin_target en conséquence.
    
    RÈGLES SEO & ALLERGÈNES :
    - Indique les 'dietary_tags' (ex: ["Halal", "Végétarien"]).
    - Liste les 'allergens' (ex: ["Gluten", "Lactose"]).
    - Rédige des 'prep_instructions' (ex: "1. Assembler le plat. 2. Ajouter le side. 3. Emballer.")
  `;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Tu es un expert marketing Uber Eats. Réponds EXCLUSIVEMENT en français." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: menuAssemblySchema },
  });

  const rawData = JSON.parse(response.choices[0].message.content || "{}");
  const validatedData = MenuAssemblyZod.parse(rawData);

  const applyPricing = (item: any) => {
    if (item.financials) {
      item.financials.selling_price = calculateSellingPrice(
        item.financials.material_cost, 
        item.financials.net_margin_target
      );
    }
  };

  if (validatedData.combos) validatedData.combos.forEach(applyPricing);

  return validatedData;
}

export async function analyzeInventoryImage(base64Image: string) {
  const prompt = `
    Analyse cette image de stock de cuisine ou d'inventaire.
    Extrais TOUS les ingrédients visibles et estime leurs quantités si possible.
    Retourne une liste d'objets { name: string, qty: string }.
    Si l'image contient du texte (ex: une liste manuscrite), retranscris-la fidèlement.
  `;

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          }
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "inventory_extraction",
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
                  qty: { type: "string" }
                },
                required: ["name", "qty"],
                additionalProperties: false
              }
            }
          },
          required: ["items"],
        }
      }
    }
  });

  const rawData = JSON.parse(response.choices[0].message.content || "{}");
  return z.object({
    items: z.array(z.object({ name: z.string(), qty: z.string() }))
  }).parse(rawData).items;
}

export async function generateMenuItemImage(itemTitle: string, itemDescription: string, culinaryStyle: string, visualStyle: string) {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Gourmet food photography of ${itemTitle}, ${itemDescription}. Professional studio lighting, 8k resolution, macro lens, warm bokeh background. The dish is plated on a dark ceramic plate on a dark wooden table. Style: "${visualStyle}" and "${culinaryStyle}". No text, no words, no letters anywhere in the image. Clean dark moody background with warm orange bokeh lights.`,
        model: "black-forest-labs/FLUX.1-schnell",
        width: 1024,
        height: 1024,
      }),
    });
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.dataUrl;
  } catch (error: any) {
    console.error(`Erreur photo plat ${itemTitle}:`, error);
    return null;
  }
}

export async function generateBrandImages(logoPrompt: string, backgroundPrompt: string, mainDishesContext?: string) {
  try {
    const bannerPrompt = mainDishesContext 
      ? `A breathtaking, cinematic wide landscape banner for a high-end restaurant menu featuring these dishes: ${mainDishesContext}. Professional gourmet food photography, 8k resolution, soft studio lighting. Aesthetic: ${backgroundPrompt}`
      : `A breathtaking, cinematic wide landscape banner for a high-end restaurant menu. Professional gourmet food photography, 8k resolution. Aesthetic: ${backgroundPrompt}`;

    const [logoRes, bgRes] = await Promise.all([
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `A professional minimalist vector logo icon for a premium food brand. Flat design, solid black background. ULTRA-HIGH QUALITY TYPOGRAPHY AND SYMBOL. CRITICAL: The brand name text MUST be fully visible and readable. Do NOT place any graphic element overlapping or hiding any letter of the brand name. All text must be clearly separated from the central icon. Aesthetic: ${logoPrompt}`,
          model: "black-forest-labs/FLUX.1-schnell",
          width: 1024,
          height: 1024,
        }),
      }).then(r => r.json()),
      fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: bannerPrompt,
          model: "black-forest-labs/FLUX.1-schnell",
          width: 1024,
          height: 768,
        }),
      }).then(r => r.json())
    ]);

    if (!logoRes.success || !bgRes.success) {
      throw new Error("Échec d'une des générations d'image de marque.");
    }

    return {
      logoUrl: logoRes.dataUrl,
      backgroundUrl: bgRes.dataUrl
    };
  } catch (error) {
    console.error("Erreur génération image FLUX (via API):", error);
    return {
      logoUrl: null,
      backgroundUrl: null
    };
  }
}
