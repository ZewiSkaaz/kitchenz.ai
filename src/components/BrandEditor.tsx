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
    const { error } = await supabase.from("menu_items").upsert(brand.menu_items);
    if (error) setToast({ message: "Erreur de synchronisation base de données", type: 'error' });
    else setToast({ message: "Menu synchronisé en local !", type: 'success' });
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
      className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 overflow-hidden"
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
        initial={{ scale: 0.9, y: 40, rotateX: 10 }} animate={{ scale: 1, y: 0, rotateX: 0 }}
        className="bg-[#fcfcfc] w-full max-w-[1600px] h-full max-h-[92vh] rounded-[60px] overflow-hidden flex flex-col shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] border border-white/20 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-12 py-8 bg-white border-b border-slate-100 z-[60]">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
                <ChefHat className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Kitchenz Studio</h3>
                <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Audit Pro V2.2</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <div className="flex bg-slate-50 p-1.5 rounded-[22px] border border-slate-100">
               <button onClick={() => setActiveTab('identity')} className={`px-8 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'identity' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Identité</button>
               <button onClick={() => setActiveTab('menu')} className={`px-8 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Menu Expert</button>
               <button onClick={() => setActiveTab('ops')} className={`px-8 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'ops' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>Operations</button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${showPreview ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {showPreview ? <Layout className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              {showPreview ? 'Vue Studio' : 'Preview Uber'}
            </button>
            <button onClick={onClose} className="p-4 bg-slate-50 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
               <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-12 transition-all duration-700 ${showPreview ? 'opacity-40 pointer-events-none scale-95 blur-sm' : 'opacity-100'}`}>
            {activeTab === 'identity' ? (
              <div className="max-w-5xl mx-auto space-y-16 pb-32">
                <div className="relative group rounded-[50px] overflow-hidden shadow-2xl border-4 border-white">
                  <div className="h-[450px] w-full bg-slate-100">
                    <img src={brand.background_url} className={`w-full h-full object-cover ${uploading === 'banner' ? 'opacity-30' : ''}`} />
                    {uploading === 'banner' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-[#06C167] animate-spin" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                      <button onClick={() => handleUploadClick('banner')} className="bg-white px-10 py-4 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl hover:scale-110 transition-all">
                        <Camera className="w-5 h-5" /> Changer la Bannière
                      </button>
                    </div>
                  </div>
                  <div className="absolute -bottom-16 left-16 group/logo">
                    <div className="w-48 h-48 rounded-[45px] border-[12px] border-white shadow-2xl overflow-hidden bg-white relative">
                      <img src={brand.logo_url} className={`w-full h-full object-cover ${uploading === 'logo' ? 'opacity-30' : ''}`} />
                      {uploading === 'logo' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-[#06C167] animate-spin" />
                        </div>
                      )}
                      <button onClick={() => handleUploadClick('logo')} className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-all flex items-center justify-center text-white backdrop-blur-sm">
                        <Camera className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-24 grid md:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    <div className="field-group-v3">
                      <label>Nom de la Marque</label>
                      <input value={brand.name} onChange={e => setBrand({...brand, name: e.target.value})} className="text-4xl font-black tracking-tighter" />
                    </div>
                    <div className="field-group-v3">
                      <label>Tagline / Accroche</label>
                      <input value={brand.tagline} onChange={e => setBrand({...brand, tagline: e.target.value})} className="text-xl font-medium text-slate-500 italic" />
                    </div>
                    <div className="field-group-v3">
                      <label>Cuisine de Reference</label>
                      <input value={brand.culinary_style} onChange={e => setBrand({...brand, culinary_style: e.target.value})} className="text-[#06C167] font-black uppercase tracking-widest" />
                    </div>
                  </div>
                  <div className="space-y-10">
                    <div className="field-group-v3">
                      <label>Storytelling & Vision Agentic</label>
                      <textarea value={brand.storytelling} onChange={e => setBrand({...brand, storytelling: e.target.value})} className="min-h-[280px] text-lg leading-relaxed italic" />
                    </div>
                    <button onClick={saveIdentity} disabled={saving} className="btn-v3-primary w-full py-8 text-lg">
                      {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Valider l\'Identité'} <BadgeCheck className="ml-4 w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'menu' ? (
              <div className="max-w-6xl mx-auto space-y-12 pb-40">
                <div className="flex justify-between items-end mb-16">
                  <div className="space-y-2">
                    <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase">Menu Expert</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#06C167]" /> Données isolées & sécurisées (RLS Active)
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const newItem = {
                        brand_id: brand.id, title: "Nouveau produit", description: "Description...", category: "Plats",
                        selling_price: 10, vat_rate: 10, is_available: true, options: [], sub_category: "Signature", image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                      };
                      setBrand({...brand, menu_items: [...(brand.menu_items || []), newItem]});
                    }}
                    className="btn-v3-success px-12 py-6 rounded-[30px]"
                  >
                    <Plus className="w-6 h-6" /> Ajouter un Plat
                  </button>
                </div>

                <div className="grid gap-8">
                  {brand.menu_items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-12 rounded-[55px] border border-slate-100 shadow-[0_15px_50px_-10px_rgba(0,0,0,0.03)] hover:shadow-2xl transition-all duration-700 group/item relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover/item:scale-150 transition-all duration-1000 opacity-20" />
                       <div className="flex gap-14 relative z-10">
                          <div className="w-64 space-y-6 shrink-0">
                             <div className="w-full h-64 rounded-[45px] overflow-hidden bg-slate-100 relative group/img cursor-pointer border-4 border-slate-50 shadow-inner">
                                <img src={item.image_url} className={`w-full h-full object-cover ${uploading === `item-${idx}` ? 'opacity-30' : ''}`} />
                                {uploading === `item-${idx}` && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-[#06C167] animate-spin" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white backdrop-blur-sm">
                                   <Camera className="w-10 h-10" />
                                </div>
                                <button onClick={() => handleUploadClick({ type: 'item', index: idx })} className="absolute inset-0 z-20" />
                             </div>
                             <div className="flex flex-col gap-3">
                                <button 
                                  onClick={() => {
                                    const newItems = [...brand.menu_items];
                                    newItems[idx].is_available = !newItems[idx].is_available;
                                    setBrand({...brand, menu_items: newItems});
                                  }}
                                  className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${item.is_available ? 'bg-green-50 text-[#06C167] border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}
                                >
                                  {item.is_available ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                  {item.is_available ? 'Actif sur Uber' : 'Epuisé'}
                                </button>
                             </div>
                          </div>

                          <div className="flex-1 space-y-10">
                             <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-6">
                                   <input value={item.title} onChange={e => {
                                      const newItems = [...brand.menu_items]; newItems[idx].title = e.target.value; setBrand({...brand, menu_items: newItems});
                                   }} className="text-5xl font-black text-slate-900 bg-transparent outline-none focus:text-[#06C167] w-full tracking-tighter" />
                                   
                                   <div className="flex flex-wrap gap-4">
                                      <input value={item.category} onChange={e => {
                                        const newItems = [...brand.menu_items]; newItems[idx].category = e.target.value; setBrand({...brand, menu_items: newItems});
                                      }} className="text-[11px] font-black uppercase text-slate-500 bg-slate-50 px-6 py-3 rounded-2xl outline-none border border-slate-100" placeholder="Categorie" />
                                      <input value={item.sub_category || ''} onChange={e => {
                                        const newItems = [...brand.menu_items]; newItems[idx].sub_category = e.target.value; setBrand({...brand, menu_items: newItems});
                                      }} className="text-[11px] font-black uppercase text-indigo-500 bg-indigo-50 px-6 py-3 rounded-2xl outline-none border border-indigo-100" placeholder="Sous-Categorie" />
                                      <div className="flex items-center gap-3 bg-yellow-50 px-6 py-3 rounded-2xl border border-yellow-100">
                                         <span className="text-[11px] font-black text-yellow-600">TVA</span>
                                         <select 
                                           value={item.vat_rate} 
                                           onChange={e => {
                                             const newItems = [...brand.menu_items]; newItems[idx].vat_rate = parseFloat(e.target.value); setBrand({...brand, menu_items: newItems});
                                           }}
                                           className="bg-transparent text-[11px] font-black text-yellow-700 outline-none"
                                         >
                                            <option value={5.5}>5.5% (Taxes reduites)</option>
                                            <option value={10}>10% (Restauration)</option>
                                            <option value={20}>20% (Standard)</option>
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

                             <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Description Marketing</label>
                                <textarea value={item.description} onChange={e => {
                                   const newItems = [...brand.menu_items]; newItems[idx].description = e.target.value; setBrand({...brand, menu_items: newItems});
                                }} className="w-full text-xl text-slate-600 bg-slate-50/50 p-8 rounded-[40px] outline-none border border-slate-100 focus:bg-white focus:shadow-xl transition-all h-36 resize-none italic" />
                             </div>

                             <div className="flex gap-8 items-center border-t border-slate-50 pt-10">
                                <button 
                                  onClick={() => setEditingItemIdx(editingItemIdx === idx ? null : idx)}
                                  className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white rounded-[25px] text-[12px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                                >
                                  {editingItemIdx === idx ? <ChevronUp className="w-5 h-5" /> : <UtensilsCrossed className="w-5 h-5" />}
                                  {editingItemIdx === idx ? 'Fermer Config' : 'Options & Modificateurs'}
                                </button>
                                
                                <label className="flex items-center gap-4 cursor-pointer p-5 bg-orange-50 rounded-[25px] border border-orange-100 group/offer">
                                   <input 
                                     type="checkbox"
                                     checked={item.is_special_offer}
                                     onChange={e => {
                                        const newItems = [...brand.menu_items];
                                        newItems[idx].is_special_offer = e.target.checked;
                                        setBrand({...brand, menu_items: newItems});
                                     }}
                                     className="w-6 h-6 rounded-lg border-orange-300 text-orange-600 focus:ring-orange-500 transition-all"
                                   />
                                   <span className="text-[12px] font-black uppercase tracking-widest text-orange-700 flex items-center gap-3">
                                      <Tag className="w-5 h-5" /> Offre Spéciale
                                   </span>
                                </label>
                                
                                <AnimatePresence>
                                  {item.is_special_offer && (
                                    <motion.input 
                                      initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                                      value={item.special_offer_text || ''}
                                      onChange={e => {
                                        const newItems = [...brand.menu_items];
                                        newItems[idx].special_offer_text = e.target.value;
                                        setBrand({...brand, menu_items: newItems});
                                      }}
                                      className="flex-1 text-[12px] font-black text-orange-900 bg-white px-8 py-5 rounded-[25px] outline-none border-2 border-orange-200 shadow-sm"
                                      placeholder="Ex: 1 acheté = 1 offert"
                                    />
                                  )}
                                </AnimatePresence>

                                <div className="flex-1" />
                                <button 
                                  onClick={() => {
                                    if(confirm("Supprimer cet article ?")) {
                                      const newItems = [...brand.menu_items]; newItems.splice(idx, 1); setBrand({...brand, menu_items: newItems});
                                    }
                                  }}
                                  className="p-5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                  <Trash2 className="w-7 h-7" />
                                </button>
                             </div>

                             <AnimatePresence>
                                {editingItemIdx === idx && (
                                   <motion.div 
                                     initial={{ height: 0, opacity: 0, y: -20 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -20 }}
                                     className="overflow-hidden bg-slate-50/80 p-12 rounded-[50px] border border-slate-100 space-y-10"
                                   >
                                      <div className="flex justify-between items-center border-b border-slate-200 pb-8">
                                         <h4 className="text-sm font-black uppercase text-indigo-900 tracking-[0.3em] flex items-center gap-4">
                                            <ShieldAlert className="w-6 h-6" /> Architecture de Choix
                                         </h4>
                                         <button 
                                           onClick={() => {
                                             const newItems = [...brand.menu_items];
                                             const newGroup = { name: "Choisissez votre cuisson", min: 1, max: 1, modifiers: [{ name: "Saignant", price: 0 }] };
                                             newItems[idx].options = [...(newItems[idx].options || []), newGroup];
                                             setBrand({...brand, menu_items: newItems});
                                           }}
                                           className="btn-v3-primary px-8 py-4 text-[11px]"
                                         >
                                            + Nouveau Groupe
                                         </button>
                                      </div>

                                      <div className="grid gap-10">
                                         {(item.options || []).map((group: any, gIdx: number) => (
                                            <div key={gIdx} className="bg-white p-10 rounded-[45px] border border-slate-200 shadow-sm relative">
                                               <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                                                  <div className="flex items-center gap-10">
                                                     <input value={group.name} onChange={e => {
                                                        const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                     }} className="bg-transparent font-black text-2xl text-slate-900 outline-none focus:text-indigo-600 w-96" />
                                                     <div className="flex items-center gap-6 text-[11px] font-black text-slate-400 bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100">
                                                        CONTRAINTES : 
                                                        <div className="flex items-center gap-4 text-indigo-600">
                                                          MIN <input type="number" value={group.min} onChange={e => {
                                                            const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].min = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                          }} className="w-12 text-center bg-white rounded-lg p-1" />
                                                          MAX <input type="number" value={group.max} onChange={e => {
                                                            const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].max = parseInt(e.target.value); setBrand({...brand, menu_items: newItems});
                                                          }} className="w-12 text-center bg-white rounded-lg p-1" />
                                                        </div>
                                                     </div>
                                                  </div>
                                                  <button onClick={() => {
                                                     const newItems = [...brand.menu_items]; newItems[idx].options.splice(gIdx, 1); setBrand({...brand, menu_items: newItems});
                                                  }} className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                                               </div>

                                               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                  {group.modifiers.map((mod: any, mIdx: number) => (
                                                     <div key={mIdx} className="flex items-center gap-4 bg-slate-50 p-6 rounded-[30px] border border-slate-100 group/mod hover:bg-white hover:shadow-xl transition-all border-l-8 border-l-slate-200 hover:border-l-indigo-400">
                                                        <input value={mod.name} onChange={e => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers[mIdx].name = e.target.value; setBrand({...brand, menu_items: newItems});
                                                        }} className="flex-1 text-sm font-black bg-transparent outline-none focus:text-indigo-600" />
                                                        <div className="flex items-center gap-2 text-[#06C167] font-black bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                                                           <span className="text-xs">+</span>
                                                           <input 
                                                              type="text" 
                                                              value={mod.price} 
                                                              onChange={e => {
                                                                const newItems = [...brand.menu_items]; 
                                                                newItems[idx].options[gIdx].modifiers[mIdx].price = sanitizePrice(e.target.value); 
                                                                setBrand({...brand, menu_items: newItems});
                                                              }} 
                                                              className="w-14 text-right outline-none text-sm bg-transparent" 
                                                           />
                                                           <span className="text-xs">€</span>
                                                        </div>
                                                        <button onClick={() => {
                                                           const newItems = [...brand.menu_items]; newItems[idx].options[gIdx].modifiers.splice(mIdx, 1); setBrand({...brand, menu_items: newItems});
                                                        }} className="p-2 text-slate-200 group-hover/mod:text-red-400 transition-all"><Trash2 className="w-5 h-5" /></button>
                                                     </div>
                                                  ))}
                                                  <button 
                                                    onClick={() => {
                                                      const newItems = [...brand.menu_items];
                                                      newItems[idx].options[gIdx].modifiers.push({ name: "Option supp", price: 0 });
                                                      setBrand({...brand, menu_items: newItems});
                                                    }}
                                                    className="p-6 border-4 border-dashed border-slate-100 rounded-[30px] text-[12px] font-black text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-4"
                                                  >
                                                     <Plus className="w-6 h-6" /> Nouveau Choix
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

                {/* Floating Bottom Bar */}
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-12 z-[100]">
                  <div className="bg-slate-900/90 backdrop-blur-3xl p-8 rounded-[50px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/10 flex gap-10 items-center">
                    <div className="flex-1 space-y-1">
                      <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">Status de Synchronisation</p>
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 bg-[#06C167] rounded-full animate-pulse shadow-[0_0_20px_#06C167]" />
                         <span className="text-white font-black text-sm tracking-tight uppercase">Base de données synchronisée</span>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <button onClick={saveMenu} disabled={saving} className="bg-white text-slate-900 font-black uppercase tracking-widest px-12 py-5 rounded-[25px] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl">
                         {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sauver en Local'} <Save className="w-6 h-6" />
                      </button>
                      {uberConnected && (
                        <button 
                          onClick={async () => {
                            setSaving(true);
                            const res = await fetch("/api/uber/sync", { method: "POST", body: JSON.stringify({ brandId: brand.id }) });
                            const data = await res.json();
                            setSaving(false);
                            if (data.success) setToast({ message: "🚀 Menu déployé sur Uber Eats !", type: 'success' });
                            else setToast({ message: "⚠️ Échec Uber : " + data.error, type: 'error' });
                          }}
                          className="bg-[#06C167] text-white font-black uppercase tracking-widest px-12 py-5 rounded-[25px] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl shadow-[#06C167]/30"
                        >
                           🚀 Publier Uber <TrendingUp className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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

                   <button onClick={saveIdentity} disabled={saving} className="btn-v3-primary w-full py-10 text-xl rounded-[40px] shadow-3xl shadow-slate-200">
                      {saving ? <Loader2 className="w-8 h-8 animate-spin" /> : 'Enregistrer les Paramètres Ops'} <ShieldCheck className="ml-4 w-8 h-8" />
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
      </motion.div>

      <style jsx>{`
        .nav-tab-v3 { @apply text-[11px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-2xl transition-all; }
        .nav-tab-v3.active { @apply bg-white shadow-xl text-slate-900; }
        .field-group-v3 { @apply space-y-4 bg-white p-10 rounded-[45px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500; }
        .field-group-v3 label { @apply text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 block; }
        .field-group-v3 input, .field-group-v3 textarea { @apply w-full bg-transparent outline-none border-none; }
        .btn-v3-primary { @apply bg-slate-900 text-white font-black uppercase tracking-[0.3em] py-6 rounded-[30px] hover:bg-black active:scale-95 transition-all flex items-center justify-center shadow-2xl; }
        .btn-v3-success { @apply bg-[#06C167] text-white font-black uppercase tracking-widest py-5 rounded-[25px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl shadow-[#06C167]/30; }
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 4px solid transparent; background-clip: content-box; }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </motion.div>
  );
}

function ChevronLeft(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  )
}
