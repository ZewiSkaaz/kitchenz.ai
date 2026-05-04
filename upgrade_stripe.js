const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function upgradeStripe() {
  console.log("🚀 Mise à jour du schéma pour Stripe...");

  const queries = [
    // Création de la table profiles si elle n'existe pas
    `CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      updated_at TIMESTAMP WITH TIME ZONE,
      full_name TEXT,
      avatar_url TEXT,
      plan TEXT DEFAULT 'Gratuit',
      customer_id TEXT,
      subscription_id TEXT
    );`,
    
    // Activation de RLS sur profiles
    `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
    
    // Ajout des colonnes au cas où la table existe déjà
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'Gratuit';`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS customer_id TEXT;`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;`
  ];

  for (const query of queries) {
    const { error } = await supabase.rpc('run_sql', { sql_query: query });
    if (error) {
      console.log(`ℹ️ Info: ${error.message}`);
    }
  }

  console.log("✅ Profils Stripe prêts !");
}

upgradeStripe();
