const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';

async function callRunSqlManually() {
  console.log("🚀 Calling run_sql manually via axios...");
  
  const query = `
    ALTER TABLE menu_items 
    ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 10,
    ADD COLUMN IF NOT EXISTS sub_category TEXT,
    ADD COLUMN IF NOT EXISTS is_special_offer BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS special_offer_text TEXT,
    ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS description TEXT;
  `;

  try {
    const response = await axios.post(
      `${supabaseUrl}/rest/v1/rpc/run_sql`,
      { sql: query },
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ Success!", response.data);
  } catch (error) {
    if (error.response) {
      console.log("❌ Error:", error.response.status, error.response.data);
    } else {
      console.log("❌ Error:", error.message);
    }
  }
}

callRunSqlManually();
