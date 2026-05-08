import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data: brand } = await supabase.from('brands').select('id, name').eq('name', 'The Italian Smash').single();
  if (!brand) {
    console.log("Brand not found");
    return;
  }
  console.log(`Checking brand: ${brand.name} (${brand.id})`);
  
  const { data: items } = await supabase.from('menu_items').select('id, title, image_url').eq('brand_id', brand.id);
  
  items?.forEach(item => {
    const isSalad = item.image_url?.includes('unsplash') || !item.image_url;
    console.log(`- ${item.title}: ${isSalad ? '🚨 SALAD/MISSING' : '✅ OK'} (${item.image_url || 'empty'})`);
  });
}

check();
