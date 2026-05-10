import { z } from "zod";

/**
 * 🚀 KITCHENZ AI ENGINE - 100% FREE & SIMPLE
 * Utilise Pollinations.ai pour le texte et les images.
 */

// 1. Schéma de réponse unique pour l'IA
export const AuditResultSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
    storytelling: z.string(),
    logo_prompt: z.string(),
    background_prompt: z.string(),
    culinary_style: z.string(),
  }),
  menu_items: z.array(z.object({
    title: z.string(),
    description_seo: z.string(),
    ingredients: z.array(z.string()),
    category: z.string(),
    financials: z.object({
      material_cost: z.number(),
      net_margin_target: z.number(),
    })
  })),
  combos: z.array(z.object({
    title: z.string(),
    description_seo: z.string(),
    items: z.array(z.string()),
    financials: z.object({
      material_cost: z.number(),
      net_margin_target: z.number(),
    })
  }))
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

/**
 * 📝 APPEL IA TEXTE (POLLINATIONS)
 */
export async function askAI(prompt: string, systemPrompt: string = "Tu es un expert en dark kitchen."): Promise<any> {
  try {
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt + " Réponds EXCLUSIVEMENT en JSON valide." },
          { role: "user", content: prompt }
        ],
        model: "openai" // Pollinations redirige vers un modèle performant
      })
    });
    
    const text = await response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error("❌ AI Error:", error);
    return null;
  }
}

/**
 * 🖼️ GENERATEUR D'URL D'IMAGE
 */
export function getImageUrl(title: string, context: string, type: "logo" | "dish" | "bg", seed?: number): string {
  const s = seed || Math.floor(Math.random() * 1000000);
  let prompt = "";
  
  if (type === "logo") prompt = `Minimalist restaurant logo for "${title}". ${context}. Flat vector, solid background.`;
  else if (type === "bg") prompt = `Cinematic restaurant background for "${title}". ${context}. High res, food photography.`;
  else prompt = `Professional food photography, ${title}. ${context}. Styled plate, natural light.`;

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${s}&model=flux`;
}

/**
 * 💰 CALCUL PRIX DE VENTE
 */
export function calculatePrice(materialCost: number, margin: number): number {
  // Simple formula: Cost + Margin + Fees (Uber 30% + Stripe 2%) + TVA 10%
  const fees = 0.32;
  const tva = 1.10;
  const raw = (materialCost + margin) * tva / (1 - fees);
  return Math.ceil(raw / 1.1) * 1.1 - 0.1; // Prix psychologique (ex: 12.90)
}
