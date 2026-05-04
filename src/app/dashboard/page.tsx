"use client";

import { useEffect, useState } from "react";
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
      .eq("provider", "uber")
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
          <StatCard title="Ventes" value="1,240" trend="+12%" icon={<TrendingUp className="text-[#06C167] w-4 h-4" />} />
          <StatCard title="Chiffre d'Affaires" value="18,450.00 €" trend="+8%" icon={<Zap className="text-yellow-500 w-4 h-4" />} />
          <StatCard title="Performance" value="98%" trend="+2%" icon={<ChefHat className="text-indigo-500 w-4 h-4" />} />
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1">Uber Eats</p>
              {uberConnected ? (
                <span className="text-[11px] font-bold text-[#06C167] bg-[#06C167]/5 px-2 py-1 rounded">Actif</span>
              ) : (
                <Link href="/api/auth/uber" className="text-[11px] font-bold text-blue-600 hover:underline">Connecter</Link>
              )}
            </div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Uber_Eats_2020_logo.svg" className="h-4" />
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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">{title}</p>
        <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-black tracking-tight">{value}</h3>
        <span className="text-[10px] font-bold text-[#06C167]">{trend}</span>
      </div>
    </div>
  );
}

function BrandCard({ brand, onDelete, onClick }: { brand: any, onDelete: () => void, onClick: () => void }) {
  return (
    <div 
      className="bg-white group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-[#06C167] transition-all"
      onClick={onClick}
    >
      <div className="h-40 relative bg-gray-100">
        <img src={brand.background_url} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-3 right-3 p-2 bg-white/90 text-gray-400 rounded-md hover:text-red-500 shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <img src={brand.logo_url} className="w-10 h-10 rounded-md border border-gray-100 bg-white object-cover" />
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
    </div>
  );
}
