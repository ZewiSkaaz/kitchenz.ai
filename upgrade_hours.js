const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function upgradeBusinessHours() {
  console.log("🚀 Upgrading database for Business Hours (Uber Eats Compliance)...");

  const queries = [
    `ALTER TABLE brands ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '[{"day": 0, "startTime": "08:00", "endTime": "22:00"}, {"day": 1, "startTime": "08:00", "endTime": "22:00"}, {"day": 2, "startTime": "08:00", "endTime": "22:00"}, {"day": 3, "startTime": "08:00", "endTime": "22:00"}, {"day": 4, "startTime": "08:00", "endTime": "22:00"}, {"day": 5, "startTime": "08:00", "endTime": "22:00"}, {"day": 6, "startTime": "08:00", "endTime": "22:00"}]';`
  ];

  for (const query of queries) {
    await supabase.rpc('run_sql', { sql_query: query });
  }

  console.log("✅ Business Hours upgrade completed.");
}

upgradeBusinessHours();
