const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listRPCs() {
  console.log("🔍 Listing available RPC functions...");
  
  // We can't query pg_proc directly via supabase-js easily if run_sql is missing.
  // But we can try to call common names.
  
  const names = ['exec_sql', 'execute_sql', 'sql', 'query', 'run_query'];
  
  for (const name of names) {
    try {
      const { error } = await supabase.rpc(name, { sql: 'SELECT 1' });
      if (error && error.message.includes('not found')) {
        console.log(`❌ ${name}: Not found`);
      } else {
        console.log(`✅ ${name}: Found or different error:`, error ? error.message : 'Success!');
      }
    } catch (e) {
      console.log(`❌ ${name}: Error`, e.message);
    }
  }
}

listRPCs();
