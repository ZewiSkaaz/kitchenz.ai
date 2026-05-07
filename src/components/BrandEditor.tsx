"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Trash2, Plus, TrendingUp, Save, X, Image as ImageIcon, 
  Info, AlertCircle, CheckCircle2, Download, ChevronRight, Tag,
  Settings2, Eye, EyeOff, ShieldAlert, BadgeCheck, UtensilsCrossed, Clock, Calendar,
  ChevronDown, ChevronUp, Smartphone, Layout, ChefHat, ShieldCheck, Loader2, Maximize2, ChevronLeft
} from "lucide-react";

interface BrandEditorProps {
  brand: any;
  onClose: () => void;
  onRefresh: () => void;
  uberConnected: boolean;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const getFallbackImage = (category?: string) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("boisson") || cat.includes("drink")) return "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=400&auto=format&fit=crop"; // Boisson rafraîchissante
  if (cat.includes("dessert") || cat.includes("sucré")) return "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop"; // Dessert gourmand
  if (cat.includes("burger") || cat.includes("plat")) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop"; // Burger générique
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"; // Salade/Générique
};
export default function BrandEditor({ brand: initialBrand, onClose, onRefresh, uberConnected }: BrandEditorProps) {
  const [brand, setBrand] = useState(initialBrand);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // Target ID or 'logo'/'banner'
  const [activeTab, setActiveTab] = useState<'identity' | 'menu' | 'ops'>('identity');
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);
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
      business_hours: brand.business_hours,
      uber_store_id: brand.uber_store_id
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
      setToast({ message: "Erreur Supabase: " + (error.message || error.details || "Erreur de synchronisation"), type: 'error' });
    } else {
      onRefresh();
      setToast({ message: "Menu sauvegardé !", type: 'success' });
    }
    setSaving(false);
  };

  const updateSlot = (dayIdx: number, slotIdx: number, field: 'startTime' | 'endTime', value: string) => {
    const newHours = [...(brand.business_hours || [])];
    if (!newHours[dayIdx]) newHours[dayIdx] = { day: dayIdx, slots: [{ startTime: "08:00", endTime: "22:00" }] };
    
    // Migrate old format
    if (newHours[dayIdx].startTime !== undefined) {
      newHours[dayIdx].slots = [{ startTime: newHours[dayIdx].startTime, endTime: newHours[dayIdx].endTime }];
      delete newHours[dayIdx].startTime;
      delete newHours[dayIdx].endTime;
    }
    if (!newHours[dayIdx].slots) newHours[dayIdx].slots = [{ startTime: "08:00", endTime: "22:00" }];
    
    newHours[dayIdx].slots[slotIdx][field] = value;
    setBrand({ ...brand, business_hours: newHours });
  };

  const addSlot = (dayIdx: number) => {
    const newHours = [...(brand.business_hours || [])];
    if (!newHours[dayIdx]) {
      newHours[dayIdx] = { day: dayIdx, slots: [{ startTime: "11:30", endTime: "14:30" }, { startTime: "18:30", endTime: "22:30" }] };
    } else {
      if (newHours[dayIdx].startTime !== undefined) {
        newHours[dayIdx].slots = [{ startTime: newHours[dayIdx].startTime, endTime: newHours[dayIdx].endTime }];
        delete newHours[dayIdx].startTime;
        delete newHours[dayIdx].endTime;
      }
      if (!newHours[dayIdx].slots) newHours[dayIdx].slots = [];
      newHours[dayIdx].slots.push({ startTime: "18:30", endTime: "22:30" });
    }
    setBrand({ ...brand, business_hours: newHours });
  };

  const removeSlot = (dayIdx: number, slotIdx: number) => {
    const newHours = [...(brand.business_hours || [])];
    if (newHours[dayIdx]?.slots) {
      newHours[dayIdx].slots.splice(slotIdx, 1);
      setBrand({ ...brand, business_hours: newHours });
    }
  };

  const sanitizePrice = (val: string) => {
    const cleaned = val.replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const removeItem = (idx: number) => {
    if (!confirm("Supprimer cet article ?")) return;
    const newItems = [...(brand.menu_items || [])];
    newItems.splice(idx, 1);
    setBrand({ ...brand, menu_items: newItems });
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-8 overflow-hidden"
      onClick={onClose}
    >
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
        <input type="file" ref={fileInputRef} onChange={handleFileChange} onClick={e => e.stopPropagation()} className="hidden" accept="image/*" />
        
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
            <button 
              onClick={() => {
                if (activeTab === 'identity') saveIdentity();
                else saveMenu();
              }} 
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'identity') saveIdentity();
                else saveMenu();
              }} 
              disabled={saving}
              className="bg-black text-white px-6 py-2 rounded text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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
                    <img src={brand.background_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop"} className={`w-full h-full object-cover ${uploading === 'banner' ? 'opacity-30' : ''}`} alt="Banner" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                      <button onClick={() => brand.background_url && setFullImage(brand.background_url)} className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-all">
                        <Eye className="w-4 h-4" /> Afficher
                      </button>
                      <button onClick={() => handleUploadClick('banner')} className="bg-[#06C167] text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-[#05a357] transition-all">
                        <Camera className="w-4 h-4" /> Modifier
                      </button>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-10 group/logo">
                    <div className="w-24 h-24 rounded-md border-4 border-white shadow-lg overflow-hidden bg-white relative">
                      <img src={brand.logo_url || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=200&auto=format&fit=crop"} className={`w-full h-full object-cover ${uploading === 'logo' ? 'opacity-30' : ''}`} alt="Logo" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                        <button onClick={() => brand.logo_url && setFullImage(brand.logo_url)} className="p-1.5 bg-white rounded-full text-black hover:bg-gray-100 transition-all">
                           <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleUploadClick('logo')} className="p-1.5 bg-[#06C167] rounded-full text-white hover:bg-[#05a357] transition-all">
                           <Camera className="w-4 h-4" />
                        </button>
                      </div>
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
                <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black text-black tracking-tighter">Éditeur de Menu</h2>
                    <p className="text-xs text-gray-500 font-medium">Configurez vos plats, ajustez vos prix et optimisez votre rentabilité.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newItem = {
                        brand_id: brand.id, title: "Nouveau produit", description_seo: "Ajoutez une description appétissante...", category: "Plat Principal",
                        selling_price: 15, material_cost: 4, net_margin_target: 5, is_available: true, ingredients: [], image_url: ""
                      };
                      setBrand({...brand, menu_items: [...(brand.menu_items || []), newItem]});
                    }}
                    className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-black transition-all"
                  >
                    <Plus className="w-4 h-4" /> Ajouter un article
                  </button>
                </div>

                <div className="space-y-6">
                  {brand.menu_items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#06C167]/30 transition-all group/item shadow-sm relative overflow-hidden">
                       <div className="flex flex-col md:flex-row gap-8">
                          <div className="w-full md:w-40 space-y-4 shrink-0">
                             <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 relative group/img border border-slate-100">
                                <img 
                                  src={item.image_url || getFallbackImage(item.category)} 
                                  className="w-full h-full object-cover transition-transform group-hover/img:scale-110 duration-700" 
                                  alt={item.title} 
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                                   <button onClick={(e) => { e.stopPropagation(); setFullImage(item.image_url || getFallbackImage(item.category)); }} className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-gray-100 transition-all shadow-lg">
                                      <Eye className="w-3.5 h-3.5" /> Afficher
                                   </button>
                                   <button onClick={(e) => { e.stopPropagation(); handleUploadClick({ type: 'item', index: idx }); }} className="flex items-center gap-2 bg-[#06C167] text-white px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-[#05a357] transition-all shadow-lg">
                                      <Camera className="w-3.5 h-3.5" /> Modifier
                                   </button>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <button 
                                  onClick={() => {
                                    const newItems = [...brand.menu_items];
                                    newItems[idx].is_available = !newItems[idx].is_available;
                                    setBrand({...brand, menu_items: newItems});
                                  }}
                                  className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${item.is_available ? 'bg-[#06C167]/5 text-[#06C167] border-[#06C167]/20' : 'bg-red-50 text-red-600 border-red-200'}`}
                                >
                                   {item.is_available ? 'EN VENTE' : 'ÉPUISÉ'}
                                </button>
                                <button onClick={() => removeItem(idx)} className="w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                                   <Trash2 className="w-3 h-3" /> Supprimer
                                </button>
                             </div>
                          </div>

                          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
                             <div className="lg:col-span-8 space-y-5">
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nom du plat</label>
                                   <input 
                                     value={item.title} 
                                     onChange={e => {
                                       const newItems = [...brand.menu_items];
                                       newItems[idx].title = e.target.value;
                                       setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 outline-none focus:text-[#06C167] transition-colors" 
                                   />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description Uber Eats</label>
                                   <textarea 
                                     value={item.description_seo || item.description} 
                                     onChange={e => {
                                       const newItems = [...brand.menu_items];
                                       newItems[idx].description_seo = e.target.value;
                                       newItems[idx].description = e.target.value;
                                       setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-full bg-slate-50/50 border border-transparent hover:border-slate-100 focus:border-[#06C167]/20 rounded-xl px-4 py-3 text-xs text-slate-500 leading-relaxed outline-none min-h-[80px] resize-none italic transition-all" 
                                     placeholder="Décrivez votre plat pour mettre l'eau à la bouche..."
                                   />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ingrédients (clarté client)</label>
                                   <input 
                                     value={item.ingredients?.join(', ')} 
                                     onChange={e => {
                                       const newItems = [...brand.menu_items];
                                       newItems[idx].ingredients = e.target.value.split(',').map(s => s.trim());
                                       setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-slate-400 outline-none italic" 
                                     placeholder="Ex: Bœuf haché, Cheddar fondu, Sauce secrète..."
                                   />
                                </div>
                                <div className="flex flex-wrap gap-4 pt-2">
                                   <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TVA</span>
                                      <select 
                                        value={item.vat_rate} 
                                        onChange={e => {
                                          const newItems = [...brand.menu_items]; newItems[idx].vat_rate = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                        }}
                                        className="bg-transparent text-[10px] font-bold text-slate-600 outline-none"
                                      >
                                         <option value={5.5}>5.5%</option>
                                         <option value={10}>10%</option>
                                         <option value={20}>20%</option>
                                      </select>
                                   </div>
                                </div>
                             </div>

                             <div className="lg:col-span-4 space-y-6">
                                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-900/10">
                                   <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Prix de vente Final (€)</label>
                                   <div className="flex items-center gap-3">
                                      <input 
                                        type="text" 
                                        value={item.selling_price} 
                                        onChange={e => {
                                          const newItems = [...brand.menu_items];
                                          newItems[idx].selling_price = sanitizePrice(e.target.value);
                                          setBrand({...brand, menu_items: newItems});
                                        }}
                                        className="bg-transparent text-3xl font-black text-white w-full outline-none" 
                                      />
                                      <span className="text-2xl font-black text-[#06C167]">€</span>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                      <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Coût Mat.</label>
                                      <p className="text-sm font-black text-slate-600">{item.material_cost} €</p>
                                   </div>
                                   <div className="bg-[#06C167]/5 p-4 rounded-xl border border-[#06C167]/10">
                                      <label className="block text-[8px] font-black uppercase tracking-widest text-[#06C167]/60 mb-1">Marge Nette</label>
                                      <p className="text-sm font-black text-[#06C167]">{item.net_margin_target} €</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-20 pb-40">
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Opérations Uber</h2>
                   <p className="text-slate-500 font-bold text-sm leading-relaxed">Paramètres critiques pour l&apos;algorithme Marketplace.</p>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 space-y-8">
 
                   <div className="space-y-6 mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="w-5 h-5 text-slate-900" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Identifiant Uber Eats</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Requis pour la synchronisation automatique du menu</p>
                      <input 
                        value={brand.uber_store_id || ""} 
                        onChange={e => setBrand({...brand, uber_store_id: e.target.value})} 
                        placeholder="Ex: 5743c70e-..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#06C167] transition-all"
                      />
                   </div>

                   <div className="flex items-center gap-8 mb-10">
                      <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-[#06C167]">
                        <Clock className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Horaires de Disponibilité</h3>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Calculés en heure locale du restaurant</p>
                      </div>
                   </div>

                    <div className="grid gap-4">
                      {DAYS.map((day, i) => {
                        const dayData = brand.business_hours?.[i] || {};
                        const slots = dayData.slots || (dayData.startTime ? [{ startTime: dayData.startTime, endTime: dayData.endTime }] : []);
                        
                        return (
                          <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 gap-4">
                             <span className="font-bold text-slate-900 text-lg tracking-tight w-32">{day}</span>
                             <div className="flex-1 space-y-3">
                                {slots.length === 0 && <span className="text-sm font-bold text-slate-400">Fermé</span>}
                                {slots.map((slot: any, sIdx: number) => (
                                  <div key={sIdx} className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                       <span className="text-[9px] font-black text-slate-300">OUVERTURE</span>
                                       <input 
                                         type="time" 
                                         value={slot.startTime || "08:00"} 
                                         onChange={e => updateSlot(i, sIdx, 'startTime', e.target.value)}
                                         className="font-bold text-base text-slate-900 outline-none" 
                                       />
                                    </div>
                                    <div className="w-4 h-px bg-slate-200" />
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                       <span className="text-[9px] font-black text-slate-300">FERMETURE</span>
                                       <input 
                                         type="time" 
                                         value={slot.endTime || "22:00"} 
                                         onChange={e => updateSlot(i, sIdx, 'endTime', e.target.value)}
                                         className="font-bold text-base text-slate-900 outline-none" 
                                       />
                                    </div>
                                    <button onClick={() => removeSlot(i, sIdx)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button onClick={() => addSlot(i)} className="text-xs font-bold text-[#06C167] hover:text-[#05a357] flex items-center gap-1 mt-2">
                                  <Plus className="w-3 h-3" /> Ajouter un service
                                </button>
                             </div>
                          </div>
                        );
                      })}
                   </div>

                    <button onClick={saveIdentity} disabled={saving} className="w-full py-4 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                       {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                       Enregistrer les Paramètres
                    </button>

                    <div className="pt-12 border-t border-red-100 mt-12">
                       <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-4">
                          <div className="flex items-center gap-3 text-red-600">
                             <ShieldAlert className="w-6 h-6" />
                             <h4 className="text-lg font-black uppercase tracking-tight">Zone de Danger</h4>
                          </div>
                          <p className="text-sm text-red-400 font-medium">La suppression d'une marque est irréversible. Tous les articles et photos associés seront définitivement effacés.</p>
                          <button 
                            onClick={async () => {
                              if (!confirm("SUPPRIMER DÉFINITIVEMENT CETTE MARQUE ? Cette action effacera TOUT (Menu, Photos, Config).")) return;
                              setSaving(true);
                              try {
                                // 1. Clean menu items
                                await supabase.from("menu_items").delete().eq("brand_id", brand.id);
                                // 2. Delete brand
                                const { error } = await supabase.from("brands").delete().eq("id", brand.id);
                                if (error) throw error;
                                
                                setToast({ message: "Marque supprimée !", type: 'success' });
                                setTimeout(() => {
                                  onRefresh();
                                  onClose();
                                }, 1500);
                              } catch (e: any) {
                                setToast({ message: "Erreur: " + e.message, type: 'error' });
                              } finally {
                                setSaving(false);
                              }
                            }}
                            disabled={saving}
                            className="bg-white border-2 border-red-500 text-red-500 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                             {saving ? "Suppression..." : "Supprimer la Marque"}
                          </button>
                       </div>
                    </div>
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
                         <img src={brand.background_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Banner" />
                         <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                           <ChevronLeft className="w-6 h-6" />
                         </div>
                      </div>
                      
                      {/* Brand Header */}
                      <div className="bg-white p-6 -mt-10 mx-4 rounded-3xl shadow-xl relative z-10 space-y-3">
                         <div className="flex justify-between items-start">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{brand.name}</h4>
                            <img src={brand.logo_url || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=200&auto=format&fit=crop"} className="w-14 h-14 rounded-2xl shadow-lg border-2 border-white -mt-10 object-cover" alt="Logo" />
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
                                    <p className="text-slate-400 text-[10px] leading-tight line-clamp-2 italic">{item.description_seo}</p>
                                    <span className="text-sm font-black text-slate-900 mt-2 block">{item.selling_price} €</span>
                                 </div>
                                 <div className="w-24 h-24 rounded-xl overflow-hidden shadow-inner shrink-0 relative cursor-zoom-in" onClick={() => item.image_url && setFullImage(item.image_url)}>
                                    <img src={item.image_url || getFallbackImage(item.category)} className="w-full h-full object-cover" alt={item.title} />
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
                onClick={activeTab === 'identity' || activeTab === 'ops' ? saveIdentity : saveMenu} 
                disabled={saving} 
                className="btn-primary !px-8 !py-4 shadow-xl shadow-[#06C167]/20 flex items-center gap-3"
             >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {activeTab === 'identity' || activeTab === 'ops' ? 'Sauvegarder' : 'Sauvegarder Menu'}
             </button>
             {uberConnected && activeTab === 'menu' && (
               <button 
                onClick={async () => {
                  setSaving(true);
                   const res = await fetch("/api/uber/sync", { method: "POST", body: JSON.stringify({ brandId: brand.id }) });
                   const data = await res.json();
                   setSaving(false);
                   if (data.success) setToast({ message: "🚀 Menu publié avec succès !", type: 'success' });
                   else setToast({ message: `⚠️ ${data.error || "Erreur de synchro"}`, type: 'error' });
                 }}
                className="bg-[#06C167] text-white text-xs font-bold px-8 py-4 rounded-full hover:bg-[#05a357] transition-all flex items-center gap-2 shadow-xl shadow-[#06C167]/10"
               >
                 🚀 Publier sur Uber Eats
               </button>
             )}
          </div>
        </div>
        
        {/* Lightbox Modal */}
        <AnimatePresence>
          {fullImage && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-20 cursor-zoom-out"
              onClick={() => setFullImage(null)}
            >
              <button onClick={() => setFullImage(null)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-all">
                <X className="w-10 h-10" />
              </button>
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                src={fullImage} 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
                alt="Original size" 
              />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                Image Haute Résolution
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

