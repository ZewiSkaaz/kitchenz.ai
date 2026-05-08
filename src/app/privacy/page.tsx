"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
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
            SÉCURITÉ & DONNÉES
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6"
          >
            Politique de <br/><span className="text-[#06C167]">Confidentialité</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 font-medium"
          >
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </motion.p>
        </div>
      </header>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 prose prose-slate prose-lg">
          <div className="space-y-12 text-slate-600">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Collecte des données</h2>
              <p className="leading-relaxed">
                Kitchenz.ai collecte les informations nécessaires à la création de vos marques virtuelles : nom, adresse e-mail, informations sur votre établissement (SIRET, adresse) et inventaire de cuisine. Ces données sont utilisées exclusivement pour personnaliser vos audits IA.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Utilisation de l'IA</h2>
              <p className="leading-relaxed">
                Les données relatives à votre cuisine sont traitées par nos modèles d'intelligence artificielle pour générer des recommandations. Nous ne vendons jamais vos données métier à des tiers.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">3. Paiements & Sécurité</h2>
              <p className="leading-relaxed">
                Toutes les transactions financières sont gérées par <strong>Stripe</strong>. Kitchenz.ai ne stocke aucune information de carte bancaire sur ses propres serveurs. Vos données de connexion sont sécurisées via <strong>Supabase Auth</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">4. Vos Droits</h2>
              <p className="leading-relaxed">
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ce droit à tout moment depuis votre Dashboard ou en contactant notre support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
