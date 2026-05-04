const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBrandsBucket() {
  console.log("🚀 Initialisation du Bucket 'brands'...");

  const { data, error } = await supabase.storage.createBucket('brands', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log("ℹ️ Le bucket 'brands' est déjà prêt.");
    } else {
      console.error("❌ Erreur Supabase Storage:", error.message);
    }
  } else {
    console.log("✅ Bucket 'brands' créé avec succès !");
  }
}

setupBrandsBucket();
