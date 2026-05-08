import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchLatestAudit() {
  const { data: brands, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (brandError || !brands || brands.length === 0) {
    console.log('No brands found');
    return;
  }

  const brand = brands[0];
  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('brand_id', brand.id);

  console.log(JSON.stringify({ brand, items }, null, 2));
}

fetchLatestAudit();
