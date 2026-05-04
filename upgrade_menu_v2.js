const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function upgradeMenuSchema() {
  console.log("🚀 Upgrading menu schema for advanced Uber Eats features...");

  const queries = [
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]';`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS vat_rate DECIMAL DEFAULT 10;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS dietary_labels TEXT[] DEFAULT '{}';`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS internal_code TEXT;`
  ];

  for (const query of queries) {
    await supabase.rpc('run_sql', { sql_query: query });
  }

  console.log("✅ Advanced Menu Schema upgrade completed.");
}

upgradeMenuSchema();
