"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EditEstablishmentModal({ isOpen, establishment, onClose, onRefresh }: { isOpen: boolean, establishment: any, onClose: () => void, onRefresh: () => void }) {
  const [formData, setFormData] = useState(establishment || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (establishment) setFormData(establishment); }, [establishment]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from("establishments").update({
      name: formData.name,
      address: formData.address,
      city: formData.city
    }).eq("id", establishment.id);
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
            <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Modifier l'Établissement</h2>
            <div className="space-y-6 mb-8">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom du restaurant</label><input type="text" className="input-premium w-full" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse</label><input type="text" className="input-premium w-full" value={formData.address || ""} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ville</label><input type="text" className="input-premium w-full" value={formData.city || ""} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
            </div>
            <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-500 hover:text-slate-700 font-black uppercase text-xs tracking-widest rounded-2xl transition-all">Annuler</button>
              <button onClick={handleSave} disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer les changements
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
