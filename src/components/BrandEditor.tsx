"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Trash2, Plus, TrendingUp, Save, X, Image as ImageIcon, 
  Info, AlertCircle, CheckCircle2, Download, ChevronRight, Tag,
  Settings2, Eye, EyeOff, ShieldAlert, BadgeCheck, UtensilsCrossed
} from "lucide-react";

interface BrandEditorProps {
  brand: any;
  onClose: () => void;
  onRefresh: () => void;
  uberConnected: boolean;
}

export default function BrandEditor({ brand: initialBrand, onClose, onRefresh, uberConnected }: BrandEditorProps) {
  const [brand, setBrand] = useState(initialBrand);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'menu'>('identity');
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
      logo_url: brand.logo_url, background_url: brand.background_url
    }).eq("id", brand.id);
    if (!error) { onRefresh(); alert("✅ Identité sauvegardée !"); }
    setSaving(false);
  };

  const saveMenu = async () => {
    setSaving(true);
    const { error } = await supabase.from("menu_items").upsert(brand.menu_items);
    if (!error) alert("✅ Menu synchronisé !");
    setSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-7xl h-full max-h-[95vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Editor */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-white z-10 shadow-sm">
          <div className="flex items-center gap-10">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#06C167] rounded-lg flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5" />
              </div>
              Studio Kitchenz
            </h3>
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-8">
              <button onClick={() => setActiveTab('identity')} className={`nav-tab ${activeTab === 'identity' ? 'active' : ''}`}>1. Identité</button>
              <button onClick={() => setActiveTab('menu')} className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}>2. Menu Expert</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-all">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {activeTab === 'identity' ? (
            <div className="p-12 max-w-5xl mx-auto space-y-12">
               {/* Identity Content - Same as before but polished */}
               <div className="relative group">
                <div className="h-80 w-full rounded-[40px] overflow-hidden bg-slate-200 shadow-inner">
                  <img src={brand.background_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button onClick={() => handleUploadClick('banner')} className="bg-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Changer la Bannière
                    </button>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-12 group/logo">
                  <div className="w-40 h-40 rounded-[40px] border-[12px] border-white shadow-2xl overflow-hidden bg-white relative">
                    <img src={brand.logo_url} className="w-full h-full object-cover" />
                    <button onClick={() => handleUploadClick('logo')} className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center text-white">
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-16 grid md:grid-cols-2 gap-12 pb-10">
                 <div className="space-y-6">
                    <div className="field-group">
                      <label className="label-pro">Nom de l&apos;enseigne</label>
                      <input value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} className="input-pro text-2xl font-black" />
                    </div>
                    <div className="field-group">
                      <label className="label-pro">Slogan (Tagline)</label>
                      <input value={brand.tagline} onChange={e => setBrand({...brand, tagline: e.target.value})} className="input-pro italic" />
                    </div>
                    <div className="field-group">
                      <label className="label-pro">Style Culinaire</label>
                      <input value={brand.culinary_style} onChange={e => setBrand({...brand, culinary_style: e.target.value})} className="input-pro text-[#06C167] font-black" />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="field-group">
                      <label className="label-pro">Storytelling / Concept</label>
                      <textarea value={brand.storytelling} onChange={e => setBrand({...brand, storytelling: e.target.value})} className="input-pro min-h-[220px] resize-none" />
                    </div>
                    <button onClick={saveIdentity} disabled={saving} className="btn-save-pro">
                      Sauvegarder l&apos;Identité <Save className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="p-12 max-w-6xl mx-auto flex flex-col gap-10">
               <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Menu Expert</h2>
                    <p className="text-slate-500 font-medium italic">Configurez vos articles, options et taxes comme sur Uber Eats Manager.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newItem = {
                        brand_id: brand.id, title: "Nouveau produit", description: "...", category: "Plats",
                        selling_price: 10, vat_rate: 10, is_available: true, options: []
                      };
                      setBrand({...brand, menu_items: [...(brand.menu_items || []), newItem]});
                    }}
                    className="bg-[#06C167] text-white font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-[#06C167]/20"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un produit
                  </button>
               </div>

               <div className="grid gap-6">
                  {brand.menu_items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group/item">
                       <div className="flex gap-10">
                          {/* Item Left: Image & Quick Stats */}
                          <div className="w-44 space-y-4 shrink-0">
                             <div className="w-full h-44 rounded-[35px] overflow-hidden bg-slate-100 relative group/img cursor-pointer shadow-inner">
                                <img src={item.image_url} className="w-full h-full object-cover" />
                                <button onClick={() => handleUploadClick({ type: 'item', index: idx })} className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white">
                                   <Camera className="w-6 h-6" />
                                </button>
                             </div>
                             <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => {
                                    const newItems = [...brand.menu_items];
                                    newItems[idx].is_available = !newItems[idx].is_available;
                                    setBrand({...brand, menu_items: newItems});
                                  }}
                                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${item.is_available ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                                >
                                  {item.is_available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  {item.is_available ? 'Disponible' : 'Indisponible'}
                                </button>
                                <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex justify-between items-center px-4">
                                   <span className="text-[9px] font-black text-slate-400">OPTIONS</span>
                                   <span className="text-[9px] font-black text-indigo-500">{(item.options || []).length} Groupes</span>
                                </div>
                             </div>
                          </div>

                          {/* Item Right: Details & Config */}
                          <div className="flex-1 space-y-6">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 mr-8">
                                   <input value={item.title} onChange={e => {
                                      const newItems = [...brand.menu_items]; newItems[idx].title = e.target.value; setBrand({...brand, menu_items: newItems});
                                   }} className="text-3xl font-black text-slate-900 bg-transparent outline-none focus:text-[#06C167] w-full tracking-tight" />
                                   <div className="flex gap-4 mt-2">
                                      <input value={item.category} onChange={e => {
                                        const newItems = [...brand.menu_items]; newItems[idx].category = e.target.value; setBrand({...brand, menu_items: newItems});
                                      }} className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-lg outline-none" placeholder="Catégorie" />
                                      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                                         <span className="text-[10px] font-black text-yellow-600">TVA:</span>
                                         <select 
                                           value={item.vat_rate} 
                                           onChange={e => {
                                             const newItems = [...brand.menu_items]; newItems[idx].vat_rate = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                           }}
                                           className="bg-transparent text-[10px] font-black text-yellow-600 outline-none"
                                         >
                                            <option value={5.5}>5.5%</option>
                                            <option value={10}>10%</option>
                                            <option value={20}>20%</option>
                                         </select>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 bg-[#06C167]/5 border border-[#06C167]/10 px-5 py-3 rounded-2xl shadow-sm">
                                   <input type="number" value={item.selling_price} onChange={e => {
                                      const newItems = [...brand.menu_items]; newItems[idx].selling_price = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                   }} className="w-16 text-right bg-transparent font-black text-2xl text-[#06C167] outline-none" />
                                   <span className="text-xl font-black text-[#06C167]">€</span>
                                </div>
                             </div>

                             <textarea value={item.description} onChange={e => {
                                const newItems = [...brand.menu_items]; newItems[idx].description = e.target.value; setBrand({...brand, menu_items: newItems});
                             }} className="w-full text-base text-slate-500 bg-slate-50/50 p-5 rounded-2xl outline-none italic leading-relaxed resize-none h-24 border border-slate-100" />

                             <div className="flex gap-4">
                                <button 
                                  onClick={() => setEditingItemIdx(editingItemIdx === idx ? null : idx)}
                                  className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                                >
                                  <Settings2 className="w-4 h-4" /> Configurer Options
                                </button>
                                <button 
                                  onClick={() => {
                                    const newItems = [...brand.menu_items]; newItems.splice(idx, 1); setBrand({...brand, menu_items: newItems});
                                  }}
                                  className="p-3 text-slate-300 hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                             </div>

                             {/* Options Editor Sub-Panel */}
                             <AnimatePresence>
                                {editingItemIdx === idx && (
                                   <motion.div 
                                     initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                     className="overflow-hidden border-t border-slate-100 pt-6 space-y-6"
                                   >
                                      <div className="flex justify-between items-center">
                                         <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                            <UtensilsCrossed className="w-3 h-3" /> Groupes d&apos;Options (Modificateurs)
                                         </h4>
                                         <button 
                                           onClick={() => {
                                             const newItems = [...brand.menu_items];
                                             const newGroup = { name: "Choix", min: 1, max: 1, modifiers: [{ name: "Option 1", price: 0 }] };
                                             newItems[idx].options = [...(newItems[idx].options || []), newGroup];
                                             setBrand({...brand, menu_items: newItems});
                                           }}
                                           className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all"
                                         >
                                            + Nouveau Groupe
                                         </button>
                                      </div>

                                      <div className="grid gap-4">
                                         {(item.options || []).map((group: any, gIdx: number) => (
                                            <div key={gIdx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                               <div className="flex justify-between items-center mb-6">
                                                  <div className="flex items-center gap-4">
                                                     <input value={group.name} onChange={e => {
                                                        const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                     }} className="bg-transparent font-black text-slate-900 outline-none border-b border-transparent focus:border-indigo-300" />
                                                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-lg">
                                                        Min: <input type="number" value={group.min} onChange={e => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].min = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                        }} className="w-8 outline-none text-indigo-500" />
                                                        Max: <input type="number" value={group.max} onChange={e => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].max = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                        }} className="w-8 outline-none text-indigo-500" />
                                                     </div>
                                                  </div>
                                                  <button onClick={() => {
                                                     const newItems = [...brand.menu_items]; newItems[idx].options.splice(gIdx, 1); setBrand({...brand, menu_items: newItems});
                                                  }} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                                               </div>

                                               <div className="space-y-2">
                                                  {group.modifiers.map((mod: any, mIdx: number) => (
                                                     <div key={mIdx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                        <input value={mod.name} onChange={e => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers[mIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                        }} className="flex-1 text-xs font-medium outline-none" />
                                                        <div className="flex items-center gap-1 text-[#06C167] font-black">
                                                           <span className="text-[10px]">+</span>
                                                           <input type="number" value={mod.price} onChange={e => {
                                                              const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers[mIdx].price = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                                           }} className="w-10 text-right outline-none text-xs" />
                                                           <span className="text-[10px]">€</span>
                                                        </div>
                                                        <button onClick={() => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers.splice(mIdx, 1); setBrand({...brand, menu_items: newItems});
                                                        }} className="text-slate-200 hover:text-slate-400"><Trash2 className="w-3 h-3" /></button>
                                                     </div>
                                                  ))}
                                                  <button 
                                                    onClick={() => {
                                                      const newItems = [...brand.menu_items];
                                                      newItems[idx].options[gIdx].modifiers.push({ name: "Option", price: 0 });
                                                      setBrand({...brand, menu_items: newItems});
                                                    }}
                                                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:border-indigo-200 hover:text-indigo-400 transition-all"
                                                  >
                                                     + Ajouter une option
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

               <div className="mt-12 flex gap-6 pb-20">
                  <button onClick={saveMenu} disabled={saving} className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest py-6 rounded-[30px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    Sauvegarder le Menu local <Save className="w-5 h-5" />
                  </button>
                  {uberConnected && (
                    <button 
                      onClick={async () => {
                        const res = await fetch("/api/uber/sync", { method: "POST", body: JSON.stringify({ brandId: brand.id }) });
                        const data = await res.json();
                        if (data.success) alert("🚀 Menu synchronisé sur Uber Eats !");
                        else alert("Erreur : " + data.error);
                      }}
                      className="flex-1 bg-[#06C167] text-white font-black uppercase tracking-widest py-6 rounded-[30px] shadow-2xl shadow-[#06C167]/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                    >
                      🚀 Publier Uber Eats <TrendingUp className="w-5 h-5" />
                    </button>
                  )}
               </div>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        .nav-tab { @apply text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pb-1 border-b-2 border-transparent transition-all; }
        .nav-tab.active { @apply text-slate-900 border-[#06C167]; }
        .label-pro { @apply text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block; }
        .input-pro { @apply w-full bg-white p-6 rounded-[30px] border border-slate-100 outline-none focus:ring-4 focus:ring-[#06C167]/5 focus:border-[#06C167]/20 transition-all shadow-sm; }
        .btn-save-pro { @apply w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-6 rounded-[30px] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </motion.div>
  );
}
