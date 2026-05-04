import axios from "axios";

const UBER_API_BASE = "https://test-api.uber.com/v1";
const UBER_AUTH_BASE = "https://sandbox-login.uber.com/oauth/v2";

export class UberService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.UBER_CLIENT_ID || "ba9x6wqY0-IW4kjpjmyg4gYl8IhLQkxo";
    this.clientSecret = process.env.UBER_CLIENT_SECRET || "G5ZpMkqegSDQxURLZKGJCdpauipv9YP-wSgQlyJf";
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
   */
  formatMenuForUber(brand: any, menuItems: any[]) {
    const uberItems: any[] = [];
    const uberModifierGroups: any[] = [];
    const uberDisplayOptions: any[] = [];

    // 1. Traitement des articles et de leurs modificateurs
    menuItems.forEach((item: any) => {
      const itemModifierGroupIds: string[] = [];

      // Traitement des groupes d'options (ex: Cuissons, Suppléments)
      if (item.options && Array.isArray(item.options)) {
        item.options.forEach((group: any, gIdx: number) => {
          const groupId = `mg_${item.id}_${gIdx}`;
          
          const modifierInfos = group.modifiers.map((mod: any, mIdx: number) => {
            const modId = `mod_${item.id}_${gIdx}_${mIdx}`;
            
            // Un modificateur est techniquement un ITEM dans l'API Uber
            uberItems.push({
              id: modId,
              title: { translations: { fr: mod.name } },
              price_info: {
                price: Math.round(mod.price * 100),
                currency_code: "EUR"
              }
            });

            return {
              id: modId,
              type: "ITEM"
            };
          });

          uberModifierGroups.push({
            id: groupId,
            title: { translations: { fr: group.name } },
            quantity_info: {
              min_permitted: group.min || 0,
              max_permitted: group.max || 1
            },
            modifier_entities: modifierInfos
          });

          itemModifierGroupIds.push(groupId);
        });
      }

      // L'article principal
      uberItems.push({
        id: `item_${item.id}`,
        title: { translations: { fr: item.title } },
        description: { translations: { fr: item.description || "" } },
        image_url: item.image_url || null,
        price_info: {
          price: Math.round(item.selling_price * 100),
          currency_code: "EUR"
        },
        tax_info: {
          tax_rate: item.vat_rate || 10
        },
        modifier_group_ids: itemModifierGroupIds.length > 0 ? itemModifierGroupIds : undefined
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

    // 3. Mapping des horaires d'ouverture (Open Hours)
    const dayMap: Record<number, string> = {
      0: "MONDAY", 1: "TUESDAY", 2: "WEDNESDAY", 3: "THURSDAY",
      4: "FRIDAY", 5: "SATURDAY", 6: "SUNDAY"
    };

    const serviceAvailability = (brand.business_hours || []).map((h: any) => ({
      day_of_week: dayMap[h.day] || "MONDAY",
      time_periods: [{
        start_time: h.startTime || "08:00",
        end_time: h.endTime || "22:00"
      }]
    }));

    // Si pas d'horaires, on met un fallback 24/7 (sécurité)
    const finalAvailability = serviceAvailability.length > 0 ? serviceAvailability : [
      { day_of_week: "MONDAY", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
      { day_of_week: "TUESDAY", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
      { day_of_week: "WEDNESDAY", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
      { day_of_week: "THURSDAY", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
      { day_of_week: "FRIDAY", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
      { day_of_week: "SATURDAY", time_periods: [{ start_time: "00:00", end_time: "23:59" }] },
      { day_of_week: "SUNDAY", time_periods: [{ start_time: "00:00", end_time: "23:59" }] }
    ];

    return {
      menus: [
        {
          id: "main_menu",
          title: { translations: { fr: "Menu Kitchenz" } },
          service_availability: finalAvailability,
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
