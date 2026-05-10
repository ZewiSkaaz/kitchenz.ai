"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Utensils, Zap, Sparkles, Loader2, Plus, Trash2 } from "lucide-react";
import { calculatePrice, getImageUrl, AuditResult } from "@/lib/ai";
import { performCompleteAuditAction } from "@/app/actions/aiActions";
import { supabase } from "@/lib/supabase";

export default function AuditPage() {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const router = useRouter();

  // Form state (controlled inputs)
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [currentEquipment, setCurrentEquipment] = useState("");
  const [brandName, setBrandName] = useState("");
  const [concept, setConcept] = useState("");
  const [location, setLocation] = useState("");

  // Results
  const [result, setResult] = useState<AuditResult | null>(null);
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));
  const [error, setError] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/login");
    });
  }, [router]);

  // Add items from comma-separated input
  const addIngredients = () => {
    const items = currentIngredient.split(",").map(i => i.trim()).filter(Boolean);
    if (items.length > 0) {
      setIngredients(prev => [...prev, ...items]);
      setCurrentIngredient("");
    }
  };

  const addEquipment = () => {
    const items = currentEquipment.split(",").map(i => i.trim()).filter(Boolean);
    if (items.length > 0) {
      setEquipment(prev => [...prev, ...items]);
      setCurrentEquipment("");
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      alert("Ajoutez au moins quelques ingrédients !");
      return;
    }
    setStep("loading");
    setError(null);

    try {
      const data = await performCompleteAuditAction(ingredients, equipment, concept, brandName, location);
      if (data) {
        setResult(data);
        setStep("result");
      } else {
        throw new Error("L'IA n'a pas pu générer le concept.");
      }
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
      setStep("form");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ─── FORM ─── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Audit IA Flash ⚡</h1>
                  <p className="text-slate-500 font-medium text-sm">Vos stocks → une marque virtuelle rentable en 10 secondes.</p>
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
                      ⚠️ {error} — Réessayez dans quelques instants.
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Votre concept (Optionnel)</label>
                    <textarea
                      value={concept}
                      onChange={e => setConcept(e.target.value)}
                      placeholder="Ex: Un resto de burger haut de gamme pour le quartier étudiant..."
                      className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#06C167] resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nom de marque (Optionnel)</label>
                      <input
                        value={brandName}
                        onChange={e => setBrandName(e.target.value)}
                        placeholder="Ex: El Fuego..."
                        className="w-full p-4 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#06C167]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Ville</label>
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Ex: Bordeaux"
                        className="w-full p-4 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#06C167]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full py-6 bg-[#06C167] text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#06C167]/20 hover:bg-[#05a357] hover:scale-[1.02] transition-all"
                >
                  Lancer l'Audit IA <Sparkles className="w-5 h-5" />
                </button>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Ingredients */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                    <Utensils className="w-4 h-4 text-[#06C167]" /> Vos Ingrédients
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      value={currentIngredient}
                      onChange={e => setCurrentIngredient(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addIngredients()}
                      placeholder="Poulet, Tomate, Cheddar... (virgules OK)"
                      className="flex-1 p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#06C167]"
                    />
                    <button
                      onClick={addIngredients}
                      className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5">
                        {ing}
                        <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-3 h-3 hover:text-red-500 transition-colors" />
                        </button>
                      </span>
                    ))}
                    {ingredients.length === 0 && (
                      <p className="text-slate-300 text-xs font-bold italic">Aucun ingrédient ajouté...</p>
                    )}
                  </div>
                </div>

                {/* Equipment */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-4">
                    <Zap className="w-4 h-4 text-yellow-500" /> Matériel Cuisine
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      value={currentEquipment}
                      onChange={e => setCurrentEquipment(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addEquipment()}
                      placeholder="Friteuse, Four, Plancha..."
                      className="flex-1 p-3 bg-slate-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#06C167]"
                    />
                    <button
                      onClick={addEquipment}
                      className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {equipment.map((eq, i) => (
                      <span key={i} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5">
                        {eq}
                        <button onClick={() => setEquipment(equipment.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-3 h-3 hover:text-red-500 transition-colors" />
                        </button>
                      </span>
                    ))}
                    {equipment.length === 0 && (
                      <p className="text-slate-300 text-xs font-bold italic">Aucun matériel ajouté...</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── LOADING ─── */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 text-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-4 border-[#06C167]/20 border-t-[#06C167] rounded-full"
                />
                <ChefHat className="absolute inset-0 m-auto w-10 h-10 text-[#06C167]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">L'IA cuisine votre marque...</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                Analyse de {ingredients.length} ingrédients en cours...
              </p>
            </motion.div>
          )}

          {/* ─── RESULT ─── */}
          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Brand Hero */}
              <div className="relative h-[420px] rounded-[40px] overflow-hidden shadow-2xl">
                <img
                  src={getImageUrl(result.brand.name, result.brand.background_prompt, "bg", seed)}
                  className="w-full h-full object-cover"
                  alt={`Background ${result.brand.name}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between gap-6">
                  <div className="flex-1">
                    <span className="px-4 py-1.5 bg-[#06C167] text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
                      ✓ Audit Terminé
                    </span>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{result.brand.name}</h1>
                    <p className="text-lg text-white/70 font-medium italic">"{result.brand.tagline}"</p>
                    <p className="text-sm text-white/50 mt-2 font-bold uppercase tracking-widest">{result.brand.culinary_style}</p>
                  </div>
                  <div className="w-28 h-28 bg-white rounded-3xl p-3 shadow-2xl shrink-0">
                    <img
                      src={getImageUrl(result.brand.name, result.brand.logo_prompt, "logo", seed)}
                      className="w-full h-full object-contain"
                      alt={`Logo ${result.brand.name}`}
                    />
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-[#06C167] rounded-full" />
                  Menu Optimisé ({result.menu_items.length} plats)
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.menu_items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col"
                    >
                      <div className="h-48 relative bg-slate-100">
                        <img
                          src={getImageUrl(item.title, item.description_seo, "dish", seed + i + 1)}
                          className="w-full h-full object-cover"
                          alt={item.title}
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-sm font-black text-slate-900 shadow-sm">
                          {calculatePrice(item.financials.material_cost, item.financials.net_margin_target).toFixed(2)} €
                        </div>
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                          {item.category}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-base font-black text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 flex-1">{item.description_seo}</p>
                        <div className="flex flex-wrap gap-1">
                          {item.ingredients.slice(0, 4).map((ing, idx) => (
                            <span key={idx} className="text-[8px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded font-bold uppercase">{ing}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Combos */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-yellow-400 rounded-full" />
                  Packs & Menus Uber Eats
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {result.combos.map((combo, i) => (
                    <div key={i} className="bg-slate-900 p-8 rounded-3xl text-white flex justify-between items-center gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-black mb-2">{combo.title}</h3>
                        <p className="text-xs text-white/40 mb-4">{combo.description_seo}</p>
                        <div className="flex flex-wrap gap-2">
                          {combo.items.map((it, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">{it}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-3xl font-black text-yellow-400">
                          {calculatePrice(combo.financials.material_cost, combo.financials.net_margin_target).toFixed(2)} €
                        </p>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Prix conseillé</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => { setStep("form"); setResult(null); }}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                >
                  ← Relancer un audit
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
                >
                  Exporter en PDF
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
