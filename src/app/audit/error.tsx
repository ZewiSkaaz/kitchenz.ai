"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw, Home, ChefHat } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Audit Crash:", error);
  }, [error]);

  return (
    <div className="min-h-screen pt-40 pb-20 px-4 flex flex-col items-center bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full glass-card p-12 bg-white shadow-2xl shadow-slate-200/50 text-center border border-red-100"
      >
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Oups ! La cuisson a échoué.</h1>
        <p className="text-slate-500 font-medium text-lg mb-10">
          Une erreur inattendue est survenue lors de la génération de votre audit. Cela peut arriver si l'IA rencontre un problème technique temporaire.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg"
          >
            <RotateCcw className="w-6 h-6" /> Réessayer l'Audit
          </button>
          
          <Link 
            href="/dashboard"
            className="btn-secondary w-full flex items-center justify-center gap-3 py-4 text-lg"
          >
            <Home className="w-6 h-6" /> Retour au Dashboard
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-2">
           <ChefHat className="w-4 h-4 text-slate-300" />
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kitchenz.ai Error Handler</span>
        </div>
      </motion.div>
    </div>
  );
}
