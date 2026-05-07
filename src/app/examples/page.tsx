"use client";

import { motion } from "framer-motion";
import { Utensils, Fish, Pizza, Sandwich, ArrowRight, Zap, TrendingUp, Target, Plus } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ExamplesPage() {
  const cases = [
    {
      title: "Bistro ➡️ Burger Gourmet",
      icon: <Utensils className="w-10 h-10 text-slate-900" />,
      color: "bg-amber-50",
      border: "border-amber-100",
      strategy: "Exploitation des produits nobles",
      details: "Un bistro traditionnel utilise ses restes d'Entrecôte et son Brie de Meaux pour créer une marque de Burgers 'Signature' à 25€ sur Uber Eats.",
      inventory: ["Entrecôte", "Brie de Meaux", "Oignons rouges", "Pommes de terre"],
      result: "Marge brute +18% | Panier moyen +5€",
      tag: "Premium"
    },
    {
      title: "Sushi Shop ➡️ Poke Fusion",
      icon: <Fish className="w-10 h-10 text-blue-600" />,
      color: "bg-blue-50",
      border: "border-blue-100",
      strategy: "Optimisation des chutes de poisson",
      details: "Le surplus de Saumon et de Thon (non utilisable pour les Nigiris) est transformé en Poke Bowls colorés avec une identité visuelle Zen.",
      inventory: ["Saumon", "Thon", "Riz vinaigré", "Avocat", "Mangue"],
      result: "Gaspillage alimentaire -30% | CA livraison +25%",
      tag: "Eco-Friendly"
    },
    {
      title: "Pizzeria ➡️ Panuozzo Shop",
      icon: <Pizza className="w-10 h-10 text-red-600" />,
      color: "bg-red-50",
      border: "border-red-100",
      strategy: "Nouveau format de vente",
      details: "La pâte à pizza et les garnitures italiennes sont utilisées pour créer des sandwichs 'Panuozzo' cuits au four, parfaits pour le transport.",
      inventory: ["Pâte à pizza", "Burrata", "Parme", "Pesto", "Roquette"],
      result: "Facilité de livraison 10/10 | Pas de matériel sup.",
      tag: "Efficience"
    },
    {
      title: "Boulangerie ➡️ Lunch Club",
      icon: <Sandwich className="w-10 h-10 text-orange-600" />,
      color: "bg-orange-50",
      border: "border-orange-100",
      strategy: "Valorisation du savoir-faire",
      details: "Le pain artisanal et les invendus sont transformés en une marque de sandwicherie haut de gamme avec des fiches techniques précises.",
      inventory: ["Baguette Tradition", "Lardons", "Œufs", "Fromage de chèvre"],
      result: "CA du midi doublé | Ticket moyen 18€",
      tag: "Profit"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* HEADER */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#06C167]/10 text-[#06C167] text-xs font-black mb-8 tracking-[0.3em] uppercase border border-[#06C167]/20"
          >
            Bibliothèque de Combinaisons
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 leading-none">
            Inspirez-vous des <br/><span className="text-[#06C167]">meilleurs pivots.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Découvrez comment d'autres restaurateurs ont utilisé Kitchenz.ai pour transformer leur inventaire en marques digitales ultra-rentables.
          </p>
        </div>
      </section>

      {/* CASES GRID */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((c, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-12 rounded-[48px] bg-white border ${c.border} shadow-sm hover:shadow-xl transition-all group relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${c.color} opacity-50 blur-3xl group-hover:scale-150 transition-transform`} />
              
              <div className="flex justify-between items-start mb-10 relative">
                <div className={`p-5 rounded-3xl ${c.color} border ${c.border}`}>
                  {c.icon}
                </div>
                <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">{c.tag}</span>
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{c.title}</h2>
              <div className="flex items-center gap-2 mb-6">
                 <Target className="w-4 h-4 text-[#06C167]" />
                 <span className="text-sm font-bold text-[#06C167] uppercase tracking-widest">{c.strategy}</span>
              </div>
              
              <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                {c.details}
              </p>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inventaire Clé</h4>
                  <div className="flex flex-wrap gap-2">
                    {c.inventory.map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-[#06C167]/5 rounded-3xl border border-[#06C167]/10">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#06C167]" />
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Impact Business</span>
                  </div>
                  <span className="text-sm font-black text-[#06C167] uppercase">{c.result}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6">
         <div className="max-w-4xl mx-auto bg-slate-900 rounded-[60px] p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="relative z-10">
               <Zap className="w-12 h-12 text-[#06C167] mx-auto mb-6" />
               <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Et vous ? Quel sera votre prochain pivot ?</h2>
               <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                 Notre IA est capable de s'adapter à n'importe quel stock, même les plus complexes. Testez dès maintenant.
               </p>
               <Link href="/audit" className="btn-primary inline-flex items-center gap-3 py-4 px-10 text-lg group">
                 Démarrer mon Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}
