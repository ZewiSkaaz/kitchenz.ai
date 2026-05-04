"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChefHat, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 pt-32 pb-20">
      <div className="absolute top-0 left-0 w-full h-full bg-[#06C167]/5 -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-12 rounded-[50px] shadow-2xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-[#06C167] rounded-3xl mb-8 shadow-lg shadow-[#06C167]/20">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Bon Retour.</h1>
          <p className="text-slate-500 font-medium text-lg">Prêt à dominer Uber Eats aujourd'hui ?</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Email de contact</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="email"
                placeholder="chef@votre-resto.fr"
                className="input-premium w-full pl-16 bg-slate-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="password"
                placeholder="••••••••"
                className="input-premium w-full pl-16 bg-slate-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-6 shadow-xl shadow-[#06C167]/20 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Se connecter <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center pt-8 border-t border-slate-100">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Nouveau sur Kitchenz ? <Link href="/register" className="text-[#06C167] hover:underline ml-2">Créer un compte</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
