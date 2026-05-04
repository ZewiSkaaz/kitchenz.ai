"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Calendar, LayoutGrid, ListFilter, Trash2, ExternalLink, Utensils, BookOpen, Plus, Download, TrendingUp, Zap, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [uberConnected, setUberConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        fetchBrands();
        checkUberConnection(session.user.id);
      }
    };
    checkUser();
  }, []);

  const checkUberConnection = async (userId: string) => {
    const { data } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "uber_eats")
      .single();
    setUberConnected(!!data);
  };

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brands")
      .select("*, menu_items(*)")
      .order("created_at", { ascending: false });

    if (!error) setBrands(data || []);
    setLoading(false);
  };

  const deleteBrand = async (id: string) => {
    if (!confirm("Supprimer cette marque ?")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (!error) setBrands(brands.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#06C167] bg-[#06C167]/10 px-4 py-1.5 rounded-full border border-[#06C167]/10">Dashboard Pro</span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">Mes Empires.</h1>
            <p className="text-slate-500 text-xl font-medium">Gérez vos marques virtuelles et suivez vos performances.</p>
          </div>
          <Link href="/audit" className="btn-primary text-lg px-8 py-4 shadow-xl shadow-[#06C167]/20">
            Nouvel Audit <Plus className="w-6 h-6" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <StatCard title="Commandes" value="1,240" trend="+12%" icon={<TrendingUp className="text-[#06C167]" />} />
          <StatCard title="Chiffre d'Affaires" value="18,450€" trend="+8%" icon={<Zap className="text-yellow-500" />} />
          <StatCard title="Crédits IA" value="84 / 100" trend="Reset J-12" icon={<ChefHat className="text-indigo-500" />} />
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-center items-center text-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Uber_Eats_2020_logo.svg" className="h-6 mb-6" />
            {uberConnected ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#06C167] bg-[#06C167]/10 px-4 py-1.5 rounded-full">Connecté</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Prêt pour synchro</p>
              </div>
            ) : (
              <Link href="/api/auth/uber" className="text-[10px] font-black uppercase text-white bg-slate-900 px-6 py-3 rounded-2xl hover:bg-black transition-all">
                Connecter
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-white rounded-[40px] animate-pulse border border-slate-100" />)}
          </div>
        ) : brands.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[50px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <LayoutGrid className="w-20 h-20 text-slate-100 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-slate-900 mb-4">Aucune marque active</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">Lancez votre premier audit IA pour créer une marque rentable sur Uber Eats.</p>
            <Link href="/audit" className="btn-primary inline-flex">
              Créer ma première marque
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <BrandCard 
                key={brand.id} 
                brand={brand} 
                onDelete={() => deleteBrand(brand.id)} 
                onClick={() => setSelectedBrand(brand)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBrand && (
           <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedBrand(null)}
           >
              <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[50px] overflow-hidden flex flex-col shadow-2xl border border-slate-100"
                onClick={e => e.stopPropagation()}
              >
                <div className="h-64 relative bg-slate-900">
                  <img src={selectedBrand.background_url} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  <button onClick={() => setSelectedBrand(null)} className="absolute top-8 right-8 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">✕</button>
                  <div className="absolute bottom-0 left-12 flex items-end gap-8 translate-y-1/2">
                     <img src={selectedBrand.logo_url} className="w-32 h-32 rounded-3xl border-8 border-white shadow-2xl bg-white object-cover" />
                  </div>
                </div>

                <div className="p-12 pt-24 overflow-y-auto custom-scrollbar">
                   <div className="grid md:grid-cols-2 gap-16">
                      <div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{selectedBrand.name}</h2>
                        <p className="text-[#06C167] font-black uppercase tracking-widest text-sm mb-8">{selectedBrand.culinary_style}</p>
                        <h3 className="text-xs font-black mb-4 uppercase tracking-widest text-slate-400">Storytelling</h3>
                        <p className="text-slate-600 text-lg italic leading-relaxed mb-8">"{selectedBrand.storytelling}"</p>
                        
                        {uberConnected && (
                          <button 
                            onClick={async () => {
                              const res = await fetch("/api/uber/sync", {
                                method: "POST",
                                body: JSON.stringify({ brandId: selectedBrand.id })
                              });
                              const data = await res.json();
                              if (data.success) alert("🚀 Menu synchronisé sur Uber Eats !");
                              else alert("Erreur : " + data.error);
                            }}
                            className="w-full bg-[#06C167] text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-[#06C167]/20 flex items-center justify-center gap-3 hover:scale-105 transition-all"
                          >
                            <TrendingUp className="w-5 h-5" /> Publier sur Uber Eats
                          </button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-black mb-6 uppercase tracking-widest text-slate-400">Menu Stratégique</h3>
                        <div className="space-y-4">
                          {selectedBrand.menu_items?.map((item: any) => (
                            <div key={item.id} className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-slate-100 transition-all border border-slate-100">
                               <div>
                                  <h4 className="text-slate-900 font-black">{item.title}</h4>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{item.category}</p>
                               </div>
                               <span className="text-[#06C167] font-black text-lg">{item.selling_price}€</span>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40">
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">{icon}</div>
        <span className="text-xs font-black text-[#06C167] bg-[#06C167]/5 px-3 py-1 rounded-full uppercase tracking-widest border border-[#06C167]/10">{trend}</span>
      </div>
      <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{title}</p>
      <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </div>
  );
}

function BrandCard({ brand, onDelete, onClick }: { brand: any, onDelete: () => void, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white overflow-hidden group cursor-pointer border border-slate-100 rounded-[45px] shadow-lg shadow-slate-200/50 hover:shadow-2xl transition-all duration-500"
      onClick={onClick}
    >
      <div className="h-56 relative bg-slate-100">
        <img src={brand.background_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="absolute -bottom-8 left-10">
           <img src={brand.logo_url} className="w-20 h-20 rounded-3xl border-4 border-white shadow-2xl bg-white object-cover" />
        </div>
      </div>
      <div className="pt-14 p-10">
        <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-[#06C167] transition-colors tracking-tight">{brand.name}</h3>
        <p className="text-[#06C167] text-[10px] font-black uppercase tracking-widest mb-6">{brand.culinary_style}</p>
        <p className="text-slate-400 text-sm italic font-medium line-clamp-2 mb-8 leading-relaxed">"{brand.tagline}"</p>
        <div className="flex justify-between items-center pt-8 border-t border-slate-50">
           <div className="flex gap-4">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2"><Utensils className="w-3 h-3" /> {brand.menu_items?.length || 0} Articles</span>
           </div>
           <span className="bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-100">Détails</span>
        </div>
      </div>
    </motion.div>
  );
}
