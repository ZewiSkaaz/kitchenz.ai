import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function inspect() {
  const { data: brands } = await supabase.from('brands').select('id, name, created_at').eq('name', 'The Italian Smash').order('created_at', { ascending: false });
  
  console.log(`Found ${brands?.length} versions of The Italian Smash:`);
  
  for (const b of brands || []) {
    const { count } = await supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('brand_id', b.id);
    const { data: items } = await supabase.from('menu_items').select('image_url').eq('brand_id', b.id);
    const missingImages = items?.filter(i => !i.image_url || i.image_url.includes('unsplash')).length;
    
    console.log(`- ID: ${b.id} | Created: ${b.created_at} | Items: ${count} | Messy Images: ${missingImages}`);
  }
}

inspect();
