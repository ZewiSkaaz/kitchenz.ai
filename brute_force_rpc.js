const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzoavohpsrlbkqqxcwxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2F2b2hwc3JsYmtxcXhjd3hqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyMzc1MywiZXhwIjoyMDkzMDk5NzUzfQ.-o8ahp01ult1q0MNOVNKYRGl4zm9JVM4_XZDmYU2rIc';

async function bruteForceRPC() {
  console.log("🔍 Brute-forcing RPC functions and parameters...");
  
  const names = ['run_sql', 'exec_sql', 'execute_sql', 'query', 'sql', 'run_query'];
  const params = ['sql', 'query', 'sql_query', 'command', 'q'];
  
  for (const name of names) {
    for (const p of params) {
      try {
        const response = await axios.post(
          `${supabaseUrl}/rest/v1/rpc/${name}`,
          { [p]: 'SELECT 1' },
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Success! Found ${name}(${p})`);
        return;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Continue
        } else if (error.response) {
          console.log(`❓ Potential hit on ${name}(${p}):`, error.response.status, error.response.data);
        }
      }
    }
  }
  console.log("❌ No luck.");
}

bruteForceRPC();
