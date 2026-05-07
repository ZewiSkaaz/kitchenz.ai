"use client";

import { motion } from "framer-motion";
import { Utensils, Fish, Pizza, Sandwich, ArrowRight, Zap, TrendingUp, Target, Plus, ChefHat } from "lucide-react";
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
      details: "Un bistro traditionnel utilise ses viandes et fromages AOP pour dominer le marché du burger premium.",
      copyPasteIngredients: "Entrecôte de bœuf (frais), Poitrine de porc, Brie, Comté, Oignons, Salade mesclun, Tomates, Pommes de terre, Beurre, Huile, Farine, Œufs, Sel, Poivre, Moutarde, Crème liquide.",
      copyPasteEquipment: "Four à convection, Plancha, Friteuse, Robot coupe, Mixeur plongeant, Balance, Saladette, Couteau de chef, Bacs GN.",
      result: "Marge brute +18% | Panier moyen +5€",
      tag: "Premium"
    },
    {
      title: "Sushi Shop ➡️ Poke Fusion",
      icon: <Fish className="w-10 h-10 text-blue-600" />,
      color: "bg-blue-50",
      border: "border-blue-100",
      strategy: "Optimisation des chutes de poisson",
      details: "Transformez vos surplus de poisson frais en bowls colorés ultra-rentables sans matériel supplémentaire.",
      copyPasteIngredients: "Saumon frais entier, Thon rouge, Crevettes décortiquées, Riz vinaigré japonais, Avocats mûrs, Mangues fraîches, Edamame surgelés, Gingembre mariné, Algues Wakamé, Graines de sésame noir, Sauce soja salée, Sauce soja sucrée, Huile de sésame, Vinaigre de riz, Wasabi, Radis daikon, Concombres, Oignons frits (sec), Mayo japonaise, Sriracha, Jus de citron vert, Coriandre fraîche.",
      copyPasteEquipment: "Cuiseur à riz (Ricer), Couteau Yanagiba (sashimi), Saladette réfrigérée, Balance électronique, Planche à découper PEHD, Bols de service, Pinces de précision, Machine à glace pilée.",
      result: "Gaspillage -30% | CA livraison +25%",
      tag: "Eco-Friendly"
    },
    {
      title: "Pizzeria ➡️ Panuozzo Shop",
      icon: <Pizza className="w-10 h-10 text-red-600" />,
      color: "bg-red-50",
      border: "border-red-100",
      strategy: "Nouveau format de vente",
      details: "Utilisez votre pâte à pizza pour créer des sandwichs italiens pressés, la nouvelle tendance Uber Eats.",
      copyPasteIngredients: "Pâtons de pizza fermentés (frais), Mozzarella di Bufala, Jambon de Parme, Speck fumé, Mortadelle, Burrata crémeuse, Tomates séchées, Pesto basilic maison, Roquette fraîche, Huile d'olive extra vierge, Origan séché, Olives Taggiasche, Artichauts marinés, Crème de truffe, Parmesan Reggiano, Sel fin, Poivre du moulin.",
      copyPasteEquipment: "Four à pizza (Bois ou Électrique), Pétrin spirale, Presse à Panini rainurée, Trancheuse à jambon pro, Saladette à condiments, Pelle à pizza, Thermomètre infrarouge, Bac de fermentation.",
      result: "Livraison facilitée | 0€ d'investissement",
      tag: "Efficience"
    },
    {
      title: "Kebab Shop ➡️ Smash Sultan",
      icon: <ChefHat className="w-10 h-10 text-emerald-600" />,
      color: "bg-emerald-50",
      border: "border-emerald-100",
      strategy: "Hybridation & Pivot Premium",
      details: "Utilisez votre base technique (broches, sauces, plancha) pour lancer une marque de burgers fusion Cyber-Oriental.",
      copyPasteIngredients: "Broche Kebab (Veau/Dinde), Filet de poulet mariné, Steak haché 20% MG, Merguez, Tenders, Pain Kebab rond, Galettes Tortillas (Dürüm), Pain Baguette, Laitue Iceberg, Tomates, Oignons rouges, Chou Rouge, Concombres, Poivrons, Sauce Blanche maison, Sauce Algérienne, Sauce Samouraï, Biggy Burger, Harissa, Cheddar tranches, Emmental râpé, Boursin, Feta, Frites surgelées, Ayran, Boissons Softs.",
      copyPasteEquipment: "Rôtissoire verticale (Döner), Couteau électrique, Friteuse double cuve, Plancha/Grill, Presse à Panini, Saladette réfrigérée GN, Armoire négative, Toaster salamandre.",
      result: "Rentabilité record | Marge nette +22%",
      tag: "Best-Seller"
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
            Copiez, Collez, <br/><span className="text-[#06C167]">Lancez l'Audit.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Utilisez ces listes ultra-complètes pour tester la puissance de notre IA dans votre situation réelle.
          </p>
        </div>
      </section>

      {/* CASES GRID */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
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

              <div className="space-y-8 mb-10">
                {/* COPY-PASTE INGREDIENTS */}
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingrédients (Prêt à copier)</h4>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(c.copyPasteIngredients);
                        alert("Liste copiée !");
                      }}
                      className="text-[10px] font-black text-[#06C167] uppercase border-b-2 border-[#06C167]"
                    >
                      Copier
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-100 line-clamp-3">
                    {c.copyPasteIngredients}
                  </p>
                </div>

                {/* COPY-PASTE EQUIPMENT */}
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matériel (Prêt à copier)</h4>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(c.copyPasteEquipment);
                        alert("Liste copiée !");
                      }}
                      className="text-[10px] font-black text-[#06C167] uppercase border-b-2 border-[#06C167]"
                    >
                      Copier
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-100 line-clamp-3">
                    {c.copyPasteEquipment}
                  </p>
                </div>
              </div>

                <div className="flex items-center justify-between p-6 bg-[#06C167]/5 rounded-3xl border border-[#06C167]/10">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#06C167]" />
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Impact Business</span>
                  </div>
                  <span className="text-sm font-black text-[#06C167] uppercase">{c.result}</span>
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
