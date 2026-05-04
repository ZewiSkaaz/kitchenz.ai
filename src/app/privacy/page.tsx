"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto pt-40 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-slate max-w-none"
        >
          <h1 className="text-4xl font-bold text-black mb-8">Politique de Confidentialité</h1>
          <p className="text-gray-500 mb-6 font-medium">Dernière mise à jour : 4 mai 2026</p>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">1. Collecte des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous collectons les informations nécessaires à la création de vos marques culinaires, notamment vos listes d'ingrédients, vos photos de stocks et vos identifiants de connexion Uber Eats (via OAuth sécurisé).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">2. Utilisation de l'Intelligence Artificielle</h2>
            <p className="text-gray-600 leading-relaxed">
              Kitchenz.ai utilise les services d'OpenAI et HuggingFace pour analyser vos données. Aucune donnée personnelle identifiable n'est utilisée pour entraîner des modèles publics sans votre consentement explicite.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">3. Sécurité des données Uber Eats</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos accès Uber Eats sont stockés de manière chiffrée. Kitchenz.ai ne peut interagir avec votre compte que dans le but de synchroniser vos menus et vos stocks.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">4. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question concernant vos données, contactez-nous à : <span className="font-bold">legal@kitchenz.ai</span>
            </p>
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
