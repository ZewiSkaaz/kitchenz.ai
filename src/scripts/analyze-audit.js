const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeLatestAudit() {
  console.log("🔍 Fetching latest audit results...");

  // 1. Get the latest brand
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (brandError) {
    console.error("Error fetching brand:", brandError);
    return;
  }

  console.log("\n--- BRAND IDENTITY ---");
  console.log(`Name: ${brand.name}`);
  console.log(`Tagline: ${brand.tagline}`);
  console.log(`Culinary Style: ${brand.culinary_style}`);
  console.log(`Storytelling: ${brand.storytelling}`);
  console.log(`Logo URL: ${brand.logo_url}`);
  console.log(`Background URL: ${brand.background_url}`);

  // 2. Get menu items for this brand
  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('brand_id', brand.id);

  if (itemsError) {
    console.error("Error fetching items:", itemsError);
    return;
  }

  console.log("\n--- MENU ITEMS & COHERENCE ---");
  items.forEach((item, index) => {
    console.log(`\n[${index + 1}] ${item.title} (${item.category})`);
    console.log(`   Price: ${item.selling_price}€ (Margin: ${item.net_margin_target}€)`);
    console.log(`   Description: ${item.description_seo}`);
    console.log(`   Ingredients used: ${item.ingredients.join(', ')}`);
  });

  console.log("\n--- ANALYSIS SUMMARY ---");
  console.log("Coherence check: Does the banner reflect the items?");
  console.log("Visual quality check: Are the logo and banner sharp?");
  console.log("Workflow check: Did the items get photos? (Checking field...)");
  
  // Note: Check if imageUrl exists in the database schema
  // Based on AuditPage.tsx, it seems imageUrl is NOT saved in the database yet!
  // It's only in the local state 'fullMenu'. 
  // Wait, I should check if I added it to the table schema.
}

analyzeLatestAudit();
