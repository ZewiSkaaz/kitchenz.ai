"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User, Clock, ChevronRight } from "lucide-react";

const POSTS = [
  {
    title: "Comment Uber Eats a changé la donne pour les restaurateurs en 2024",
    excerpt: "Découvrez les nouvelles tendances de la livraison et comment adapter votre menu pour maximiser vos marges.",
    date: "24 Mars 2024",
    readTime: "5 min",
    category: "Stratégie",
    image: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "5 astuces pour réduire vos coûts matières avec l'IA",
    excerpt: "L'intelligence artificielle peut vous aider à optimiser vos stocks et à créer des recettes plus rentables.",
    date: "12 Mars 2024",
    readTime: "8 min",
    category: "Optimisation",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Le guide ultime du storytelling culinaire pour Dark Kitchen",
    excerpt: "Pourquoi l'histoire de votre marque est aussi importante que le goût de vos plats sur les plateformes.",
    date: "05 Mars 2024",
    readTime: "12 min",
    category: "Branding",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-48 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-black mb-8 shadow-sm tracking-[0.2em]"
          >
            NOTRE ACTUALITÉ
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8"
          >
            Le Mag des <span className="text-[#06C167]">Chefs IA</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium max-w-2xl mx-auto"
          >
            Conseils, stratégies et actualités sur le futur de la restauration livrée.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {POSTS.map((post, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[45px] overflow-hidden group border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#06C167] border border-white/50">
                  {post.category}
                </div>
              </div>
              <div className="p-10 flex-1 flex flex-col">
                <div className="flex items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">
                  <span className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-[#06C167] transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-slate-500 font-medium mb-10 line-clamp-3">
                  {post.excerpt}
                </p>
                <Link href="#" className="mt-auto inline-flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                  Lire l'article <ChevronRight className="w-4 h-4 text-[#06C167]" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
