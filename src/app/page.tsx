"use client";

import Image from "next/image";
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
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-black tracking-tight mb-8 leading-[1.1]"
          >
            Vendez plus sur <br/>
            <span className="text-[#06C167]">Uber Eats</span> avec l'IA.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Kitchenz.ai transforme vos stocks en marques virtuelles optimisées. 
            Gagnez en visibilité et en rentabilité grâce à notre technologie de vision par ordinateur.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Link href="/audit" className="btn-primary px-10 py-4 text-base w-full md:w-auto">
              Lancer l'Audit Gratuit
            </Link>
            <Link href="/wiki" className="btn-secondary px-10 py-4 text-base w-full md:w-auto">
              En savoir plus
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             <Image priority={true} src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Uber_Eats_2020_logo.svg" width={120} height={40} className="h-8 md:h-10 w-auto" alt="Uber Eats" />
             <Image priority={true} src="https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Deliveroo_logo.svg/1200px-Deliveroo_logo.svg.png" width={140} height={48} className="h-8 md:h-12 w-auto" alt="Deliveroo" />
             <Image priority={true} src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Burger_King_logo.svg/1200px-Burger_King_logo.svg.png" width={56} height={56} className="h-10 md:h-14 w-auto" alt="Burger King" />
             <Image priority={true} src="https://upload.wikimedia.org/wikipedia/fr/b/bf/Logo_Mc_Donald%27s.png" width={56} height={56} className="h-10 md:h-14 w-auto" alt="McDonalds" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight mb-6">Multipliez vos marques, <br/> pas votre travail.</h2>
            <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">Exploitez tout le potentiel de votre cuisine existante pour dominer les plateformes de livraison.</p>
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
             <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tight mb-4">Une solution rentabilisée <br/> <span className="text-[#06C167]">immédiatement</span>.</h2>
             <p className="text-slate-600 text-lg font-medium">Choisissez le plan qui correspond à votre ambition.</p>
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

      {/* Global Presence Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-black tracking-tight mb-4">Une solution sans frontières</h2>
            <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
              Kitchenz.ai accompagne les restaurateurs partout où Uber Eats opère. Optimisez votre rentabilité, de Paris à Tokyo.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "France", flag: "🇫🇷" }, { name: "USA", flag: "🇺🇸" }, { name: "UK", flag: "🇬🇧" },
              { name: "Espagne", flag: "🇪🇸" }, { name: "Italie", flag: "🇮🇹" }, { name: "Japon", flag: "🇯🇵" },
              { name: "Brésil", flag: "🇧🇷" }, { name: "Canada", flag: "🇨🇦" }, { name: "Mexique", flag: "🇲🇽" },
              { name: "Australie", flag: "🇦🇺" }, { name: "Allemagne", flag: "🇩🇪" }, { name: "Portugal", flag: "🇵🇹" }
            ].map((country) => (
              <div key={country.name} className="flex flex-col items-center p-6 rounded-xl border border-gray-100 bg-white hover:border-[#06C167] transition-all group shadow-sm">
                <span className="text-4xl mb-3 grayscale group-hover:grayscale-0 transition-all">{country.flag}</span>
                <span className="text-sm font-bold text-gray-900">{country.name}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-20 p-8 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Et 20+ autres pays à travers le monde</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-black rounded-2xl p-12 md:p-24 text-center relative overflow-hidden">
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 relative z-10">Optimisez votre cuisine <br/> dès aujourd'hui.</h2>
             <p className="text-gray-100 text-lg font-medium mb-12 max-w-xl mx-auto relative z-10">Rejoignez les restaurateurs qui utilisent Kitchenz.ai pour automatiser leur croissance.</p>
             <Link href="/audit" className="btn-primary px-10 py-4 mx-auto relative z-10 w-full md:w-auto">
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
    <div className="bg-white p-8 rounded-lg border border-gray-100 group hover:shadow-lg transition-all">
      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-black mb-4">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function PricingCard({ plan, price, features, popular }: { plan: string, price: string, features: string[], popular?: boolean }) {
  return (
    <div className={`p-10 rounded-xl flex flex-col border transition-all duration-500 ${popular ? 'bg-white border-[#06C167] shadow-xl scale-105 z-10' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
      {popular && <span className="bg-[#06C167] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded w-fit mb-6">Recommandé</span>}
      <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">{plan}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-bold text-black tracking-tight">{price}€</span>
        <span className="text-slate-500 font-medium text-xs">/ mois</span>
      </div>
      <ul className="space-y-3 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
            <Check className="w-4 h-4 text-[#06C167]" /> {f}
          </li>
        ))}
      </ul>
      <Link href="/pricing" className={`w-full text-center flex justify-center items-center ${popular ? 'btn-primary' : 'btn-black'} !py-3 text-sm`}>
        Choisir {plan}
      </Link>
    </div>
  );
}
