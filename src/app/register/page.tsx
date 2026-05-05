"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { ChefHat, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'user' } }
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Compte créé ! Vérifiez vos e-mails pour confirmer votre inscription.");
      router.push("/login");
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) window.location.href = "/dashboard";
    };
    checkLoggedIn();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden pt-32 pb-20">
       {/* Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#06C167]/5 -z-10" />

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Copywriting */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#06C167] text-xs font-black mb-8 shadow-sm tracking-[0.2em]"
          >
            STARTUP PROGRAM
          </motion.div>
          <h1 className="text-7xl font-black mb-10 tracking-tighter leading-[0.9] text-slate-900">
            Rejoignez <br /> la <span className="text-[#06C167]">Révolution</span>.
          </h1>
          <ul className="space-y-8">
            <FeatureItem 
              title="Audit IA Instantané" 
              desc="Analysez vos stocks et générez des concepts culinaires uniques en moins de 60s." 
            />
            <FeatureItem 
              title="Images HD par Flux.1" 
              desc="Générez des photos de plats ultra-réalistes qui convertissent sur Uber Eats." 
            />
            <FeatureItem 
              title="Rentabilité Garantie" 
              desc="Analysez vos marges réelles après commissions et TVA pour chaque plat." 
            />
          </ul>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[50px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative"
        >
          <div className="text-center mb-12">
            <div className="inline-flex p-4 bg-[#06C167] rounded-3xl mb-8 shadow-lg shadow-[#06C167]/20">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-3 text-slate-900 tracking-tight">Inscription Marchand</h2>
            <p className="text-slate-500 font-medium text-lg">Commencez à multiplier votre CA dès maintenant.</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">E-mail Professionnel</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="email"
                  required
                  className="input-premium w-full pl-16 bg-slate-50"
                  placeholder="chef@votre-resto.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="password"
                  required
                  className="input-premium w-full pl-16 bg-slate-50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl text-sm font-bold">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="btn-primary w-full py-6 text-lg shadow-xl shadow-[#06C167]/20 group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Créer mon compte <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Déjà inscrit ? <Link href="/login" className="text-[#06C167] hover:underline ml-2">Connectez-vous</Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <li className="flex gap-6 items-start">
      <div className="p-3 bg-[#06C167] rounded-2xl text-white shadow-lg shadow-[#06C167]/20">
        <Check className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-xl font-black text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}
