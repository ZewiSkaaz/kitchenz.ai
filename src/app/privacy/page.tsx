"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#06C167] bg-[#06C167]/10 px-4 py-1.5 rounded-full border border-[#06C167]/10">
            Légal
          </span>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mt-6 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-slate-400 font-medium">Dernière mise à jour : 4 mai 2026</p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-12 space-y-10">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              Kitchenz.ai (&ldquo;nous&rdquo;, &ldquo;notre&rdquo; ou &ldquo;la Société&rdquo;) s&apos;engage à protéger la vie privée des utilisateurs de notre plateforme SaaS d&apos;intelligence artificielle pour la restauration. La présente Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">2. Données collectées</h2>
            <p className="text-slate-600 leading-relaxed mb-4">Nous collectons les informations suivantes :</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> <strong>Données de compte :</strong> adresse e-mail, mot de passe chiffré.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> <strong>Données de marque :</strong> nom de restaurant, style culinaire, menu, prix.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> <strong>Données d&apos;intégration :</strong> jetons d&apos;accès aux services tiers (Uber Eats) stockés de manière chiffrée.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> <strong>Données d&apos;utilisation :</strong> logs de connexion, interactions avec la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">3. Utilisation des données</h2>
            <p className="text-slate-600 leading-relaxed mb-4">Vos données sont utilisées exclusivement pour :</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Fournir et améliorer les services Kitchenz.ai.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Générer des menus, visuels et analyses via l&apos;IA.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Synchroniser vos menus avec des plateformes tierces (Uber Eats) avec votre consentement explicite.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Vous envoyer des communications relatives à votre compte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">4. Intégrations tierces (Uber Eats)</h2>
            <p className="text-slate-600 leading-relaxed">
              Lorsque vous connectez votre compte Uber Eats à Kitchenz.ai, nous accédons uniquement aux données nécessaires à la gestion de votre menu de restaurant (lecture/écriture du menu, informations sur votre établissement). Nous ne collectons ni ne stockons vos données personnelles Uber au-delà du jeton d&apos;accès OAuth nécessaire à l&apos;intégration. Vous pouvez révoquer cet accès à tout moment depuis les paramètres de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">5. Stockage et sécurité</h2>
            <p className="text-slate-600 leading-relaxed">
              Vos données sont stockées de manière sécurisée sur l&apos;infrastructure Supabase (EU-West, conformité RGPD). Nous appliquons des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">6. Vos droits (RGPD)</h2>
            <p className="text-slate-600 leading-relaxed mb-4">Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Droit d&apos;accès à vos données personnelles.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Droit de rectification des données inexactes.</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Droit à l&apos;effacement (&ldquo;droit à l&apos;oubli&rdquo;).</li>
              <li className="flex gap-3"><span className="text-[#06C167] font-black">•</span> Droit à la portabilité de vos données.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">7. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              Pour toute question relative à cette politique, contactez-nous à : <a href="mailto:privacy@kitchenz.ai" className="text-[#06C167] font-bold hover:underline">privacy@kitchenz.ai</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
