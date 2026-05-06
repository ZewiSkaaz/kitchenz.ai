const axios = require('axios');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';

async function runSql(query) {
  try {
    const response = await axios.post(`${supabaseUrl}/rest/v1/rpc/run_sql`, {
      sql_query: query
    }, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Success: ${query}`);
  } catch (error) {
    console.error(`❌ Error for ${query}: ${error.response ? error.response.data.message : error.message}`);
  }
}

async function upgrade() {
  const queries = [
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 10;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sub_category TEXT;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_special_offer BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS special_offer_text TEXT;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;`,
    `ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description TEXT;`
  ];

  for (const q of queries) {
    await runSql(q);
  }
}

upgrade();
