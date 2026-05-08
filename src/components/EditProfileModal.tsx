"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EditProfileModal({ isOpen, profile, onClose, onRefresh }: { isOpen: boolean, profile: any, onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState(profile || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (profile) setFormData(profile); }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert(formData);
    if (!error) {
      onRefresh();
      onClose();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[40px] p-12 shadow-2xl overflow-hidden">
            <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Modifier mon Profil Pro</h2>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom</label><input type="text" className="input-premium w-full" value={formData.first_name || ""} onChange={e => setFormData({...formData, first_name: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom</label><input type="text" className="input-premium w-full" value={formData.last_name || ""} onChange={e => setFormData({...formData, last_name: e.target.value})} /></div>
              <div className="space-y-2 col-span-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label><input type="text" className="input-premium w-full" value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Siret</label><input type="text" className="input-premium w-full" value={formData.siret || ""} onChange={e => setFormData({...formData, siret: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TVA</label><input type="text" className="input-premium w-full" value={formData.tva_number || ""} onChange={e => setFormData({...formData, tva_number: e.target.value})} /></div>
            </div>
            <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-500 hover:text-slate-700 font-black uppercase text-xs tracking-widest rounded-2xl transition-all">Annuler</button>
              <button onClick={handleSave} disabled={loading} className="flex-[2] py-4 bg-[#06C167] text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-[#06C167]/20 flex items-center justify-center gap-2 hover:bg-[#05a357] transition-all disabled:opacity-50">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer les modifications
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
