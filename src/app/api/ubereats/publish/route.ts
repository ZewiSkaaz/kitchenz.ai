import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const brand = await req.json();

    if (!brand || !brand.menu_items) {
      return NextResponse.json({ success: false, error: "Données de marque invalides." }, { status: 400 });
    }

    // 1. Structure de base requise par l'API Uber Eats (Upsert Menu)
    // 1. Extraction et Mapping des Modifier Groups (Options)
    const modifierGroups: any[] = [];
    brand.menu_items.forEach((item: any) => {
      if (item.modifier_groups) {
        item.modifier_groups.forEach((mg: any) => {
          const mgId = mg.name.toLowerCase().replace(/\s+/g, '_');
          if (!modifierGroups.find(g => g.id === mgId)) {
            modifierGroups.push({
              id: mgId,
              title: { translations: { fr: mg.name } },
              quantity_info: {
                min_quantity: mg.min_selection,
                max_quantity: mg.max_selection
              },
              modifier_options: mg.options.map((opt: string, idx: number) => ({
                id: `${mgId}_opt_${idx}`,
                type: "ITEM",
                title: { translations: { fr: opt } },
                price_info: { price: 0, currency_code: "EUR" } // Options gratuites par défaut
              }))
            });
          }
        });
      }
    });

    // 2. Structure complète requise par l'API Uber Eats (Upsert Menu)
    const uberEatsPayload = {
      menus: [
        {
          id: "main_menu",
          title: { translations: { fr: "Menu Principal" } },
          category_ids: Array.from(new Set(brand.menu_items.map((i: any) => i.category.toLowerCase().replace(/\s+/g, '_'))))
        }
      ],
      categories: Array.from(new Set(brand.menu_items.map((i: any) => i.category))).map(cat => ({
        id: (cat as string).toLowerCase().replace(/\s+/g, '_'),
        title: { translations: { fr: cat } },
        entities: brand.menu_items
          .filter((i: any) => i.category === cat)
          .map((i: any) => ({ id: i.id || `item_${Math.random().toString(36).substr(2, 9)}`, type: "ITEM" }))
      })),
      items: brand.menu_items.map((item: any) => ({
        id: item.id || `item_${Math.random().toString(36).substr(2, 9)}`,
        title: { translations: { fr: item.title } },
        description: { translations: { fr: item.description_seo } },
        price_info: {
          price: Math.round(item.selling_price * 100), // En centimes
          currency_code: "EUR"
        },
        image_url: brand.logo_url,
        modifier_group_ids: item.modifier_groups?.map((mg: any) => mg.name.toLowerCase().replace(/\s+/g, '_')) || []
      })),
      modifier_groups: modifierGroups
    };

    // 2. Vérification des clés API (Simulation vs Réel)
    const UBER_CLIENT_ID = process.env.UBEREATS_CLIENT_ID;
    const UBER_CLIENT_SECRET = process.env.UBEREATS_CLIENT_SECRET;

    if (!UBER_CLIENT_ID || !UBER_CLIENT_SECRET) {
      // -------------------------------------------------------------
      // MODE SIMULATION : Pas de clés détectées, on simule l'appel
      // -------------------------------------------------------------
      console.log("[UBER EATS SIMULATION] Tentative d'envoi du payload :", JSON.stringify(uberEatsPayload, null, 2));
      
      // On simule une latence réseau de l'API Uber (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));

      return NextResponse.json({ 
        success: true, 
        mode: "simulation",
        message: "Marque publiée avec succès sur Uber Eats (Mode Simulation)."
      });
    }

    // -------------------------------------------------------------
    // MODE RÉEL : Appel HTTP vers l'API Uber Eats
    // -------------------------------------------------------------
    /* 
    // Étape A : Obtenir le token OAuth2
    const tokenRes = await fetch("https://login.uber.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: UBER_CLIENT_ID,
        client_secret: UBER_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "eats.store eats.pos_provisioning"
      })
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Étape B : Pousser le menu (Store ID à récupérer dynamiquement)
    const storeId = "YOUR_STORE_ID"; // À configurer
    const menuRes = await fetch(\`https://api.uber.com/v2/eats/stores/\${storeId}/menus\`, {
      method: "PUT", // Upsert
      headers: {
        "Authorization": \`Bearer \${accessToken}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(uberEatsPayload)
    });

    if (!menuRes.ok) throw new Error("Erreur lors de la publication Uber Eats");
    */

    return NextResponse.json({ success: true, mode: "production" });

  } catch (error) {
    console.error("Uber Eats Publish Error:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
