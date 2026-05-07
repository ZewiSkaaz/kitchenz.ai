"use client";

import { motion } from "framer-motion";
import { ChefHat, Utensils, Zap, Sparkles, ArrowRight, ShieldCheck, DollarSign, Image as ImageIcon, Flame, Rocket, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function GuidePage() {
  const steps = [
    {
      title: "1. Définir la Vision",
      icon: <ChefHat className="w-8 h-8 text-[#06C167]" />,
      caseStudy: "Smash Sultan",
      description: "Tout commence par une idée. Vous n'avez pas besoin d'un business plan de 50 pages, juste d'une direction.",
      details: "Dans notre exemple, un gérant de Kebab souhaite exploiter son temps mort l'après-midi en lançant une marque de Smash Burger.",
      input: "Nom: Smash Sultan | Style: Industriel & Oriental | Concept: Fusion Kebab/Smash."
    },
    {
      title: "2. Scanner l'Existant",
      icon: <Utensils className="w-8 h-8 text-orange-500" />,
      caseStudy: "L'inventaire hybride",
      description: "L'IA analyse vos stocks actuels pour minimiser vos investissements de départ.",
      details: "On liste les produits du Kebab : Viande hachée, Broche, Pain Pita, Oignons, Cheddar. L'IA va chercher comment les transformer en Burgers.",
      input: "Liste : Bœuf 20%, Pita, Salade, Tomates, Sauce Blanche, Sauce Algérienne..."
    },
    {
      title: "3. La Magie de l'IA",
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      caseStudy: "Cohérence Totale",
      description: "Kitchenz.ai génère une identité de marque complète, du logo aux photos de plats, avec un style visuel unique.",
      details: "Le système crée un 'SceneSeed' unique. Résultat : l'ambiance 'Lave & Métal' se retrouve sur votre bannière Uber Eats et sur chaque photo de burger.",
      input: "Génération : Logo Cyber-Oriental, Photos de produits en Dark Mode."
    },
    {
      title: "4. Audit & Rentabilité",
      icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
      caseStudy: "Marge Nette",
      description: "L'IA ne fait pas que de la déco : elle calcule vos fiches techniques et vos prix de vente cibles.",
      details: "Elle suggère d'ajouter du Bacon de Dinde (ingrédient flexible) pour créer un 'Mega Sultan Smash' et booster la marge de 15%.",
      input: "Simulation : Panier moyen à 18.50€, Profit net cible de 22%."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#06C167] to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black mb-8 tracking-[0.3em] uppercase"
          >
            Guide Pas à Pas
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none"
          >
            De Kebab à <br/><span className="text-[#06C167]">Smash Sultan</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Découvrez comment transformer votre cuisine actuelle en une machine à cash digitale grâce à notre étude de cas réelle.
          </motion.p>
        </div>
      </section>

      {/* CASE STUDY STEPS */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-20`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                      {step.icon}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{step.title}</h2>
                  </div>
                  <h3 className="text-[#06C167] font-black uppercase text-xs tracking-widest mb-4">Étude de cas : {step.caseStudy}</h3>
                  <p className="text-xl text-slate-600 font-medium leading-relaxed mb-6">
                    {step.description}
                  </p>
                  <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                    <p className="text-slate-500 font-medium italic mb-4 italic">
                      "{step.details}"
                    </p>
                    <div className="flex items-center gap-3 text-slate-900 font-black text-sm uppercase tracking-tighter">
                      <div className="w-2 h-2 bg-[#06C167] rounded-full" />
                      {step.input}
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                   <div className="aspect-square bg-slate-100 rounded-[60px] overflow-hidden shadow-2xl relative group border-8 border-white">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-slate-300 font-black text-9xl opacity-20">0{index + 1}</span>
                      </div>
                      {/* Image Mockup Placeholder */}
                      <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-white shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                         <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-[#06C167]" />
                            <span className="font-black text-slate-900 text-sm uppercase tracking-widest">Étape validée</span>
                         </div>
                         <p className="text-xs text-slate-500 font-bold uppercase">{step.caseStudy}</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL RESULT PREVIEW */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[80px] p-12 md:p-24 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-[#06C167]" />
             <div className="max-w-3xl mx-auto">
                <Rocket className="w-20 h-20 text-[#06C167] mx-auto mb-10 animate-bounce" />
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">C'est à votre <br/><span className="text-[#06C167]">tour de scaler</span>.</h2>
                <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed">
                  L'audit prend moins de 2 minutes. Que vous soyez un Kebab, une Pizzeria ou une Brasserie, l'IA Kitchenz trouvera votre prochaine source de revenus.
                </p>
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                   <Link href="/audit" className="btn-primary text-xl px-12 py-6">Lancer mon Audit IA</Link>
                   <Link href="/wiki" className="btn-secondary text-xl px-12 py-6">Voir la Doc Technique</Link>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
