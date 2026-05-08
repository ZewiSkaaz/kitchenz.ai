"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <header className="bg-slate-50 pt-48 pb-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[#06C167] text-xs font-black mb-8 shadow-sm tracking-[0.2em]"
          >
            CADRE LÉGAL
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6"
          >
            Conditions <br/><span className="text-[#06C167]">Générales</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 font-medium"
          >
            Règles d'utilisation du service Kitchenz.ai
          </motion.p>
        </div>
      </header>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 prose prose-slate prose-lg">
          <div className="space-y-12 text-slate-600">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Acceptation des termes</h2>
              <p className="leading-relaxed">
                En accédant au service Kitchenz.ai, vous acceptez d'être lié par les présentes conditions générales d'utilisation. Le service est réservé aux professionnels de la restauration.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Description du service</h2>
              <p className="leading-relaxed">
                Kitchenz.ai est un outil d'aide à la décision basé sur l'intelligence artificielle. Les audits et recommandations (prix, recettes, visuels) sont fournis à titre indicatif. L'utilisateur reste seul responsable de la mise en œuvre opérationnelle et de la conformité de ses produits aux normes sanitaires.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">3. Abonnements & Remboursements</h2>
              <p className="leading-relaxed">
                Le service est facturé sous forme d'abonnement mensuel ou annuel. Tout mois entamé est dû. Le désabonnement est possible à tout moment depuis l'espace client et prendra effet à la fin de la période de facturation en cours.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">4. Propriété Intellectuelle</h2>
              <p className="leading-relaxed">
                Les concepts de marque générés par Kitchenz.ai pour l'utilisateur lui appartiennent. Toutefois, le moteur d'IA, les algorithmes et le design de la plateforme restent la propriété exclusive de Kitchenz.ai.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
