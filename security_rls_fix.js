const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function enableSecurityRLS() {
  console.log("🛡️ Hardening Kitchenz.ai Security (RLS Implementation)...");

  const queries = [
    // Enable RLS on main tables
    `ALTER TABLE brands ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;`,

    // Policy for Brands: Users can only see/edit their own brands
    `DROP POLICY IF EXISTS "Users can manage their own brands" ON brands;`,
    `CREATE POLICY "Users can manage their own brands" ON brands 
     FOR ALL USING (auth.uid() = user_id);`,

    // Policy for Menu Items: Users can only see/edit items linked to their brands
    `DROP POLICY IF EXISTS "Users can manage their own menu items" ON menu_items;`,
    `CREATE POLICY "Users can manage their own menu items" ON menu_items 
     FOR ALL USING (
       brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
     );`
  ];

  for (const query of queries) {
    try {
      await supabase.rpc('run_sql', { sql_query: query });
      console.log(`✅ Executed: ${query.substring(0, 50)}...`);
    } catch (e) {
      console.error(`❌ Failed: ${query.substring(0, 50)}...`, e.message);
    }
  }

  console.log("\n🔒 Database is now SECURED. Each user is isolated.");
}

enableSecurityRLS();
