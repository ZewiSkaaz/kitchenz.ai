"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Book, HelpCircle, Lightbulb, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const WIKI_DATA: Record<string, any> = {
  "lancer-un-audit": {
    title: "Comment lancer votre premier audit IA",
    desc: "Guide étape par étape pour transformer votre inventaire en marque rentable.",
    content: `
      <h2>1. Préparez votre inventaire</h2>
      <p>La qualité de l'audit dépend de la précision de vos ingrédients. Listez tout ce que vous avez en stock, même les condiments.</p>
      <h2>2. Définissez votre concept</h2>
      <p>Voulez-vous faire du burger, de la pizza ou du healthy ? L'IA s'adaptera à votre vision tout en optimisant les coûts.</p>
      <h2>3. Génération du menu</h2>
      <p>Une fois les données saisies, l'IA calcule les meilleures combinaisons de plats. Vous recevrez des noms de plats, des descriptions et des prix de vente suggérés.</p>
    `
  },
  "export-json-uber": {
    title: "Export JSON pour Uber Eats",
    desc: "Automatisez la création de votre menu sur Uber Eats Manager.",
    content: `
      <h2>Pourquoi utiliser l'export JSON ?</h2>
      <p>Gagner du temps et éviter les erreurs de saisie manuelle. Notre format est compatible avec l'importateur de menus Uber Eats.</p>
      <h2>Procédure d'import</h2>
      <p>1. Téléchargez le fichier JSON depuis votre dashboard.<br/>2. Allez sur Uber Eats Manager.<br/>3. Utilisez l'outil d'importation de catalogue.</p>
    `
  },
  "structure-couts": {
    title: "Structure des coûts et rentabilité",
    desc: "Comprendre comment nous calculons vos marges nettes.",
    content: `
      <h2>Calcul du Coût Matière (Food Cost)</h2>
      <p>Nous estimons le coût de chaque ingrédient pour arriver à un coût total par plat. L'objectif est de maintenir ce coût entre 25% et 30% du prix de vente.</p>
      <h2>Les frais de plateforme</h2>
      <p>Nous intégrons automatiquement les 30% de commission Uber Eats et la TVA (10% en France sur la livraison) pour vous donner une marge réelle.</p>
    `
  }
};

export default function WikiDetailPage() {
  const params = useParams();
  const doc = WIKI_DATA[params.slug as string];

  if (!doc) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-slate-400">Documentation non trouvée</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-32 pb-32 max-w-5xl mx-auto px-6">
        <Link href="/wiki" className="inline-flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-12 hover:text-slate-900 transition-all">
          <ArrowLeft className="w-4 h-4" /> Retour au Wiki
        </Link>

        <div className="grid md:grid-cols-3 gap-12">
          {/* SIDEBAR NAVIGATION */}
          <div className="md:col-span-1 space-y-4">
             <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Articles Populaires</h3>
                <ul className="space-y-4">
                   {Object.entries(WIKI_DATA).map(([slug, data]: [string, any]) => (
                     <li key={slug}>
                        <Link href={`/wiki/${slug}`} className={`text-sm font-bold transition-all ${params.slug === slug ? 'text-[#06C167]' : 'text-slate-400 hover:text-slate-900'}`}>
                           {data.title}
                        </Link>
                     </li>
                   ))}
                </ul>
             </div>
             
             <div className="p-8 bg-slate-900 rounded-3xl text-white">
                <HelpCircle className="w-8 h-8 text-[#06C167] mb-4" />
                <h4 className="text-lg font-black mb-2">Besoin d'aide ?</h4>
                <p className="text-slate-400 text-xs font-medium mb-6">Nos experts sont disponibles 7j/7 pour vous accompagner.</p>
                <button className="w-full py-3 bg-[#06C167] rounded-xl text-xs font-black uppercase tracking-widest">Chatter avec nous</button>
             </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="md:col-span-2">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-12 md:p-16 rounded-[45px] border border-slate-100 shadow-xl shadow-slate-200/40"
             >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#06C167]/10 text-[#06C167] text-[10px] font-black rounded-lg mb-8 uppercase tracking-widest">
                   Guide Expert
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-none">{doc.title}</h1>
                <p className="text-xl text-slate-400 font-medium mb-12 leading-relaxed">{doc.desc}</p>
                
                <div className="h-px bg-slate-50 mb-12" />

                <div 
                  className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-500 prose-p:font-medium prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: doc.content }}
                />

                <div className="mt-16 p-8 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                   <div className="p-3 bg-blue-500 rounded-2xl h-fit">
                      <Lightbulb className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-1">Le saviez-vous ?</h4>
                      <p className="text-blue-700/70 text-xs font-medium">Les marques qui utilisent des fiches techniques précises augmentent leur marge nette de 12% en moyenne dès le premier mois.</p>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
