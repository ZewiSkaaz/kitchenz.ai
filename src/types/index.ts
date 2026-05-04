export interface Brand {
  id: string;
  user_id: string;
  name: string;
  tagline: string;
  culinary_style: string;
  storytelling: string;
  logo_url: string;
  background_url: string;
  ingredients: string[];
  equipment: string[];
  prep_time_avg: number;
  business_hours: BusinessHour[];
  created_at: string;
  menu_items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  brand_id: string;
  title: string;
  description_seo: string;
  ingredients: string[];
  material_cost: number;
  net_margin_target: number;
  selling_price: number;
  vat_rate: number;
  category: string;
  sub_category?: string;
  image_url: string;
  is_available: boolean;
  options?: any[]; // Optionnel pour le moment
}

export interface BusinessHour {
  day: number; // 0 = Lundi, 6 = Dimanche
  startTime: string;
  endTime: string;
}

export interface UberToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  store_id: string;
}
