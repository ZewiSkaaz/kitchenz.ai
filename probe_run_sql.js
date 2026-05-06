const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeRunSql() {
  console.log("🔍 Probing 'run_sql' with different parameters...");
  
  const params = [
    { sql_query: 'SELECT 1' },
    { sql: 'SELECT 1' },
    { query: 'SELECT 1' },
    { query_text: 'SELECT 1' },
    { command: 'SELECT 1' }
  ];
  
  for (const p of params) {
    try {
      const { data, error } = await supabase.rpc('run_sql', p);
      if (error && error.message.includes('not found')) {
        console.log(`❌ Param ${JSON.stringify(p)}: run_sql not found`);
      } else {
        console.log(`✅ Param ${JSON.stringify(p)}: Found or different error:`, error ? error.message : 'Success!');
      }
    } catch (e) {
      console.log(`❌ Param ${JSON.stringify(p)}: Error`, e.message);
    }
  }
}

probeRunSql();
