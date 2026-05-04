import axios from "axios";

const UBER_API_BASE = "https://api.uber.com/v1";
const UBER_AUTH_BASE = "https://login.uber.com/oauth/v2";

export class UberService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.UBER_CLIENT_ID || "ba9x6wqY0-IW4kjpjmyg4gYl8IhLQkxo";
    this.clientSecret = process.env.UBER_CLIENT_SECRET || "G5ZpMkqegSDQxURLZKGJCdpauipv9YP-wSgQlyJf";
    this.redirectUri = process.env.UBER_REDIRECT_URI || "https://kitchenz-ai.onrender.com/api/auth/uber/callback";
  }

  getAuthUrl() {
    const scopes = "eats.store eats.menu eats.order";
    return `${UBER_AUTH_BASE}/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  }

  async getAccessToken(code: string) {
    const response = await axios.post(`${UBER_AUTH_BASE}/token`, null, {
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
        code,
      },
    });
    return response.data;
  }

  async refreshToken(refreshToken: string) {
    const response = await axios.post(`${UBER_AUTH_BASE}/token`, null, {
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
    });
    return response.data;
  }

  /**
   * Convertit un menu Kitchenz.ai au format Uber Eats Menu API v2
   */
  formatMenuForUber(brand: any, menuItems: any[]) {
    // Uber Eats Menu Structure: Menus -> Categories -> Items
    const categories = Array.from(new Set(menuItems.map((i: any) => i.category)));
    
    const uberItems = menuItems.map((item: any) => ({
      id: `item_${item.id || Math.random().toString(36).substr(2, 9)}`,
      title: { translations: { fr: item.title } },
      description: { translations: { fr: item.description_seo || "" } },
      image_url: item.image_url || null,
      price_info: {
        price: Math.round(item.selling_price * 100), // Uber expects cents
        currency_code: "EUR"
      }
    }));

    const uberCategories = categories.map(cat => ({
      id: `cat_${cat.toString().toLowerCase().replace(/\s+/g, '_')}`,
      title: { translations: { fr: cat } },
      entities: menuItems
        .filter(i => i.category === cat)
        .map(i => ({
          id: `item_${i.id || ""}`,
          type: "ITEM"
        }))
    }));

    return {
      menus: [
        {
          id: "main_menu",
          title: { translations: { fr: "Menu Principal" } },
          service_availability: [
            {
              day_of_week: "MONDAY",
              time_periods: [{ start_time: "00:00", end_time: "23:59" }]
            }
            // ... apply for all days
          ],
          category_ids: uberCategories.map(c => c.id)
        }
      ],
      categories: uberCategories,
      items: uberItems
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

  async getStores(accessToken: string) {
    const response = await axios.get(`${UBER_API_BASE}/eats/stores`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }
}

export const uberService = new UberService();
