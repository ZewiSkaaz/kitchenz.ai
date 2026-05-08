import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc"
);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // Si l'RPC n'existe pas, on essaie une requête brute
    const { data: tables, error: err } = await supabase.from('pg_catalog.pg_tables').select('tablename').eq('schemaname', 'public');
    console.log("Tables found:", tables?.map(t => t.tablename));
  } else {
    console.log("Tables:", data);
  }
}

listTables();
