import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function check() {
  const { data, error } = await supabase.from('user_integrations').select('*');
  if (error) console.error(error);
  console.log('Integrations found:', data?.length || 0);
  console.log(data);
}

check();
