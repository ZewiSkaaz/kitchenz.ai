"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Trash2, Plus, TrendingUp, Save, X, Image as ImageIcon, 
  Info, AlertCircle, CheckCircle2, Download, ChevronRight, Tag,
  Settings2, Eye, EyeOff, ShieldAlert, BadgeCheck, UtensilsCrossed, Clock, Calendar,
  ChevronDown, ChevronUp
} from "lucide-react";

interface BrandEditorProps {
  brand: any;
  onClose: () => void;
  onRefresh: () => void;
  uberConnected: boolean;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function BrandEditor({ brand: initialBrand, onClose, onRefresh, uberConnected }: BrandEditorProps) {
  const [brand, setBrand] = useState(initialBrand);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'menu' | 'ops'>('identity');
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'logo' | 'banner' | { type: 'item', index: number } | null>(null);

  const handleUploadClick = (target: any) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }

    try {
      const fileName = `${brand.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase.storage.from('brand-assets').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(fileName);

      if (uploadTarget === 'logo') setBrand({ ...brand, logo_url: publicUrl });
      else if (uploadTarget === 'banner') setBrand({ ...brand, background_url: publicUrl });
      else if (typeof uploadTarget === 'object' && uploadTarget.type === 'item') {
        const newItems = [...brand.menu_items];
        newItems[uploadTarget.index].image_url = publicUrl;
        setBrand({ ...brand, menu_items: newItems });
      }
    } catch (error: any) { alert(error.message); }
  };

  const saveIdentity = async () => {
    setSaving(true);
    const { error } = await supabase.from("brands").update({
      name: brand.name, culinary_style: brand.culinary_style,
      tagline: brand.tagline, storytelling: brand.storytelling,
      logo_url: brand.logo_url, background_url: brand.background_url,
      business_hours: brand.business_hours
    }).eq("id", brand.id);
    if (!error) { onRefresh(); alert("✅ Identité & Opérations sauvegardées !"); }
    setSaving(false);
  };

  const saveMenu = async () => {
    setSaving(true);
    const { error } = await supabase.from("menu_items").upsert(brand.menu_items);
    if (!error) alert("✅ Menu synchronisé !");
    setSaving(false);
  };

  const updateHours = (dayIdx: number, field: 'startTime' | 'endTime', value: string) => {
    const newHours = [...(brand.business_hours || [])];
    if (!newHours[dayIdx]) newHours[dayIdx] = { day: dayIdx, startTime: "08:00", endTime: "22:00" };
    newHours[dayIdx][field] = value;
    setBrand({ ...brand, business_hours: newHours });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-7xl h-full max-h-[95vh] rounded-[50px] overflow-hidden flex flex-col shadow-[0_0_100px_-20px_rgba(0,0,0,0.3)] relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Editor */}
        <div className="flex items-center justify-between px-12 py-8 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-12">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              <div className="w-10 h-10 bg-[#06C167] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#06C167]/20">
                <ChefHat className="w-6 h-6" />
              </div>
              Studio Kitchenz <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full text-slate-400 ml-2 tracking-widest font-black">V2.0</span>
            </h3>
            <div className="h-10 w-px bg-slate-100" />
            <div className="flex items-center gap-10">
              <button onClick={() => setActiveTab('identity')} className={`nav-tab-v2 ${activeTab === 'identity' ? 'active' : ''}`}>1. Identité</button>
              <button onClick={() => setActiveTab('menu')} className={`nav-tab-v2 ${activeTab === 'menu' ? 'active' : ''}`}>2. Carte Pro</button>
              <button onClick={() => setActiveTab('ops')} className={`nav-tab-v2 ${activeTab === 'ops' ? 'active' : ''}`}>3. Opérations</button>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
             <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fdfdfd]">
          {activeTab === 'identity' ? (
            <div className="p-16 max-w-5xl mx-auto space-y-16">
               <div className="relative group">
                <div className="h-[400px] w-full rounded-[50px] overflow-hidden bg-slate-100 shadow-inner border border-slate-200">
                  <img src={brand.background_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                    <button onClick={() => handleUploadClick('banner')} className="bg-white px-10 py-4 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-all">
                      <Camera className="w-5 h-5" /> Modifier la Bannière
                    </button>
                  </div>
                </div>
                <div className="absolute -bottom-16 left-16 group/logo">
                  <div className="w-48 h-48 rounded-[50px] border-[16px] border-white shadow-2xl overflow-hidden bg-white relative">
                    <img src={brand.logo_url} className="w-full h-full object-cover" />
                    <button onClick={() => handleUploadClick('logo')} className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center text-white backdrop-blur-sm">
                      <Camera className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-24 grid md:grid-cols-2 gap-16 pb-20">
                 <div className="space-y-8">
                    <div className="field-group">
                      <label className="label-pro-v2">Nom de l&apos;enseigne</label>
                      <input value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} className="input-pro-v2 text-4xl font-black tracking-tighter" />
                    </div>
                    <div className="field-group">
                      <label className="label-pro-v2">Slogan / Accroche (Tagline)</label>
                      <input value={brand.tagline} onChange={e => setBrand({...brand, tagline: e.target.value})} className="input-pro-v2 text-slate-500 italic font-medium" />
                    </div>
                    <div className="field-group">
                      <label className="label-pro-v2">Style Culinaire Principal</label>
                      <input value={brand.culinary_style} onChange={e => setBrand({...brand, culinary_style: e.target.value})} className="input-pro-v2 text-[#06C167] font-black uppercase" />
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div className="field-group">
                      <label className="label-pro-v2">Concept & Storytelling Expert</label>
                      <textarea value={brand.storytelling} onChange={e => setBrand({...brand, storytelling: e.target.value})} className="input-pro-v2 min-h-[250px] resize-none leading-relaxed text-lg" />
                    </div>
                    <button onClick={saveIdentity} disabled={saving} className="btn-save-v2">
                      {saving ? 'Enregistrement...' : 'Valider l\'Identité'} <BadgeCheck className="w-6 h-6" />
                    </button>
                 </div>
              </div>
            </div>
          ) : activeTab === 'menu' ? (
            <div className="p-16 max-w-6xl mx-auto space-y-12 pb-32">
               <div className="flex justify-between items-end border-b border-slate-100 pb-10">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Votre Carte</h2>
                    <p className="text-slate-500 font-medium text-lg italic">Optimisez chaque article pour l&apos;algorithme Uber Eats.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newItem = {
                        brand_id: brand.id, title: "Nouveau produit", description: "Description...", category: "Plats",
                        selling_price: 10, vat_rate: 10, is_available: true, options: [], sub_category: "Signature"
                      };
                      setBrand({...brand, menu_items: [...(brand.menu_items || []), newItem]});
                    }}
                    className="bg-[#06C167] text-white font-black uppercase text-[11px] tracking-widest px-10 py-5 rounded-3xl flex items-center gap-3 shadow-2xl shadow-[#06C167]/30 hover:scale-105 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Nouvel Article
                  </button>
               </div>

               <div className="grid gap-10">
                  {brand.menu_items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group/item">
                       <div className="flex gap-12">
                          <div className="w-56 space-y-6 shrink-0">
                             <div className="w-full h-56 rounded-[45px] overflow-hidden bg-slate-50 relative group/img cursor-pointer border border-slate-100 shadow-inner">
                                <img src={item.image_url} className="w-full h-full object-cover" />
                                <button onClick={() => handleUploadClick({ type: 'item', index: idx })} className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white backdrop-blur-sm">
                                   <Camera className="w-8 h-8" />
                                </button>
                             </div>
                             <div className="flex flex-col gap-3">
                                <button 
                                  onClick={() => {
                                    const newItems = [...brand.menu_items];
                                    newItems[idx].is_available = !newItems[idx].is_available;
                                    setBrand({...brand, menu_items: newItems});
                                  }}
                                  className={`flex items-center justify-center gap-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${item.is_available ? 'bg-green-50 text-[#06C167] border border-green-100' : 'bg-red-50 text-red-500 border border-red-100 opacity-50'}`}
                                >
                                  {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  {item.is_available ? 'En Ligne' : 'Hors Ligne'}
                                </button>
                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex justify-between items-center px-6">
                                   <span className="text-[10px] font-black text-slate-400">OPTIONS</span>
                                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{(item.options || []).length} Groupes</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex-1 space-y-8">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 mr-10 space-y-4">
                                   <input value={item.title} onChange={e => {
                                      const newItems = [...brand.menu_items]; newItems[idx].title = e.target.value; setBrand({...brand, menu_items: newItems});
                                   }} className="text-4xl font-black text-slate-900 bg-transparent outline-none focus:text-[#06C167] w-full tracking-tighter" />
                                   
                                   <div className="flex gap-4">
                                      <input value={item.category} onChange={e => {
                                        const newItems = [...brand.menu_items]; newItems[idx].category = e.target.value; setBrand({...brand, menu_items: newItems});
                                      }} className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-4 py-2 rounded-xl outline-none" placeholder="Catégorie" />
                                      <input value={item.sub_category || ''} onChange={e => {
                                        const newItems = [...brand.menu_items]; newItems[idx].sub_category = e.target.value; setBrand({...brand, menu_items: newItems});
                                      }} className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-4 py-2 rounded-xl outline-none" placeholder="Sous-Catégorie" />
                                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                                         <span className="text-[10px] font-black text-yellow-600">TVA:</span>
                                         <select 
                                           value={item.vat_rate} 
                                           onChange={e => {
                                             const newItems = [...brand.menu_items]; newItems[idx].vat_rate = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                           }}
                                           className="bg-transparent text-[10px] font-black text-yellow-600 outline-none"
                                         >
                                            <option value={5.5}>5.5%</option>
                                            <option value={10}>10% (Resto)</option>
                                            <option value={20}>20% (Alcool)</option>
                                         </select>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 bg-[#06C167]/5 border-2 border-[#06C167]/10 px-8 py-4 rounded-[25px] shadow-sm">
                                   <input type="number" value={item.selling_price} onChange={e => {
                                      const newItems = [...brand.menu_items]; newItems[idx].selling_price = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                   }} className="w-20 text-right bg-transparent font-black text-3xl text-[#06C167] outline-none" />
                                   <span className="text-2xl font-black text-[#06C167]">€</span>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description Marketing</label>
                                <textarea value={item.description} onChange={e => {
                                   const newItems = [...brand.menu_items]; newItems[idx].description = e.target.value; setBrand({...brand, menu_items: newItems});
                                }} className="w-full text-lg text-slate-600 bg-slate-50 p-6 rounded-3xl outline-none italic leading-relaxed resize-none h-32 border border-slate-100 focus:bg-white transition-all" />
                             </div>

                             <div className="flex gap-6 items-center">
                                <button 
                                  onClick={() => setEditingItemIdx(editingItemIdx === idx ? null : idx)}
                                  className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                                >
                                  {editingItemIdx === idx ? <ChevronUp className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
                                  {editingItemIdx === idx ? 'Fermer Config' : 'Options & Modificateurs'}
                                </button>
                                
                                <label className="flex items-center gap-3 cursor-pointer p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                                   <input 
                                     type="checkbox"
                                     checked={item.is_special_offer}
                                     onChange={e => {
                                        const newItems = [...brand.menu_items];
                                        newItems[idx].is_special_offer = e.target.checked;
                                        setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-5 h-5 rounded-lg border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                                   />
                                   <span className="text-[11px] font-black uppercase tracking-widest text-yellow-700 flex items-center gap-2">
                                      <Tag className="w-4 h-4" /> Offre Spéciale
                                   </span>
                                </label>
                                
                                {item.is_special_offer && (
                                   <input 
                                      value={item.special_offer_text || ''}
                                      onChange={e => {
                                        const newItems = [...brand.menu_items];
                                        newItems[idx].special_offer_text = e.target.value;
                                        setBrand({...brand, menu_items: newItems});
                                      }}
                                      className="flex-1 text-[11px] font-black text-yellow-800 bg-white px-6 py-4 rounded-2xl outline-none border-2 border-yellow-200"
                                      placeholder="Ex: 1 acheté = 1 offert"
                                   />
                                )}

                                <div className="flex-1" />
                                <button 
                                  onClick={() => {
                                    const newItems = [...brand.menu_items]; newItems.splice(idx, 1); setBrand({...brand, menu_items: newItems});
                                  }}
                                  className="p-4 text-slate-200 hover:text-red-500 transition-all hover:bg-red-50 rounded-2xl"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                             </div>

                             <AnimatePresence>
                                {editingItemIdx === idx && (
                                   <motion.div 
                                     initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                     className="overflow-hidden bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 space-y-8"
                                   >
                                      <div className="flex justify-between items-center">
                                         <h4 className="text-[11px] font-black uppercase text-indigo-500 tracking-[0.2em] flex items-center gap-3">
                                            <UtensilsCrossed className="w-5 h-5" /> Architecture des Options
                                         </h4>
                                         <button 
                                           onClick={() => {
                                             const newItems = [...brand.menu_items];
                                             const newGroup = { name: "Suppléments", min: 0, max: 5, modifiers: [{ name: "Sans oignon", price: 0 }] };
                                             newItems[idx].options = [...(newItems[idx].options || []), newGroup];
                                             setBrand({...brand, menu_items: newItems});
                                           }}
                                           className="text-[10px] font-black text-white bg-indigo-500 px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200"
                                         >
                                            + Ajouter un Groupe
                                         </button>
                                      </div>

                                      <div className="grid gap-6">
                                         {(item.options || []).map((group: any, gIdx: number) => (
                                            <div key={gIdx} className="bg-white p-8 rounded-[35px] border border-slate-200 shadow-sm">
                                               <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
                                                  <div className="flex items-center gap-6">
                                                     <input value={group.name} onChange={e => {
                                                        const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                     }} className="bg-transparent font-black text-xl text-slate-900 outline-none border-b-2 border-transparent focus:border-indigo-200 pb-1" />
                                                     <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 bg-slate-50 px-5 py-2 rounded-xl">
                                                        SÉLECTION : 
                                                        <div className="flex items-center gap-2 text-indigo-600">
                                                          MIN <input type="number" value={group.min} onChange={e => {
                                                            const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].min = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                          }} className="w-10 outline-none bg-white px-2 py-1 rounded-md text-center" />
                                                          MAX <input type="number" value={group.max} onChange={e => {
                                                            const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].max = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                          }} className="w-10 outline-none bg-white px-2 py-1 rounded-md text-center" />
                                                        </div>
                                                     </div>
                                                  </div>
                                                  <button onClick={() => {
                                                     const newItems = [...brand.menu_items]; newItems[idx].options.splice(gIdx, 1); setBrand({...brand, menu_items: newItems});
                                                  }} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                                               </div>

                                               <div className="grid md:grid-cols-2 gap-4">
                                                  {group.modifiers.map((mod: any, mIdx: number) => (
                                                     <div key={mIdx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group/mod hover:bg-slate-100 transition-all">
                                                        <input value={mod.name} onChange={e => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers[mIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                        }} className="flex-1 text-sm font-bold bg-transparent outline-none focus:text-indigo-600" />
                                                        <div className="flex items-center gap-2 text-[#06C167] font-black bg-white px-4 py-2 rounded-xl border border-slate-100">
                                                           <span className="text-xs">+</span>
                                                           <input type="number" value={mod.price} onChange={e => {
                                                              const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers[mIdx].price = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                                           }} className="w-12 text-right outline-none text-sm bg-transparent" />
                                                           <span className="text-xs">€</span>
                                                        </div>
                                                        <button onClick={() => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers.splice(mIdx, 1); setBrand({...brand, menu_items: newItems});
                                                        }} className="p-2 text-slate-200 group-hover/mod:text-red-300 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                     </div>
                                                  ))}
                                                  <button 
                                                    onClick={() => {
                                                      const newItems = [...brand.menu_items];
                                                      newItems[idx].options[gIdx].modifiers.push({ name: "Nouvelle option", price: 0 });
                                                      setBrand({...brand, menu_items: newItems});
                                                    }}
                                                    className="p-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
                                                  >
                                                     <Plus className="w-4 h-4" /> Ajouter un choix
                                                  </button>
                                               </div>
                                            </div>
                                         ))}
                                      </div>
                                   </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 z-30">
                  <div className="bg-slate-900 p-6 rounded-[40px] shadow-2xl flex gap-6 border-4 border-white/10 backdrop-blur-md">
                    <button onClick={saveMenu} disabled={saving} className="flex-1 bg-white text-slate-900 font-black uppercase tracking-[0.2em] py-5 rounded-[25px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                      {saving ? 'Synchronisation...' : 'Enregistrer le Menu local'} <Save className="w-6 h-6" />
                    </button>
                    {uberConnected && (
                      <button 
                        onClick={async () => {
                          const res = await fetch("/api/uber/sync", { method: "POST", body: JSON.stringify({ brandId: brand.id }) });
                          const data = await res.json();
                          if (data.success) alert("🚀 Menu synchronisé sur Uber Eats !");
                          else alert("Erreur : " + data.error);
                        }}
                        className="flex-1 bg-[#06C167] text-white font-black uppercase tracking-[0.2em] py-5 rounded-[25px] shadow-xl shadow-[#06C167]/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                      >
                        🚀 Publier Uber Eats <TrendingUp className="w-6 h-6" />
                      </button>
                    )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="p-20 max-w-4xl mx-auto space-y-16 pb-32">
               <div className="space-y-4">
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Opérations Expert</h2>
                 <p className="text-slate-500 font-medium text-lg italic">Ces paramètres sont obligatoires pour que votre boutique soit active sur Uber Eats.</p>
               </div>

               <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-sm space-y-10">
                  <div className="flex items-center gap-6 mb-4">
                    <Clock className="w-10 h-10 text-[#06C167]" />
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Horaires d&apos;Ouverture</h3>
                  </div>
                  <div className="grid gap-4">
                     {DAYS.map((day, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl group hover:bg-slate-100 transition-all">
                          <span className="font-black text-slate-900 tracking-wide uppercase text-sm">{day}</span>
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DE</span>
                                <input 
                                  type="time" 
                                  value={brand.business_hours?.[i]?.startTime || "08:00"} 
                                  onChange={e => updateHours(i, 'startTime', e.target.value)}
                                  className="font-black text-slate-900 outline-none" 
                                />
                             </div>
                             <div className="w-4 h-[2px] bg-slate-200" />
                             <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">À</span>
                                <input 
                                  type="time" 
                                  value={brand.business_hours?.[i]?.endTime || "22:00"} 
                                  onChange={e => updateHours(i, 'endTime', e.target.value)}
                                  className="font-black text-slate-900 outline-none" 
                                />
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                  
                  <button onClick={saveIdentity} disabled={saving} className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-6 rounded-[30px] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4">
                     Sauvegarder les Paramètres Ops <ShieldCheck className="w-6 h-6" />
                  </button>
               </div>

               <div className="bg-indigo-50/50 p-10 rounded-[40px] border border-indigo-100 flex gap-8">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-500 shadow-lg shrink-0">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-indigo-900 mb-2">Note sur la Synchronisation</h4>
                    <p className="text-indigo-700/70 font-medium leading-relaxed">
                      Uber Eats rejette les menus si les horaires d&apos;ouverture ne couvrent pas au moins une plage de 4 heures consécutives. 
                      Assurez-vous que vos horaires sont corrects avant de tenter une publication globale.
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        .nav-tab-v2 { @apply text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 pb-2 border-b-4 border-transparent transition-all; }
        .nav-tab-v2.active { @apply text-slate-900 border-[#06C167]; }
        .label-pro-v2 { @apply text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block; }
        .input-pro-v2 { @apply w-full bg-white p-8 rounded-[40px] border-2 border-slate-100 outline-none focus:ring-[15px] focus:ring-[#06C167]/5 focus:border-[#06C167]/20 transition-all shadow-sm; }
        .btn-save-v2 { @apply w-full bg-slate-900 text-white font-black uppercase tracking-[0.3em] py-8 rounded-[40px] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-4; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </motion.div>
  );
}
