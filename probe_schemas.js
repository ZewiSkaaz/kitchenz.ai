const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeSchemas() {
  console.log("🔍 Probing different schemas for 'run_sql'...");
  
  const schemas = ['public', 'extensions', 'auth', 'storage', 'graphql_public'];
  const names = ['run_sql', 'exec_sql', 'execute_sql'];
  
  for (const s of schemas) {
    for (const n of names) {
      const fullName = `${s}.${n}`;
      try {
        const { error } = await supabase.rpc(fullName, { sql: 'SELECT 1' });
        if (error && error.message.includes('not found')) {
          // Try without schema prefix but maybe it's implicitly there?
          // supabase-js usually looks in public.
        } else {
          console.log(`✅ Found something at ${fullName}:`, error ? error.message : 'Success!');
          if (!error) return; // Found it!
        }
      } catch (e) {
        // console.log(`❌ ${fullName}: Error`, e.message);
      }
    }
  }
}

probeSchemas();
