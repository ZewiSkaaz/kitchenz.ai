"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, MessageCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const POSTS_DATA: Record<string, any> = {
  "uber-eats-strategie-2024": {
    title: "Comment Uber Eats a changé la donne pour les restaurateurs en 2024",
    date: "24 Mars 2024",
    readTime: "5 min",
    category: "Stratégie",
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=800",
    content: `
      <p>L'année 2024 marque un tournant décisif dans le monde de la livraison de repas. Avec l'évolution des comportements des consommateurs et l'augmentation de la concurrence, Uber Eats a dû adapter ses algorithmes.</p>
      <h2>La fin du "tout-venant"</h2>
      <p>Aujourd'hui, il ne suffit plus de mettre son menu en ligne pour réussir. Les algorithmes privilégient désormais les marques qui ont un storytelling fort et des visuels impeccables. C'est ici que Kitchenz.ai intervient pour vous aider à sortir du lot.</p>
      <h2>L'importance des combos</h2>
      <p>Les données montrent que les "Menus Combo" (plat + side + boisson) représentent désormais 65% des ventes sur la plateforme. Notre IA optimise automatiquement ces combinaisons pour maximiser votre panier moyen.</p>
    `
  },
  "optimiser-couts-ia": {
    title: "5 astuces pour réduire vos coûts matières avec l'IA",
    date: "12 Mars 2024",
    readTime: "8 min",
    category: "Optimisation",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",
    content: `
      <p>Le coût matière est le premier poste de dépense en restauration. L'IA permet aujourd'hui d'analyser vos stocks avec une précision chirurgicale.</p>
      <h2>1. Utilisez vos restes intelligemment</h2>
      <p>Notre IA peut suggérer des plats "signatures" basés exclusivement sur vos ingrédients actuels, évitant ainsi le gaspillage.</p>
      <h2>2. Standardisation des fiches techniques</h2>
      <p>Chaque gramme compte. En suivant les fiches techniques générées par Kitchenz.ai, vous garantissez une marge constante sur chaque plat vendu.</p>
    `
  },
  "storytelling-dark-kitchen": {
    title: "Le guide ultime du storytelling culinaire pour Dark Kitchen",
    date: "05 Mars 2024",
    readTime: "12 min",
    category: "Branding",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
    content: `
      <p>Dans une Dark Kitchen, l'écran est votre seule vitrine. Le client mange avec les yeux avant même de commander.</p>
      <h2>Créez une émotion</h2>
      <p>Votre marque doit raconter quelque chose. Est-ce un voyage en Italie ? Un souvenir d'enfance ? Kitchenz.ai vous aide à définir cet univers visuel et sémantique.</p>
      <h2>La cohérence visuelle</h2>
      <p>Tous vos visuels (logo, photos de plats, bannières) doivent appartenir au même univers. Nos outils de génération d'images garantissent cette harmonie.</p>
    `
  }
};

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const post = POSTS_DATA[params.slug as string];

  if (!post) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest">Article non trouvé</div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <article className="pt-32 pb-32">
        {/* HERO ARTICLE */}
        <header className="max-w-4xl mx-auto px-6 mb-16">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-12 hover:text-slate-900 transition-all">
            <ArrowLeft className="w-4 h-4" /> Retour au blog
          </Link>
          
          <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
            <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[#06C167]">{post.category}</span>
            <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {post.date}</span>
            <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {post.readTime} de lecture</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-12 leading-none">
            {post.title}
          </h1>

          <div className="aspect-[21/9] rounded-[50px] overflow-hidden shadow-2xl">
             <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
          </div>
        </header>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto px-6">
           <div 
             className="prose prose-slate prose-lg lg:prose-xl max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-500 prose-p:font-medium prose-p:leading-relaxed"
             dangerouslySetInnerHTML={{ __html: post.content }}
           />
           
           <div className="mt-20 pt-12 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-[#06C167] rounded-2xl flex items-center justify-center text-white font-black">K</div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Équipe Kitchenz</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experts IA & Restauration</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400"><Share2 className="w-5 h-5" /></button>
                 <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400"><MessageCircle className="w-5 h-5" /></button>
              </div>
           </div>
        </div>
      </article>

      {/* FOOTER CTA */}
      <section className="bg-slate-900 py-32">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Prêt à transformer <br/><span className="text-[#06C167]">votre restaurant ?</span></h2>
            <Link href="/audit" className="btn-primary text-xl">Lancer mon Audit IA Gratuit</Link>
         </div>
      </section>
    </div>
  );
}
