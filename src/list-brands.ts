import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function list() {
  const { data: brands } = await supabase.from('brands').select('id, name');
  console.log("Brands in DB:");
  brands?.forEach(b => console.log(`- ${b.name} (${b.id})`));
}

list();
