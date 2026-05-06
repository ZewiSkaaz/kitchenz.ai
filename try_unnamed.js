const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function tryUnnamedParam() {
  console.log("🔍 Trying run_sql with unnamed parameter...");
  
  const query = `SELECT 1`;

  try {
    const { data, error } = await supabase.rpc('run_sql', query);
    if (error) {
      console.log("❌ Error:", error.message);
    } else {
      console.log("✅ Success!", data);
    }
  } catch (e) {
    console.log("❌ Error:", e.message);
  }
}

tryUnnamedParam();
