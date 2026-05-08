"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, LayoutGrid, Zap, LogOut, Store, MapPin, User, Loader2, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandEditor from "@/components/BrandEditor";
import BrandCard from "@/components/BrandCard";
import StatCard from "@/components/StatCard";
import EditProfileModal from "@/components/EditProfileModal";
import EditEstablishmentModal from "@/components/EditEstablishmentModal";

export default function DashboardPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [uberConnected, setUberConnected] = useState(false);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'marques' | 'sites'>('marques');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        fetchBrands();
        fetchEstablishments(session.user.id);
        fetchProfile(session.user.id);
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
    const msg = params.get("msg");
    
    if (error === "invalid_scope") {
      alert("Erreur Uber : Vous devez sélectionner et activer les permissions (Scopes) dans l'onglet 'Setup' de votre Dashboard Uber Developer.");
      router.replace("/dashboard");
    } else if (error) {
      alert(`Erreur de connexion Uber : ${error}${msg ? ` (${msg})` : ''}`);
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

  const fetchEstablishments = async (userId: string) => {
    const { data } = await supabase.from("establishments").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setEstablishments(data);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  };

  const deleteBrand = async (id: string) => {
    alert("Veuillez supprimer la marque via l'onglet 'Paramètres' du menu Gérer pour plus de sécurité.");
  };

  const deleteEstablishment = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet établissement ? Cela supprimera également les données d'inventaire associées.")) return;
    
    const { error } = await supabase.from("establishments").delete().eq("id", id);
    if (!error) {
      fetchEstablishments(profile?.id || (await supabase.auth.getUser()).data.user?.id);
    } else {
      alert("Erreur lors de la suppression : " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] pt-20 md:pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ─── HEADER ─── */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">Gérez vos marques et vos sites de production.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <User className="w-4 h-4" /> Profil Pro
            </button>
            <Link href="/audit" className="bg-[#06C167] text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-[#05a357] transition-all flex items-center gap-2 shadow-lg shadow-[#06C167]/20">
              <Plus className="w-4 h-4" /> Nouvel Audit
            </Link>
          </div>
        </div>

        {/* ─── TABS ─── */}
        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm mb-10 w-fit">
          <button
            onClick={() => setActiveTab('marques')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'marques'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Mes Marques
            {brands.length > 0 && (
              <span className={`ml-1 text-[9px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'marques' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{brands.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'sites'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            Mes Sites
            {establishments.length > 0 && (
              <span className={`ml-1 text-[9px] px-2 py-0.5 rounded-full font-black ${
                activeTab === 'sites' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{establishments.length}</span>
            )}
          </button>
        </div>

        {/* ─── TAB: MES MARQUES ─── */}
        {activeTab === 'marques' && (
          <>
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
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marketplace Manager</p>
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
          </>
        )}

        {/* ─── TAB: MES SITES ─── */}
        {activeTab === 'sites' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Vos sites de production</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Stocks et matériel sauvegardés par site — utilisés pour auto-remplir l&apos;audit</p>
              </div>
              <Link href="/onboarding" className="bg-[#06C167] text-white text-xs font-black px-5 py-2.5 rounded-xl hover:bg-[#05a357] transition-all flex items-center gap-2 shadow-lg shadow-[#06C167]/20">
                <Plus className="w-4 h-4" /> Ajouter un site
              </Link>
            </div>

            {establishments.length === 0 ? (
              <div className="bg-white p-20 text-center rounded-3xl border border-slate-100 shadow-sm">
                <Store className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Aucun site enregistré</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm font-medium">Ajoutez votre premier site de production pour pré-remplir automatiquement vos audits avec vos stocks et matériel.</p>
                <Link href="/onboarding" className="inline-flex items-center gap-2 bg-[#06C167] text-white text-xs font-black px-6 py-3 rounded-xl hover:bg-[#05a357] transition-all">
                  <Plus className="w-4 h-4" /> Créer mon premier site
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {establishments.map((est) => (
                  <motion.div
                    key={est.id}
                    whileHover={{ y: -4 }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-indigo-50 rounded-2xl">
                        <Store className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingEstablishment(est)} className="p-2 bg-slate-50 text-slate-400 hover:text-[#06C167] rounded-lg transition-all" title="Modifier">
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteEstablishment(est.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{est.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-6">
                      <MapPin className="w-3.5 h-3.5" /> {est.address}, {est.city}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ingrédients</p>
                        <p className="text-sm font-black text-slate-900">{est.default_ingredients?.length || 0} <span className="text-slate-400 font-medium">sauvegardés</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Matériel</p>
                        <p className="text-sm font-black text-slate-900">{est.default_equipment?.length || 0} <span className="text-slate-400 font-medium">sauvegardés</span></p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/establishments/${est.id}`)}
                      className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Gérer l&apos;inventaire
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
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

      <EditProfileModal 
        isOpen={isEditingProfile} 
        profile={profile} 
        onClose={() => setIsEditingProfile(false)} 
        onRefresh={() => fetchProfile(profile.id)} 
      />

      <EditEstablishmentModal 
        isOpen={!!editingEstablishment} 
        establishment={editingEstablishment} 
        onClose={() => setEditingEstablishment(null)} 
        onRefresh={() => fetchEstablishments(profile?.id)} 
      />
    </div>
  );
}
