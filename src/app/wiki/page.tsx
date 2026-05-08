"use client";

import { motion } from "framer-motion";
import { ChefHat, BookOpen, Sparkles, LayoutGrid, Rocket, ArrowRight, ShieldCheck, Zap, Globe, DollarSign, Check } from "lucide-react";
import Link from "next/link";

export default function WikiPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-slate-50 pt-48 pb-32 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#06C167] text-xs font-black mb-8 shadow-sm tracking-[0.2em]"
              >
                CENTRE D'AIDE & DOCS
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-none"
              >
                Maîtrisez <br/><span className="text-[#06C167]">Kitchenz.ai</span>.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-500 font-medium leading-relaxed"
              >
                Tout ce que vous devez savoir pour lancer, optimiser et scaler vos marques virtuelles grâce à l'Intelligence Artificielle.
              </motion.p>
            </div>
            <div className="hidden md:block">
               <div className="w-80 h-80 bg-[#06C167] rounded-[60px] rotate-12 flex items-center justify-center shadow-2xl shadow-[#06C167]/40 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10" />
                  <BookOpen className="w-40 h-40 text-white -rotate-12" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE TOPICS */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <DocCard 
              icon={<Sparkles className="w-8 h-8 text-[#06C167]" />}
              title="Audit de Marque"
              desc="Apprenez à utiliser l'IA pour analyser vos stocks et générer des concepts culinaires uniques."
              links={[
                { label: "Comment lancer un audit", href: "/wiki/lancer-un-audit" },
                { label: "Optimiser les entrées", href: "/wiki/optimiser-entrees" },
                { label: "Style visuel", href: "/wiki/style-visuel" }
              ]}
            />
            <DocCard 
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Intégration Uber Eats"
              desc="Guide complet sur l'export JSON et la publication de votre menu sur les plateformes."
              links={[
                { label: "Export JSON Uber Eats", href: "/wiki/export-json-uber" },
                { label: "Gestion des catégories", href: "/wiki/gestion-categories" },
                { label: "Mapping des prix", href: "/wiki/mapping-prix" }
              ]}
            />
            <DocCard 
              icon={<DollarSign className="w-8 h-8 text-emerald-500" />}
              title="Tarification & Marges"
              desc="Comprendre comment Kitchenz.ai calcule vos prix de vente pour garantir votre rentabilité."
              links={[
                { label: "Structure des coûts", href: "/wiki/structure-couts" },
                { label: "TVA & Commissions", href: "/wiki/tva-commissions" },
                { label: "Cibles de marge", href: "/wiki/cibles-marge" }
              ]}
            />
          </div>
        </div>
      </section>

      {/* PRICING TABLE (WIKI VERSION) */}
      <section className="py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Structure de Tarification</h2>
             <p className="text-slate-500 font-medium text-lg">Choisissez le plan adapté à la taille de votre cuisine.</p>
          </div>

          <div className="bg-white rounded-[50px] overflow-hidden shadow-2xl border border-slate-100">
             <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
                <PricingBlock plan="FREE" price="0€" desc="Pour les curieux" items={["1 Audit / mois", "Recettes standards", "Support Email"]} />
                <PricingBlock plan="PRO" price="49€" desc="Pour les chefs" items={["Audits illimités", "Images FLUX.1 HD", "Simulateur financier"]} highlight />
                <PricingBlock plan="BUSINESS" price="199€" desc="Pour les réseaux" items={["Multi-sites", "API dédiée", "Account Manager"]} />
             </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter">Besoin d'aide ?</h2>
          <p className="text-slate-500 text-xl font-medium mb-12">Nos experts en Dark Kitchen sont disponibles pour vous accompagner dans votre transition numérique.</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link href="mailto:support@kitchenz.ai" className="btn-primary text-lg">Contactez le support</Link>
            <Link href="/audit" className="btn-secondary text-lg">Lancer un Audit gratuit</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function DocCard({ icon, title, desc, links }: { icon: React.ReactNode, title: string, desc: string, links: { label: string, href: string }[] }) {
  return (
    <div className="p-10 bg-white border border-slate-100 rounded-[45px] hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group">
      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium mb-8 leading-relaxed">{desc}</p>
      <ul className="space-y-3">
        {links.map((link, i) => (
          <li key={i}>
            <Link href={link.href} className="text-slate-400 hover:text-[#06C167] font-bold text-sm flex items-center gap-2 transition-colors">
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" /> {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingBlock({ plan, price, desc, items, highlight }: { plan: string, price: string, desc: string, items: string[], highlight?: boolean }) {
  return (
    <div className={`p-12 flex flex-col ${highlight ? 'bg-slate-50/50' : 'bg-white'}`}>
       <span className={`text-[10px] font-black tracking-[0.3em] mb-4 ${highlight ? 'text-[#06C167]' : 'text-slate-400'}`}>{plan}</span>
       <h3 className="text-4xl font-black text-slate-900 mb-2">{price}</h3>
       <p className="text-slate-400 text-xs font-bold mb-10 uppercase tracking-widest">{desc}</p>
       <ul className="space-y-4 mb-12 flex-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-center gap-2 text-slate-600 font-bold text-sm">
               <Check className="w-4 h-4 text-[#06C167]" /> {item}
            </li>
          ))}
       </ul>
    </div>
  );
}
