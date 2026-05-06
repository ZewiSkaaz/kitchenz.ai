import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function cleanup() {
  const { data: brands } = await supabase.from('brands').select('id, name').eq('name', 'The Italian Smash');
  
  console.log(`Deleting ${brands?.length} messy versions of The Italian Smash...`);
  
  for (const b of brands || []) {
    // Note: This might fail if RLS is on and we don't have service role, but let's try.
    const { error } = await supabase.from('brands').delete().eq('id', b.id);
    if (error) {
      console.log(`- Failed to delete ${b.id}: ${error.message}`);
    } else {
      console.log(`- Deleted ${b.id}`);
    }
  }
}

cleanup();
