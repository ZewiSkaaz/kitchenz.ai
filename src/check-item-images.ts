import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, title, image_url')
    .eq('brand_id', '20ede543-4847-4b4e-b455-df209fd727c1');

  if (error) {
    console.error('Error fetching items:', error);
  } else {
    console.log('Items images:', JSON.stringify(items, null, 2));
  }
}

checkImages();
