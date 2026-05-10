"use server";

import { askAI, AuditResult, AuditResultSchema } from "@/lib/ai";

/**
 * ⚡ ACTION UNIQUE D'AUDIT
 * Génère tout le concept en un seul appel.
 */
export async function performCompleteAuditAction(
  ingredients: string[],
  equipment: string[],
  userConcept?: string,
  userBrandName?: string,
  location?: string
): Promise<AuditResult | null> {
  const prompt = `
  Crée un concept complet de Dark Kitchen basé sur :
  - Ingrédients dispos : ${ingredients.join(", ")}
  - Matériel dispo : ${equipment.join(", ")}
  - Idée utilisateur : ${userConcept || "Laisse libre cours à ton imagination"}
  - Ville : ${location || "France"}
  - Nom souhaité : ${userBrandName || "Inconnu (propose-en un)"}

  Réponds avec un JSON suivant STRICTEMENT ce schéma :
  {
    "brand": { "name": "", "tagline": "", "storytelling": "", "logo_prompt": "", "background_prompt": "", "culinary_style": "" },
    "menu_items": [
      { "title": "", "description_seo": "", "ingredients": [], "category": "Plat Principal", "financials": { "material_cost": 3.5, "net_margin_target": 8 } }
    ],
    "combos": [
      { "title": "Menu Best-Seller", "description_seo": "", "items": ["Nom du plat", "Boisson"], "financials": { "material_cost": 5, "net_margin_target": 12 } }
    ]
  }
  Génère au moins 6 plats principaux et 3 menus combos.
  `;

  const data = await askAI(prompt, "Tu es un consultant expert en marketing Uber Eats et en gastronomie digitale.");
  
  if (!data) return null;

  const result = AuditResultSchema.safeParse(data);
  if (!result.success) {
    console.error("❌ Schema mismatch:", result.error);
    return data as any; // On renvoie quand même les données si le parsing échoue partiellement
  }

  return result.data;
}
