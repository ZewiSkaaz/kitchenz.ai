import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc"
);

async function check() {
  console.log("Checking user_integrations with Service Role...");
  const { data, error } = await supabase.from('user_integrations').select('*');
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log(`Found ${data.length} integrations:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
