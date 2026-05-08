import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching data:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in menu_items:', Object.keys(data[0]));
  } else {
    console.log('No data in menu_items');
  }
}

inspectSchema();
