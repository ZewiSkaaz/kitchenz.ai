"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  Camera, Trash2, Plus, TrendingUp, Save, X, Image as ImageIcon, 
  Info, AlertCircle, CheckCircle2, Download, ChevronRight, Tag
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'logo' | 'banner' | { type: 'item', index: number } | null>(null);

  const handleUploadClick = (target: any) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    // Uber Eats validation (simplified for web)
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop lourde (max 5MB pour Uber Eats)");
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${brand.id}/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('brand-assets').upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(fileName);

      if (uploadTarget === 'logo') {
        setBrand({ ...brand, logo_url: publicUrl });
      } else if (uploadTarget === 'banner') {
        setBrand({ ...brand, background_url: publicUrl });
      } else if (typeof uploadTarget === 'object' && uploadTarget.type === 'item') {
        const newItems = [...brand.menu_items];
        newItems[uploadTarget.index].image_url = publicUrl;
        setBrand({ ...brand, menu_items: newItems });
      }
    } catch (error: any) {
      alert("Erreur d'upload : " + error.message);
    }
  };

  const saveIdentity = async () => {
    setSaving(true);
    const { error } = await supabase.from("brands").update({
      name: brand.name,
      culinary_style: brand.culinary_style,
      tagline: brand.tagline,
      storytelling: brand.storytelling,
      logo_url: brand.logo_url,
      background_url: brand.background_url
    }).eq("id", brand.id);

    if (error) alert(error.message);
    else {
      onRefresh();
      alert("✅ Identité visuelle enregistrée !");
    }
    setSaving(false);
  };

  const saveMenu = async () => {
    setSaving(true);
    const { error } = await supabase.from("menu_items").upsert(brand.menu_items);
    if (error) alert(error.message);
    else alert("✅ Menu synchronisé avec succès !");
    setSaving(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-7xl h-full max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Editor */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('identity')}
              className={`text-sm font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'identity' ? 'border-[#06C167] text-slate-900' : 'border-transparent text-slate-400'}`}
            >
              1. Identité & Design
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`text-sm font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'menu' ? 'border-[#06C167] text-slate-900' : 'border-transparent text-slate-400'}`}
            >
              2. Carte & Produits
            </button>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(brand, null, 2));
                  const a = document.createElement('a');
                  a.href = dataStr;
                  a.download = `brand_${brand.name}.json`;
                  a.click();
                }}
                className="p-3 text-slate-400 hover:text-slate-900 transition-all"
             >
                <Download className="w-5 h-5" />
             </button>
             <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-all">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
          {activeTab === 'identity' ? (
            <div className="p-12 max-w-5xl mx-auto space-y-12">
              {/* Banner Upload */}
              <div className="relative group">
                <div className="h-80 w-full rounded-[40px] overflow-hidden bg-slate-200 shadow-inner">
                  <img src={brand.background_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button 
                      onClick={() => handleUploadClick('banner')}
                      className="bg-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-2xl"
                    >
                      <Camera className="w-4 h-4" /> Changer la Bannière
                    </button>
                  </div>
                </div>
                <div className="absolute -bottom-10 left-12 group/logo">
                  <div className="w-40 h-40 rounded-[40px] border-[12px] border-white shadow-2xl overflow-hidden bg-white relative">
                    <img src={brand.logo_url} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleUploadClick('logo')}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center text-white"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-16 grid md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div>
                      <label className="label-pro">Nom de l&apos;enseigne</label>
                      <input 
                        value={brand.name} 
                        onChange={e => setBrand({...brand, name: e.target.value})}
                        className="input-pro text-3xl font-black"
                        placeholder="Ex: Burger AI"
                      />
                    </div>
                    <div>
                      <label className="label-pro">Tagline (Slogan court)</label>
                      <input 
                        value={brand.tagline} 
                        onChange={e => setBrand({...brand, tagline: e.target.value})}
                        className="input-pro italic"
                        placeholder="Le futur du burger..."
                      />
                    </div>
                    <div>
                      <label className="label-pro">Style Culinaire</label>
                      <input 
                        value={brand.culinary_style} 
                        onChange={e => setBrand({...brand, culinary_style: e.target.value})}
                        className="input-pro text-[#06C167] uppercase font-black"
                        placeholder="Street Food / Fusion"
                      />
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div>
                      <label className="label-pro">Concept & Storytelling</label>
                      <textarea 
                        value={brand.storytelling} 
                        onChange={e => setBrand({...brand, storytelling: e.target.value})}
                        className="input-pro min-h-[250px] leading-relaxed resize-none"
                        placeholder="Racontez l'histoire de votre marque..."
                      />
                    </div>
                    <button 
                      onClick={saveIdentity}
                      disabled={saving}
                      className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] py-5 rounded-[25px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {saving ? "Enregistrement..." : "Mettre à jour l'identité"} <Save className="w-5 h-5" />
                    </button>
                 </div>
              </div>

              <div className="bg-blue-50/50 p-8 rounded-[30px] border border-blue-100 flex gap-6">
                 <Info className="w-8 h-8 text-blue-500 shrink-0" />
                 <div>
                    <h4 className="font-black text-blue-900 mb-2 uppercase text-xs tracking-widest">Règles Uber Eats</h4>
                    <ul className="text-sm text-blue-700 space-y-1 font-medium">
                       <li>• Bannière : 2880 x 2304 px (Recommandé)</li>
                       <li>• Logo : Fond transparent, 512 x 512 px minimum</li>
                       <li>• Format : JPG ou PNG uniquement</li>
                    </ul>
                 </div>
              </div>
            </div>
          ) : (
            <div className="p-12 max-w-6xl mx-auto flex flex-col h-full">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Votre Carte</h2>
                    <p className="text-slate-500 font-medium italic">Personnalisez chaque produit pour un maximum de conversions.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newItem = {
                        brand_id: brand.id,
                        title: "Nouveau produit",
                        description: "Une délicieuse description...",
                        category: "Plats Principaux",
                        sub_category: "Signature",
                        selling_price: 12.00,
                        image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                        is_special_offer: false
                      };
                      setBrand({...brand, menu_items: [...(brand.menu_items || []), newItem]});
                    }}
                    className="bg-[#06C167] text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-[#06C167]/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un produit
                  </button>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                  {brand.menu_items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl shadow-slate-200/40 relative group/item">
                       <button 
                        onClick={() => {
                          const newItems = [...brand.menu_items];
                          newItems.splice(idx, 1);
                          setBrand({...brand, menu_items: newItems});
                        }}
                        className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 transition-colors"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>

                       <div className="flex gap-8">
                          <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 shrink-0 relative group/img">
                             <img src={item.image_url} className="w-full h-full object-cover" />
                             <button 
                               onClick={() => handleUploadClick({ type: 'item', index: idx })}
                               className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white"
                             >
                               <Camera className="w-5 h-5" />
                             </button>
                          </div>
                          <div className="flex-1 space-y-4">
                             <div className="flex justify-between items-start">
                                <input 
                                  value={item.title}
                                  onChange={e => {
                                    const newItems = [...brand.menu_items];
                                    newItems[idx].title = e.target.value;
                                    setBrand({...brand, menu_items: newItems});
                                  }}
                                  className="text-xl font-black text-slate-900 bg-transparent outline-none focus:text-[#06C167] w-full"
                                  placeholder="Nom du produit"
                                />
                                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                   <input 
                                     type="number"
                                     value={item.selling_price}
                                     onChange={e => {
                                        const newItems = [...brand.menu_items];
                                        newItems[idx].selling_price = parseFloat(e.target.value);
                                        setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-12 text-right bg-transparent font-black text-[#06C167] outline-none"
                                   />
                                   <span className="text-[#06C167] font-black">€</span>
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <input 
                                  value={item.category}
                                  onChange={e => {
                                    const newItems = [...brand.menu_items];
                                    newItems[idx].category = e.target.value;
                                    setBrand({...brand, menu_items: newItems});
                                  }}
                                  className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-lg outline-none"
                                  placeholder="Catégorie"
                                />
                                <input 
                                  value={item.sub_category || ''}
                                  onChange={e => {
                                    const newItems = [...brand.menu_items];
                                    newItems[idx].sub_category = e.target.value;
                                    setBrand({...brand, menu_items: newItems});
                                  }}
                                  className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-50 px-3 py-1 rounded-lg outline-none"
                                  placeholder="Sous-catégorie"
                                />
                             </div>
                             <textarea 
                               value={item.description}
                               onChange={e => {
                                 const newItems = [...brand.menu_items];
                                 newItems[idx].description = e.target.value;
                                 setBrand({...brand, menu_items: newItems});
                               }}
                               className="w-full text-sm text-slate-500 bg-transparent italic leading-relaxed outline-none border-l-2 border-slate-100 pl-4 py-1 h-20 resize-none"
                               placeholder="Description du produit..."
                             />
                             <div className="flex items-center gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group/offer">
                                   <input 
                                     type="checkbox"
                                     checked={item.is_special_offer}
                                     onChange={e => {
                                        const newItems = [...brand.menu_items];
                                        newItems[idx].is_special_offer = e.target.checked;
                                        setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-4 h-4 rounded border-slate-300 text-[#06C167] focus:ring-[#06C167]"
                                   />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/offer:text-yellow-600 transition-all flex items-center gap-2">
                                      <Tag className="w-3 h-3" /> Offre Spéciale
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
                                      className="flex-1 text-[10px] font-black text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg outline-none border border-yellow-100"
                                      placeholder="Ex: 1 acheté = 1 offert"
                                   />
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 flex gap-6">
                  <button 
                    onClick={saveMenu}
                    disabled={saving}
                    className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest py-5 rounded-[25px] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    Sauvegarder le Menu local <Save className="w-5 h-5" />
                  </button>
                  {uberConnected && (
                    <button 
                      onClick={async () => {
                        const res = await fetch("/api/uber/sync", {
                          method: "POST",
                          body: JSON.stringify({ brandId: brand.id })
                        });
                        const data = await res.json();
                        if (data.success) alert("🚀 Menu synchronisé sur Uber Eats !");
                        else alert("Erreur : " + data.error);
                      }}
                      className="flex-1 bg-[#06C167] text-white font-black uppercase tracking-widest py-5 rounded-[25px] shadow-2xl shadow-[#06C167]/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
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
        .label-pro {
          @apply text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block;
        }
        .input-pro {
          @apply w-full bg-slate-50 p-6 rounded-[25px] border border-slate-100 outline-none focus:ring-2 focus:ring-[#06C167]/20 focus:bg-white transition-all;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  );
}
