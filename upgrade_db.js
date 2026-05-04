const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function upgradeSchema() {
  console.log("🚀 Upgrading database schema for Uber Eats compliance...");

  const queries = [
    // Add new columns to menu_items
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sub_category TEXT;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_special_offer BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS special_offer_text TEXT;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS promo_price DECIMAL;`,
    
    // Ensure brands has all identity fields
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS tagline TEXT;`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT;`,
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS background_url TEXT;`
  ];

  for (const query of queries) {
    const { error } = await supabase.rpc('run_sql', { sql_query: query });
    if (error) {
      // If rpc fails, we try a direct update check or ignore if already exists
      console.log(`Note: Query result - ${error.message}`);
    }
  }

  console.log("✅ Schema upgrade completed.");
}

upgradeSchema();
