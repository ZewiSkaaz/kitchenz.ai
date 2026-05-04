"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, ShieldCheck, TrendingUp, ChevronRight, Play, Check, Star, Globe, Users, ChefHat } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-slate-50">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#06C167]/5 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-black mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#06C167] animate-pulse" />
            NOUVEAUTÉ : GÉNÉRATEUR D'IMAGES FLUX.1 INTÉGRÉ
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]"
          >
            Vendez plus sur <br/>
            <span className="text-[#06C167]">Uber Eats</span> avec l'IA.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Kitchenz.ai analyse votre inventaire et crée instantanément des marques virtuelles optimisées pour la livraison. Gagnez en marge, pas en stress.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <Link href="/audit" className="btn-primary text-xl px-12 py-6 group w-full md:w-auto">
              Lancer mon Audit IA <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/wiki" className="btn-secondary text-xl px-12 py-6 w-full md:w-auto bg-white">
              Voir la Démo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Uber_Eats_2020_logo.svg" className="h-8 md:h-10" alt="Uber Eats" />
             <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Deliveroo_logo.svg/1200px-Deliveroo_logo.svg.png" className="h-8 md:h-12" alt="Deliveroo" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Burger_King_logo.svg/1200px-Burger_King_logo.svg.png" className="h-10 md:h-14" alt="Burger King" />
             <img src="https://upload.wikimedia.org/wikipedia/fr/b/bf/Logo_Mc_Donald%27s.png" className="h-10 md:h-14" alt="McDonalds" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">Un restaurant, <br/> des dizaines de marques.</h2>
            <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Multipliez votre visibilité sur les plateformes sans changer votre cuisine.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-[#06C167]" />}
              title="Audit IA Instantané"
              desc="Scannez vos frigos, l'IA s'occupe de créer le concept, le nom et le storytelling."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Pricing Dynamique"
              desc="Calcul automatique des marges en incluant les commissions Uber Eats et les frais fixes."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-indigo-500" />}
              title="Export Automatisé"
              desc="Générez vos fichiers d'import Uber Eats en 1 clic. Plus de saisie manuelle."
            />
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-40 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">Investissez dans <span className="text-[#06C167]">votre croissance</span>.</h2>
             <p className="text-slate-500 text-xl font-medium">Rentable dès la première commande.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <PricingCard 
                plan="Gratuit"
                price="0"
                features={["1 Audit par mois", "Recettes IA basiques", "Export Manuel", "Support Communauté"]}
             />
             <PricingCard 
                plan="Pro"
                price="49"
                popular
                features={["Audits Illimités", "Images FLUX.1 (HD)", "Simulateur de Rentabilité", "Export Uber Eats Automatique"]}
             />
             <PricingCard 
                plan="Empire"
                price="199"
                features={["Multi-Établissements", "Clés API Dédiées", "Accompagnement Stratégique", "Audit Prioritaire"]}
             />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 rounded-[50px] p-12 md:p-24 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[#06C167]/10 -z-0" />
             <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">Prêt à transformer <br/> votre cuisine ?</h2>
             <p className="text-white/40 text-xl font-medium mb-12 max-w-xl mx-auto relative z-10">Rejoignez plus de 500 restaurateurs qui utilisent Kitchenz.ai pour doubler leur chiffre d'affaires.</p>
             <Link href="/audit" className="btn-primary text-xl px-12 py-6 mx-auto relative z-10 w-full md:w-auto">
                Commencer l'Audit Gratuit
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-10 group hover:bg-slate-50 transition-all border-slate-100">
      <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-slate-100">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ plan, price, features, popular }: { plan: string, price: string, features: string[], popular?: boolean }) {
  return (
    <div className={`p-12 rounded-[40px] flex flex-col border-2 transition-all duration-500 ${popular ? 'bg-white border-[#06C167] shadow-2xl scale-105 z-10' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
      {popular && <span className="bg-[#06C167] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full w-fit mb-8">Plus Populaire</span>}
      <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-widest">{plan}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-6xl font-black text-slate-900 tracking-tighter">{price}€</span>
        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">/ mois</span>
      </div>
      <ul className="space-y-4 mb-12 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-600 font-bold">
            <Check className="w-5 h-5 text-[#06C167]" /> {f}
          </li>
        ))}
      </ul>
      <Link href="/audit" className={`w-full py-5 rounded-2xl font-black text-center transition-all ${popular ? 'bg-[#06C167] text-white hover:bg-[#05a357]' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'}`}>
        Choisir ce plan
      </Link>
    </div>
  );
}
