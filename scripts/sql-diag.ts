import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc"
);

async function check() {
  console.log("Checking DB via SQL...");
  
  const res1 = await supabase.rpc('run_sql', { sql_query: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';" });
  if (res1.error) console.error("Error Tables:", res1.error);
  else console.log("Tables:", res1.data);

  const res2 = await supabase.rpc('run_sql', { sql_query: "SELECT * FROM user_integrations;" });
  if (res2.error) console.error("Error Integrations:", res2.error);
  else console.log("Integrations Content:", res2.data);
}

check();
