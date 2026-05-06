const { Client } = require('pg');

async function run() {
  const connectionStrings = [
    "postgresql://postgres.yzoavohpsrlbkqqxcwxj:KitchenzAI2026!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres:KitchenzAI2026!@db.yzoavohpsrlbkqqxcwxj.supabase.co:5432/postgres"
  ];

  for (const connectionString of connectionStrings) {
    console.log(`Trying connection string: ${connectionString.replace(/KitchenzAI2026!/, '****')}`);
    const client = new Client({ connectionString });
    try {
      await client.connect();
      console.log("✅ Connected to DB successfully!");
      const query = `
        ALTER TABLE menu_items 
        ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 10, 
        ADD COLUMN IF NOT EXISTS sub_category TEXT, 
        ADD COLUMN IF NOT EXISTS is_special_offer BOOLEAN DEFAULT FALSE, 
        ADD COLUMN IF NOT EXISTS special_offer_text TEXT, 
        ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb, 
        ADD COLUMN IF NOT EXISTS description TEXT;
      `;
      await client.query(query);
      console.log("✅ Query executed successfully! The columns have been added.");
      await client.end();
      return; // Exit if successful
    } catch (err) {
      console.error("❌ Connection or query error:", err.message);
      await client.end();
    }
  }
  console.log("All connection attempts failed.");
}

run();
