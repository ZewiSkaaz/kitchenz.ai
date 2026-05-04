"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Trash2, Plus, TrendingUp, Save, X, Image as ImageIcon, 
  Info, AlertCircle, CheckCircle2, Download, ChevronRight, Tag,
  Settings2, Eye, EyeOff, ShieldAlert, BadgeCheck, UtensilsCrossed, Clock, Calendar,
  ChevronDown, ChevronUp, Smartphone, Layout, ChefHat, ShieldCheck, Loader2
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
  const [uploading, setUploading] = useState<string | null>(null); // Target ID or 'logo'/'banner'
  const [activeTab, setActiveTab] = useState<'identity' | 'menu' | 'ops'>('identity');
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'logo' | 'banner' | { type: 'item', index: number } | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUploadClick = (target: any) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    if (file.size > 5 * 1024 * 1024) { 
      setToast({ message: "L'image est trop lourde (Max 5MB)", type: 'error' });
      return; 
    }

    const targetKey = typeof uploadTarget === 'string' ? uploadTarget : `item-${uploadTarget.index}`;
    setUploading(targetKey);

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
      setToast({ message: "Image mise à jour !", type: 'success' });
    } catch (error: any) { 
      setToast({ message: error.message, type: 'error' });
    } finally {
      setUploading(null);
    }
  };

  const validateMenu = () => {
    for (const item of brand.menu_items) {
      if (!item.title || item.title.trim() === "") return `Le produit "${item.title || 'sans nom'}" doit avoir un titre.`;
      if (isNaN(item.selling_price) || item.selling_price < 0) return `Le prix du produit "${item.title}" est invalide.`;
    }
    return null;
  };

  const saveIdentity = async () => {
    setSaving(true);
    const { error } = await supabase.from("brands").update({
      name: brand.name, culinary_style: brand.culinary_style,
      tagline: brand.tagline, storytelling: brand.storytelling,
      logo_url: brand.logo_url, background_url: brand.background_url,
      business_hours: brand.business_hours
    }).eq("id", brand.id);
    
    if (error) setToast({ message: "Erreur lors de la sauvegarde", type: 'error' });
    else {
      onRefresh();
      setToast({ message: "Identité sauvegardée avec succès !", type: 'success' });
    }
    setSaving(false);
  };

  const saveMenu = async () => {
    const errorMsg = validateMenu();
    if (errorMsg) {
      setToast({ message: errorMsg, type: 'error' });
      return;
    }

    setSaving(true);
    const menuToSave = brand.menu_items?.map((item: any) => ({
      ...item,
      brand_id: brand.id
    }));

    const { error } = await supabase.from("menu_items").upsert(menuToSave, { onConflict: 'id' });
    if (error) {
      console.error(error);
      setToast({ message: "Erreur de synchronisation", type: 'error' });
    } else {
      onRefresh();
      setToast({ message: "Menu sauvegardé !", type: 'success' });
    }
    setSaving(false);
  };

  const updateHours = (dayIdx: number, field: 'startTime' | 'endTime', value: string) => {
    const newHours = [...(brand.business_hours || [])];
    if (!newHours[dayIdx]) newHours[dayIdx] = { day: dayIdx, startTime: "08:00", endTime: "22:00" };
    newHours[dayIdx][field] = value;
    setBrand({ ...brand, business_hours: newHours });
  };

  const sanitizePrice = (val: string) => {
    const cleaned = val.replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-8 overflow-hidden"
      onClick={onClose}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* Premium Notification (Toast) */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-[300] px-8 py-4 rounded-[30px] shadow-2xl flex items-center gap-4 border-2 ${toast.type === 'success' ? 'bg-white border-[#06C167] text-[#06C167]' : 'bg-white border-red-500 text-red-500'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span className="font-black uppercase text-[11px] tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-[1400px] h-full md:h-[90vh] rounded-none md:rounded-lg overflow-hidden flex flex-col shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 z-[60]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-black uppercase tracking-tight">Gestionnaire de menu</h3>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden md:block" />
            <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-none">
               <button onClick={() => setActiveTab('identity')} className={`px-3 md:px-4 py-2 rounded text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'identity' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'}`}>Identité</button>
               <button onClick={() => setActiveTab('menu')} className={`px-3 md:px-4 py-2 rounded text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'menu' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'}`}>Articles</button>
               <button onClick={() => setActiveTab('ops')} className={`px-3 md:px-4 py-2 rounded text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'ops' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'}`}>Paramètres</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all ${showPreview ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {showPreview ? <Layout className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              {showPreview ? 'Éditeur' : 'Aperçu Uber'}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-black">
               <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 transition-all ${showPreview ? 'opacity-40 blur-sm pointer-events-none' : ''}`}>
            {activeTab === 'identity' ? (
              <div className="max-w-5xl mx-auto space-y-16 pb-32">
                <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                  <div className="h-64 w-full bg-gray-100">
                    <img src={brand.background_url} className={`w-full h-full object-cover ${uploading === 'banner' ? 'opacity-30' : ''}`} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <button onClick={() => handleUploadClick('banner')} className="bg-white px-6 py-2 rounded font-bold text-xs shadow-lg flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Changer l'image de couverture
                      </button>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-10 group/logo">
                    <div className="w-24 h-24 rounded-md border-4 border-white shadow-lg overflow-hidden bg-white relative">
                      <img src={brand.logo_url} className={`w-full h-full object-cover ${uploading === 'logo' ? 'opacity-30' : ''}`} />
                      <button onClick={() => handleUploadClick('logo')} className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center text-white">
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 grid md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Nom de l&apos;établissement</label>
                      <input value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-base font-bold outline-none focus:border-[#06C167] focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Slogan marketing</label>
                      <input value={brand.tagline} onChange={e => setBrand({...brand, tagline: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm font-medium outline-none focus:border-[#06C167] focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Catégorie de cuisine</label>
                      <input value={brand.culinary_style} onChange={e => setBrand({...brand, culinary_style: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#06C167] text-sm font-bold outline-none focus:border-[#06C167] focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Présentation (Storytelling)</label>
                      <textarea value={brand.storytelling} onChange={e => setBrand({...brand, storytelling: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 text-sm leading-relaxed outline-none focus:border-[#06C167] focus:bg-white transition-all min-h-[160px] resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'menu' ? (
              <div className="max-w-6xl mx-auto space-y-12 pb-40">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-black">Articles du menu</h2>
                    <p className="text-xs text-gray-500 font-medium">Gérez vos plats, prix et disponibilités.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newItem = {
                        brand_id: brand.id, title: "Nouveau produit", description: "Description...", category: "Plats",
                        selling_price: 10, vat_rate: 10, is_available: true, options: [], sub_category: "Général", image_url: ""
                      };
                      setBrand({...brand, menu_items: [...(brand.menu_items || []), newItem]});
                    }}
                    className="bg-[#06C167] text-white text-xs font-bold px-4 py-2 rounded-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un article
                  </button>
                </div>

                <div className="grid gap-8">
                  {brand.menu_items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all group/item">
                       <div className="flex gap-6">
                          <div className="w-24 space-y-3 shrink-0">
                             <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 relative group/img cursor-pointer border border-gray-200">
                                <img src={item.image_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white">
                                   <Camera className="w-5 h-5" />
                                </div>
                                <button onClick={() => handleUploadClick({ type: 'item', index: idx })} className="absolute inset-0 z-20" />
                             </div>
                             <button 
                                onClick={() => {
                                  const newItems = [...brand.menu_items];
                                  newItems[idx].is_available = !newItems[idx].is_available;
                                  setBrand({...brand, menu_items: newItems});
                                }}
                                className={`w-full py-1.5 rounded text-[10px] font-bold uppercase transition-all ${item.is_available ? 'bg-green-50 text-[#06C167]' : 'bg-red-50 text-red-500'}`}
                             >
                                {item.is_available ? 'Disponible' : 'Indisponible'}
                             </button>
                          </div>

                          <div className="flex-1 space-y-10">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-6">
                                   <input value={item.title} onChange={e => {
                                      const newItems = [...brand.menu_items]; newItems[idx].title = e.target.value; setBrand({...brand, menu_items: newItems});
                                   }} className="text-xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#06C167] focus:bg-white w-full transition-all" />
                                   
                                   <div className="flex flex-wrap gap-4">
                                      <input value={item.category} onChange={e => {
                                        const newItems = [...brand.menu_items]; newItems[idx].category = e.target.value; setBrand({...brand, menu_items: newItems});
                                      }} className="text-[10px] font-bold uppercase text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md outline-none border border-gray-100" placeholder="Categorie" />
                                      <input value={item.sub_category || ''} onChange={e => {
                                        const newItems = [...brand.menu_items]; newItems[idx].sub_category = e.target.value; setBrand({...brand, menu_items: newItems});
                                      }} className="text-[10px] font-bold uppercase text-blue-500 bg-blue-50 px-3 py-1.5 rounded-md outline-none border border-blue-100" placeholder="Sous-Categorie" />
                                      <div className="flex items-center gap-3 bg-yellow-50 px-6 py-3 rounded-2xl border border-yellow-100">
                                         <span className="text-[11px] font-black text-yellow-600">TVA</span>
                                         <select 
                                           value={item.vat_rate} 
                                           onChange={e => {
                                             const newItems = [...brand.menu_items]; newItems[idx].vat_rate = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                           }}
                                           className="bg-transparent text-[10px] font-bold text-gray-600 outline-none"
                                         >
                                            <option value={5.5}>5.5%</option>
                                            <option value={10}>10%</option>
                                            <option value={20}>20%</option>
                                         </select>
                                      </div>
                                   </div>
                                </div>
                                <div className="bg-slate-900 p-8 rounded-[35px] text-white flex items-center gap-4 shadow-2xl">
                                   <input 
                                      type="text" 
                                      value={item.selling_price} 
                                      onChange={e => {
                                        const newItems = [...brand.menu_items]; 
                                        newItems[idx].selling_price = sanitizePrice(e.target.value); 
                                        setBrand({...brand, menu_items: newItems});
                                      }} 
                                      className="w-24 text-right bg-transparent font-black text-4xl outline-none text-[#06C167]" 
                                   />
                                   <span className="text-3xl font-black text-[#06C167]">€</span>
                                </div>
                             </div>

                             <textarea value={item.description} onChange={e => {
                                const newItems = [...brand.menu_items]; newItems[idx].description = e.target.value; setBrand({...brand, menu_items: newItems});
                             }} className="w-full text-xs text-gray-500 bg-gray-50 p-3 rounded outline-none border border-transparent focus:border-gray-200 transition-all h-20 resize-none" placeholder="Description de l'article..." />

                             <div className="flex gap-4 items-center pt-4 border-t border-gray-50">
                                <button 
                                  onClick={() => setEditingItemIdx(editingItemIdx === idx ? null : idx)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${editingItemIdx === idx ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                  {editingItemIdx === idx ? <ChevronUp className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                                  Options
                                </button>
                                
                                <label className="flex items-center gap-2 cursor-pointer p-2 bg-orange-50 rounded border border-orange-100">
                                   <input 
                                     type="checkbox"
                                     checked={item.is_special_offer}
                                     onChange={e => {
                                        const newItems = [...brand.menu_items];
                                        newItems[idx].is_special_offer = e.target.checked;
                                        setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-4 h-4 rounded border-orange-300 text-orange-600"
                                   />
                                   <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">Offre</span>
                                </label>
                                
                                {item.is_special_offer && (
                                  <input 
                                    value={item.special_offer_text || ''}
                                    onChange={e => {
                                      const newItems = [...brand.menu_items];
                                      newItems[idx].special_offer_text = e.target.value;
                                      setBrand({...brand, menu_items: newItems});
                                    }}
                                    className="flex-1 text-[10px] font-bold text-orange-900 bg-white px-3 py-2 rounded border border-orange-200 outline-none"
                                    placeholder="Ex: 1 acheté = 1 offert"
                                  />
                                )}

                                <div className="flex-1" />
                                <button 
                                  onClick={() => {
                                    if(confirm("Supprimer cet article ?")) {
                                      const newItems = [...brand.menu_items]; newItems.splice(idx, 1); setBrand({...brand, menu_items: newItems});
                                    }
                                  }}
                                  className="p-2 text-gray-300 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </div>

                             <AnimatePresence>
                                {editingItemIdx === idx && (
                                   <motion.div 
                                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden bg-gray-50 p-6 rounded-md border border-gray-100 mt-4 space-y-6"
                                    >
                                       <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                          <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Groupes d'options</h4>
                                          <button 
                                            onClick={() => {
                                              const newItems = [...brand.menu_items];
                                              const newGroup = { name: "Options", min: 0, max: 1, modifiers: [{ name: "Standard", price: 0 }] };
                                              newItems[idx].options = [...(newItems[idx].options || []), newGroup];
                                              setBrand({...brand, menu_items: newItems});
                                            }}
                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                          >
                                             + Ajouter un groupe
                                          </button>
                                       </div>
                                       <div className="grid gap-6">
                                          {(item.options || []).map((group: any, gIdx: number) => (
                                             <div key={gIdx} className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                                <div className="flex justify-between items-center mb-6">
                                                   <div className="flex items-center gap-4">
                                                      <input value={group.name} onChange={e => {
                                                         const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                      }} className="font-bold text-sm text-black outline-none w-48" />
                                                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                        Min: <input type="number" value={group.min} onChange={e => {
                                                          const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].min = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                        }} className="w-8 bg-gray-50 border border-gray-100 p-1" />
                                                        Max: <input type="number" value={group.max} onChange={e => {
                                                          const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].max = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                        }} className="w-8 bg-gray-50 border border-gray-100 p-1" />
                                                      </div>
                                                   </div>
                                                   <button onClick={() => {
                                                      const newItems = [...brand.menu_items]; newItems[idx].options.splice(gIdx, 1); setBrand({...brand, menu_items: newItems});
                                                   }} className="text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                   {group.modifiers.map((mod: any, mIdx: number) => (
                                                      <div key={mIdx} className="flex items-center gap-3 bg-gray-50 p-3 rounded border border-gray-100">
                                                         <input value={mod.name} onChange={e => {
                                                            const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers[mIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                         }} className="flex-1 text-[11px] font-bold bg-transparent outline-none" />
                                                         <div className="flex items-center gap-1 text-[#06C167] font-bold">
                                                            <span className="text-[10px]">+</span>
                                                            <input 
                                                               type="text" 
                                                               value={mod.price} 
                                                               onChange={e => {
                                                                 const newItems = [...brand.menu_items]; 
                                                                 newItems[idx].options[gIdx].modifiers[mIdx].price = sanitizePrice(e.target.value); 
                                                                 setBrand({...brand, menu_items: newItems});
                                                               }} 
                                                               className="w-10 text-right outline-none text-[11px] bg-transparent" 
                                                            />
                                                            <span className="text-[10px]">€</span>
                                                         </div>
                                                         <button onClick={() => {
                                                            const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers.splice(mIdx, 1); setBrand({...brand, menu_items: newItems});
                                                         }} className="text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                      </div>
                                                   ))}
                                                   <button 
                                                     onClick={() => {
                                                       const newItems = [...brand.menu_items];
                                                       newItems[idx].options[gIdx].modifiers.push({ name: "Option", price: 0 });
                                                       setBrand({...brand, menu_items: newItems});
                                                     }}
                                                     className="p-3 border border-dashed border-gray-300 rounded text-[10px] font-bold text-gray-400 hover:border-black hover:text-black transition-all"
                                                   >
                                                      + Ajouter un choix
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

                {/* Ancien bouton supprimé car doublon avec la barre globale */}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-20 pb-40">
                <div className="space-y-4">
                   <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Opérations Uber</h2>
                   <p className="text-slate-500 font-bold text-xl leading-relaxed italic">Paramètres critiques pour l&apos;algorithme Marketplace.</p>
                </div>

                <div className="bg-white p-16 rounded-[60px] shadow-2xl border border-slate-50 space-y-12">
                   <div className="flex items-center gap-8 mb-10">
                      <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-[#06C167]">
                        <Clock className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Horaires de Disponibilité</h3>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Calculés en heure locale du restaurant</p>
                      </div>
                   </div>

                   <div className="grid gap-6">
                      {DAYS.map((day, i) => (
                        <div key={i} className="flex items-center justify-between p-10 bg-slate-50 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500">
                           <span className="font-black text-slate-900 text-xl tracking-tight w-40">{day}</span>
                           <div className="flex items-center gap-10">
                              <div className="flex items-center gap-4 bg-white p-6 rounded-[25px] shadow-inner border border-slate-100">
                                 <span className="text-[10px] font-black text-slate-300">OUVERTURE</span>
                                 <input 
                                   type="time" 
                                   value={brand.business_hours?.[i]?.startTime || "08:00"} 
                                   onChange={e => updateHours(i, 'startTime', e.target.value)}
                                   className="font-black text-2xl text-slate-900 outline-none" 
                                 />
                              </div>
                              <div className="w-10 h-1 bg-slate-200 rounded-full" />
                              <div className="flex items-center gap-4 bg-white p-6 rounded-[25px] shadow-inner border border-slate-100">
                                 <span className="text-[10px] font-black text-slate-300">FERMETURE</span>
                                 <input 
                                   type="time" 
                                   value={brand.business_hours?.[i]?.endTime || "22:00"} 
                                   onChange={e => updateHours(i, 'endTime', e.target.value)}
                                   className="font-black text-2xl text-slate-900 outline-none" 
                                 />
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <button onClick={saveIdentity} disabled={saving} className="w-full py-4 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Enregistrer les Paramètres
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Uber Preview Overlay */}
          <AnimatePresence>
            {showPreview && (
              <motion.div 
                initial={{ x: 500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 500, opacity: 0 }}
                className="w-[500px] bg-slate-900 border-l border-white/10 z-[70] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] p-12 overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-16">
                  <h3 className="text-white font-black uppercase tracking-[0.4em] text-xs">Aperçu Client Uber</h3>
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-[#06C167] rounded-full animate-pulse" />
                     <span className="text-[#06C167] text-[10px] font-black uppercase">Live Preview</span>
                  </div>
                </div>

                {/* Smartphone Simulator */}
                <div className="w-full bg-white rounded-[60px] overflow-hidden shadow-2xl aspect-[9/19] border-[12px] border-slate-800 relative">
                   <div className="absolute top-0 inset-x-0 h-10 bg-black flex items-center justify-center">
                      <div className="w-20 h-4 bg-slate-900 rounded-full" />
                   </div>
                   
                   <div className="h-full overflow-y-auto bg-[#F6F6F6] pt-10 pb-20">
                      {/* Banner */}
                      <div className="h-48 w-full relative">
                         <img src={brand.background_url} className="w-full h-full object-cover" />
                         <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                           <ChevronLeft className="w-6 h-6" />
                         </div>
                      </div>
                      
                      {/* Brand Header */}
                      <div className="bg-white p-6 -mt-10 mx-4 rounded-3xl shadow-xl relative z-10 space-y-3">
                         <div className="flex justify-between items-start">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{brand.name}</h4>
                            <img src={brand.logo_url} className="w-14 h-14 rounded-2xl shadow-lg border-2 border-white -mt-10" />
                         </div>
                         <p className="text-slate-500 text-sm font-medium">{brand.culinary_style} • {brand.tagline}</p>
                         <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
                            <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full">⭐ 4.8 (Expert)</span>
                            <span className="text-[10px] font-black bg-[#06C167]/10 text-[#06C167] px-3 py-1 rounded-full">25-35 MIN</span>
                         </div>
                      </div>

                      {/* Menu List */}
                      <div className="p-6 space-y-8">
                         <h5 className="text-lg font-black text-slate-900 uppercase tracking-widest border-b-4 border-[#06C167] w-fit pb-1">Populaires</h5>
                         <div className="space-y-4">
                            {brand.menu_items?.filter((i:any) => i.is_available).slice(0, 5).map((item: any, i: number) => (
                              <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                 <div className="flex-1 space-y-1">
                                    <h6 className="font-black text-slate-900 text-sm leading-tight">{item.title}</h6>
                                    <p className="text-slate-400 text-[10px] leading-tight line-clamp-2 italic">{item.description}</p>
                                    <span className="text-sm font-black text-slate-900 mt-2 block">{item.selling_price} €</span>
                                 </div>
                                 <div className="w-24 h-24 rounded-xl overflow-hidden shadow-inner shrink-0 relative">
                                    <img src={item.image_url} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                       <Plus className="w-4 h-4 text-[#06C167]" />
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-16 space-y-6">
                   <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Conseils Heuristiques (Hugging Face)</h4>
                   <ul className="space-y-4">
                      <li className="flex gap-4 text-xs text-white/40 italic font-medium leading-relaxed">
                         <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                         Les images produits ont un ratio 4:3 optimal pour Uber.
                      </li>
                      <li className="flex gap-4 text-xs text-white/40 italic font-medium leading-relaxed">
                         <div className="w-2 h-2 bg-[#06C167] rounded-full mt-1.5 shrink-0" />
                         Vos descriptions marketing sont jugees &quot;Hautement Appetantes&quot; par l&apos;IA.
                      </li>
                   </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unified Action Bar - FIXED at bottom */}
        <div className="px-10 py-6 bg-white border-t border-gray-100 flex justify-between items-center z-[70] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 text-gray-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Modifications en attente</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onClose} className="px-8 py-3 text-xs font-bold text-gray-500 hover:text-black transition-all uppercase tracking-widest">Annuler</button>
             <button 
                onClick={activeTab === 'identity' ? saveIdentity : saveMenu} 
                disabled={saving} 
                className="btn-primary !px-8 !py-4 shadow-xl shadow-[#06C167]/20 flex items-center gap-3"
             >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {activeTab === 'identity' ? 'Sauvegarder' : 'Sauvegarder Menu'}
             </button>
             {uberConnected && activeTab === 'menu' && (
               <button 
                onClick={async () => {
                  setSaving(true);
                  const res = await fetch("/api/uber/sync", { method: "POST", body: JSON.stringify({ brandId: brand.id }) });
                  const data = await res.json();
                  setSaving(false);
                  if (data.success) setToast({ message: "🚀 Publié !", type: 'success' });
                  else setToast({ message: "⚠️ Erreur Uber", type: 'error' });
                }}
                className="bg-[#06C167] text-white text-xs font-bold px-8 py-4 rounded-full hover:bg-[#05a357] transition-all flex items-center gap-2 shadow-xl shadow-[#06C167]/10"
               >
                 🚀 Publier sur Uber Eats
               </button>
             )}
          </div>
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E2E2; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </motion.div>
  );
}

function ChevronLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  )
}
