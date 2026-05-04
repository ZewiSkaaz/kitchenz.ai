import { supabase } from "./lib/supabase";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  console.log("🛠️ Vérification des tables Supabase...");
  
  const { data, error } = await supabase
    .from("brands")
    .select("id")
    .limit(1);

  if (error) {
    if (error.code === "PGRST116" || error.code === "42P01") {
      console.error("❌ Erreur : Les tables n'existent pas encore.");
      console.log("👉 Veuillez copier-coller le SQL de 'supabase_schema.md' dans l'éditeur SQL de Supabase.");
    } else {
      console.error("❌ Erreur Supabase:", error.message);
    }
  } else {
    console.log("✅ Connexion réussie et tables détectées !");
  }
}

test();
