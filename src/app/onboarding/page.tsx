"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, User, Phone, FileText, Check, ArrowRight, Loader2, MapPin, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  // User Profile State
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    siret: "",
    tva_number: ""
  });

  // First Establishment State
  const [establishment, setEstablishment] = useState({
    name: "",
    address: "",
    city: ""
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
        // Check if profile exists
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (prof) {
          setProfile({
            first_name: prof.first_name || "",
            last_name: prof.last_name || "",
            phone: prof.phone || "",
            siret: prof.siret || "",
            tva_number: prof.tva_number || ""
          });
          // If we have a profile, we can skip to step 2
          setStep(2);
        }
      }
    };
    checkUser();
  }, [router]);

  const handleFinish = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // 1. Save Profile
      const { error: profError } = await supabase.from("profiles").upsert({
        id: userId,
        ...profile,
        updated_at: new Date()
      });
      if (profError) throw profError;

      // 2. Save First Establishment
      const { error: estError } = await supabase.from("establishments").insert({
        user_id: userId,
        ...establishment
      });
      if (estError) throw estError;

      router.push("/dashboard?onboarding=success");
    } catch (error: any) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        {/* PROGRESS BAR */}
        <div className="flex justify-between mb-12">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-[#06C167] text-white shadow-lg shadow-[#06C167]/20' : 'bg-white text-slate-300 border border-slate-200'}`}>
                {step > s ? <Check className="w-6 h-6" /> : s}
              </div>
              {s < 2 && <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${step > s ? 'bg-[#06C167]' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-12 bg-white"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-[#06C167]/10 rounded-3xl">
                  <User className="w-8 h-8 text-[#06C167]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Parlons de vous</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Identité & Informations légales</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prénom</label>
                  <input 
                    type="text" 
                    placeholder="Jean"
                    className="input-premium w-full"
                    value={profile.first_name}
                    onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom</label>
                  <input 
                    type="text" 
                    placeholder="Dupont"
                    className="input-premium w-full"
                    value={profile.last_name}
                    onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      placeholder="06 12 34 56 78"
                      className="input-premium w-full pl-12"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">N° SIRET</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="123 456 789 00012"
                      className="input-premium w-full pl-12"
                      value={profile.siret}
                      onChange={(e) => setProfile({...profile, siret: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">N° TVA Intracommunautaire</label>
                  <input 
                    type="text" 
                    placeholder="FR 12 345678901"
                    className="input-premium w-full"
                    value={profile.tva_number}
                    onChange={(e) => setProfile({...profile, tva_number: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setStep(2)} 
                  disabled={!profile.first_name || !profile.last_name || !profile.siret}
                  className="btn-primary px-10 py-5 disabled:opacity-50"
                >
                  Suivant <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-12 bg-white"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-600/10 rounded-3xl">
                  <Store className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Votre établissement</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Le cœur de votre activité</p>
                </div>
              </div>

              <div className="space-y-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom du restaurant</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Le Petit Bistro, Pizza Napoli..."
                    className="input-premium w-full"
                    value={establishment.name}
                    onChange={(e) => setEstablishment({...establishment, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Adresse complète</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="12 rue de la Paix"
                      className="input-premium w-full pl-12"
                      value={establishment.address}
                      onChange={(e) => setEstablishment({...establishment, address: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ville</label>
                  <input 
                    type="text" 
                    placeholder="Paris"
                    className="input-premium w-full"
                    value={establishment.city}
                    onChange={(e) => setEstablishment({...establishment, city: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-transparent hover:border-slate-300 transition-all">Retour</button>
                <button 
                  onClick={handleFinish} 
                  disabled={loading || !establishment.name || !establishment.city}
                  className="btn-primary px-12 py-5 bg-slate-900 shadow-slate-900/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Building2 className="w-6 h-6 mr-2" />}
                  Finaliser mon profil
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
