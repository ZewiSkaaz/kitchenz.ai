import { Brand, MenuItem } from "@/types";

const UBER_API_BASE = "https://test-api.uber.com/v1";
const UBER_AUTH_BASE = "https://sandbox-login.uber.com/oauth/v2";

export class UberService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.UBER_CLIENT_ID || "";
    this.clientSecret = process.env.UBER_CLIENT_SECRET || "";
    this.redirectUri = process.env.UBER_REDIRECT_URI || "https://kitchenz-ai.onrender.com/api/auth/uber/callback";
  }

  async getClientCredentialsToken(scopes: string) {
    const formData = new FormData();
    formData.append('client_id', this.clientId);
    formData.append('client_secret', this.clientSecret);
    formData.append('grant_type', 'client_credentials');
    formData.append('scope', scopes);

    const response = await axios.post(
      `${UBER_AUTH_BASE}/token`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  /**
   * Moteur de formatage expert conforme à l'API Menu v2 d'Uber Eats
   * MASTER V2.2 - Security & Precision focus
   */
  formatMenuForUber(brand: Brand, menuItems: MenuItem[]) {
    const uberItems: any[] = [];
    const uberModifierGroups: any[] = [];

    // 1. Traitement des articles
    menuItems.forEach((item: MenuItem) => {
      uberItems.push({
        id: `item_${item.id}`,
        title: { translations: { fr: item.title } },
        description: { translations: { fr: item.description_seo || "" } },
        image_url: item.image_url || null,
        price_info: {
          price: Math.round(item.selling_price * 100), // Uber attend des centimes
          currency_code: "EUR"
        },
        tax_info: {
          tax_rate: (item.category === "Boisson" && item.allergens?.includes("Alcool")) ? 20.0 : 10.0
        }
      });
    });

    // 2. Structuration des catégories
    const categories = Array.from(new Set(menuItems.map((i: any) => i.category)));
    const uberCategories = categories.map(catName => ({
      id: `cat_${catName.toString().toLowerCase().replace(/\s+/g, '_')}`,
      title: { translations: { fr: catName } },
      entities: menuItems
        .filter(i => i.category === catName)
        .map(i => ({
          id: `item_${i.id}`,
          type: "ITEM"
        }))
    }));

    // 3. Mapping Robuste des Horaires (Master Audit #5 Fix)
    const uberDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    const finalAvailability = (brand.business_hours || []).map((h: any, idx: number) => ({
      day_of_week: uberDays[idx] || "MONDAY",
      time_periods: [{
        start_time: h.startTime || "08:00",
        end_time: h.endTime || "22:00"
      }]
    }));

    return {
      menus: [
        {
          id: "main_menu",
          title: { translations: { fr: `Menu ${brand.name}` } },
          service_availability: finalAvailability.length > 0 ? finalAvailability : undefined,
          category_ids: uberCategories.map(c => c.id)
        }
      ],
      categories: uberCategories,
      items: uberItems,
      modifier_groups: uberModifierGroups
    };
  }

  async uploadMenu(storeId: string, accessToken: string, menuData: any) {
    const response = await axios.put(
      `${UBER_API_BASE}/eats/stores/${storeId}/menus`,
      menuData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  }
}

export const uberService = new UberService();
