"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, FileText, Lock } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#06C167] font-bold text-sm uppercase tracking-widest mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Conditions Générales de Vente et d'Utilisation</h1>
        <p className="text-slate-500 font-medium mb-12 italic">Dernière mise à jour : 4 mai 2026</p>

        <div className="space-y-12 text-slate-600 leading-relaxed text-lg">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
               <FileText className="w-6 h-6 text-[#06C167]" />
               <h2 className="text-xl font-bold uppercase tracking-tight">1. Objet</h2>
            </div>
            <p>
              Les présentes Conditions Générales (CGU/CGV) régissent l'utilisation de la plateforme Kitchenz.ai, un service fourni par ZACKVISION, permettant la génération de concepts culinaires assistée par intelligence artificielle.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
               <Scale className="w-6 h-6 text-[#06C167]" />
               <h2 className="text-xl font-bold uppercase tracking-tight">2. Services et Responsabilité</h2>
            </div>
            <p>
              Kitchenz.ai fournit des suggestions générées par IA. Le restaurateur reste seul responsable de la sécurité alimentaire, de l'hygiène et de la conformité des plats vendus sur les plateformes de livraison (Uber Eats, Deliveroo). L'IA ne remplace pas l'expertise humaine en cuisine.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
               <ShieldCheck className="w-6 h-6 text-[#06C167]" />
               <h2 className="text-xl font-bold uppercase tracking-tight">3. Propriété Intellectuelle</h2>
            </div>
            <p>
              Les logos et images générés par FLUX.1 via notre plateforme sont la propriété de l'utilisateur ayant payé son abonnement. Kitchenz.ai se réserve le droit d'utiliser les concepts générés à des fins de promotion du service, sauf demande contraire de l'utilisateur.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
               <Lock className="w-6 h-6 text-[#06C167]" />
               <h2 className="text-xl font-bold uppercase tracking-tight">4. Abonnements et Remboursements</h2>
            </div>
            <p>
              Les abonnements sont facturés mensuellement. En raison de la nature numérique et immédiate des générations IA, aucun remboursement ne sera effectué après l'utilisation des crédits de génération.
            </p>
          </section>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 mt-20">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">
               Des questions ? <a href="mailto:legal@kitchenz.ai" className="text-[#06C167] hover:underline">legal@kitchenz.ai</a>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
