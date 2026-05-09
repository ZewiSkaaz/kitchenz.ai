"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, Utensils, Zap, Save, ArrowLeft, Plus, Trash2, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function EstablishmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [establishment, setEstablishment] = useState<any>(null);

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [currentEquipment, setCurrentEquipment] = useState("");

  useEffect(() => {
    const fetchEst = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", params.id)
        .single();

      if (data) {
        setEstablishment(data);
        setIngredients(data.default_ingredients || []);
        setEquipment(data.default_equipment || []);
      }
      setLoading(true); // Wait, I should set it to false
      setLoading(false);
    };
    fetchEst();
  }, [params.id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("establishments")
        .update({
          default_ingredients: ingredients,
          default_equipment: equipment
        })
        .eq("id", params.id);
      
      if (error) throw error;
      alert("✅ Inventaire sauvegardé !");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: "ingredient" | "equipment") => {
    if (type === "ingredient" && currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    } else if (type === "equipment" && currentEquipment.trim()) {
      setEquipment([...equipment, currentEquipment.trim()]);
      setCurrentEquipment("");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#06C167]" /></div>;
  if (!establishment) return <div className="min-h-screen flex items-center justify-center">Établissement non trouvé.</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-slate-900 transition-all">
          <ArrowLeft className="w-4 h-4" /> Retour au Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                  <Store className="w-6 h-6 text-white" />
               </div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">{establishment.name}</h1>
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
              <MapPin className="w-4 h-4" /> {establishment.address}, {establishment.city}
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-primary px-10 py-5 bg-[#06C167] shadow-lg shadow-[#06C167]/20 flex items-center gap-3"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Sauvegarder l'inventaire
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* INGREDIENTS */}
          <div className="glass-card p-10 bg-white">
            <div className="flex items-center gap-3 mb-8">
              <Utensils className="text-[#06C167] w-6 h-6" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Stock d'ingrédients</h2>
            </div>
            
            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                placeholder="Ajouter un ingrédient..." 
                className="input-premium flex-1" 
                value={currentIngredient}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(',')) {
                    const newItems = val.split(',').map(i => i.trim()).filter(i => i !== "");
                    setIngredients([...ingredients, ...newItems]);
                    setCurrentIngredient("");
                  } else {
                    setCurrentIngredient(val);
                  }
                }}
                onKeyPress={(e) => e.key === "Enter" && addItem("ingredient")}
              />
              <button onClick={() => addItem("ingredient")} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#06C167] transition-all">
                  <span className="text-sm font-bold text-slate-700">{ing}</span>
                  <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* EQUIPMENT */}
          <div className="glass-card p-10 bg-white">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-[#06C167] w-6 h-6" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Matériel Cuisine</h2>
            </div>

            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                placeholder="Ajouter un matériel..." 
                className="input-premium flex-1" 
                value={currentEquipment}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(',')) {
                    const newItems = val.split(',').map(i => i.trim()).filter(i => i !== "");
                    setEquipment([...equipment, ...newItems]);
                    setCurrentEquipment("");
                  } else {
                    setCurrentEquipment(val);
                  }
                }}
                onKeyPress={(e) => e.key === "Enter" && addItem("equipment")}
              />
              <button onClick={() => addItem("equipment")} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {equipment.map((eq, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#06C167] transition-all">
                  <span className="text-sm font-bold text-slate-700">{eq}</span>
                  <button onClick={() => setEquipment(equipment.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
