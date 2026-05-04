const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function patchBrandTable() {
  console.log("🛠️ Adding uber_store_id column to brands table...");
  
  const query = `ALTER TABLE brands ADD COLUMN IF NOT EXISTS uber_store_id TEXT;`;
  
  try {
    await supabase.rpc('run_sql', { sql_query: query });
    console.log("✅ Column uber_store_id added successfully.");
  } catch (e) {
    console.error("❌ Failed to add column:", e.message);
  }
}

patchBrandTable();
