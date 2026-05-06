"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Calendar, LayoutGrid, ListFilter, Trash2, ExternalLink, Utensils, BookOpen, Plus, Download, TrendingUp, Zap, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandEditor from "@/components/BrandEditor";

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
        handleUrlParams();
      }
    };
    checkUser();
  }, []);

  const handleUrlParams = () => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error === "invalid_scope") {
      alert("Erreur Uber : Vous devez sélectionner et activer les permissions (Scopes) dans l'onglet 'Setup' de votre Dashboard Uber Developer.");
      router.replace("/dashboard");
    } else if (error) {
      alert("Erreur de connexion Uber : " + error);
      router.replace("/dashboard");
    } else if (params.get("success") === "uber_connected") {
      setUberConnected(true);
      router.replace("/dashboard");
    }
  };

  const checkUberConnection = async (userId: string) => {
    const { data } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "uber_eats")
      .single();
    setUberConnected(!!data);
  };

  const disconnectUber = async () => {
    if (!confirm("Voulez-vous vraiment déconnecter votre compte Uber Eats ?")) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_integrations")
      .delete()
      .eq("user_id", session.user.id)
      .eq("provider", "uber_eats");

    if (!error) {
      setUberConnected(false);
    }
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
    <div className="min-h-screen bg-[#F6F6F6] pt-20 md:pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight mb-1">Aperçu de l'établissement</h1>
            <p className="text-gray-500 text-sm">Gérez vos marques et suivez vos performances en temps réel.</p>
          </div>
          <Link href="/audit" className="bg-[#06C167] text-white text-sm font-bold px-6 py-3 rounded-md hover:bg-[#05a357] transition-all flex items-center gap-2">
            Nouvel Audit <Plus className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Stat Cards */}
          <StatCard title="Ventes" value="1,240" trend="+12%" icon={<TrendingUp className="text-[#06C167] w-4 h-4" />} />
          <StatCard title="Chiffre d'Affaires" value="18,450.00 €" trend="+8%" icon={<Zap className="text-yellow-500 w-4 h-4" />} />
          <StatCard title="Performance" value="98%" trend="+2%" icon={<ChefHat className="text-indigo-500 w-4 h-4" />} />
          
          {/* Uber Eats Integration Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Uber_Eats_2020_logo.svg" className="h-4 invert" alt="Uber Eats" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Uber Eats</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marketplace Manager</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${uberConnected ? 'bg-[#06C167] animate-pulse' : 'bg-slate-200'}`} />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Statut</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${uberConnected ? 'text-[#06C167]' : 'text-slate-400'}`}>
                  {uberConnected ? 'Connecté' : 'Non lié'}
                </span>
              </div>
              
              {uberConnected ? (
                <button 
                  onClick={disconnectUber}
                  className="w-full py-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all border border-slate-100"
                >
                  Déconnecter le compte
                </button>
              ) : (
                <Link 
                  href="/api/auth/uber"
                  className="w-full py-2 bg-[#06C167] hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Lier mon restaurant
                </Link>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-lg animate-pulse border border-gray-200" />)}
          </div>
        ) : brands.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-lg border border-gray-200 shadow-sm">
            <LayoutGrid className="w-12 h-12 text-gray-200 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-black mb-2">Aucune marque active</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm font-medium">Lancez votre premier audit IA pour créer une marque rentable sur Uber Eats.</p>
            <Link href="/audit" className="btn-primary inline-flex">
              Créer ma première marque
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <BrandEditor 
            brand={selectedBrand} 
            onClose={() => setSelectedBrand(null)} 
            onRefresh={fetchBrands}
            uberConnected={uberConnected}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">{title}</p>
        <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-black tracking-tight">{value}</h3>
        <span className="text-[10px] font-bold text-[#06C167]">{trend}</span>
      </div>
    </motion.div>
  );
}

function BrandCard({ brand, onDelete, onClick }: { brand: any, onDelete: () => void, onClick: () => void }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-[#06C167] transition-all"
      onClick={onClick}
    >
      <div className="h-40 relative bg-gray-100 overflow-hidden">
        <Image 
          src={brand.background_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop"} 
          alt={brand.name}
          fill
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-3 right-3 p-2 bg-white/90 text-gray-400 rounded-md hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-md border border-gray-100 bg-white relative overflow-hidden">
            <Image 
              src={brand.logo_url || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=200&auto=format&fit=crop"} 
              alt="Logo"
              width={40}
              height={40}
              className="object-cover" 
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black group-hover:text-[#06C167] transition-colors">{brand.name}</h3>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{brand.culinary_style}</p>
          </div>
        </div>
        <p className="text-gray-500 text-xs line-clamp-1 mb-4">"{brand.tagline}"</p>
        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Utensils className="w-3 h-3" /> {brand.menu_items?.length || 0} Articles</span>
           <span className="text-[10px] font-bold text-[#06C167] uppercase tracking-widest">Gérer</span>
        </div>
      </div>
    </motion.div>
  );
}
