"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planType: string) => {
    setLoadingPlan(planType);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      const data = await response.json();
      
      if (response.status === 401) {
        // Rediriger vers la page de connexion s'ils ne sont pas authentifiés
        router.push("/login?redirect=/pricing");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Une erreur est survenue lors de la création de la session de paiement.");
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
      alert("Erreur de connexion au serveur.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-24">
            <h1 className="text-4xl md:text-6xl font-bold text-black tracking-tight mb-6">
              Une solution rentabilisée <br />
              <span className="text-[#06C167]">immédiatement</span>.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Choisissez le plan qui correspond à l'ambition de votre marque virtuelle.
              Passez à la vitesse supérieure et automatisez votre croissance sur Uber Eats.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Starter */}
            <PricingCard
              plan="Starter"
              planType="STARTER"
              price="0"
              features={["1 Audit par mois", "Recettes IA basiques", "Export Manuel", "Support Communauté"]}
              loadingPlan={loadingPlan}
              onCheckout={handleCheckout}
            />

            {/* Plan Pro */}
            <PricingCard
              plan="Pro"
              planType="PRO"
              price="49"
              popular
              features={[
                "Audits Illimités",
                "Images FLUX.1 (HD)",
                "Simulateur de Rentabilité",
                "Export Uber Eats Automatique",
              ]}
              loadingPlan={loadingPlan}
              onCheckout={handleCheckout}
            />

            {/* Plan Empire */}
            <PricingCard
              plan="Empire"
              planType="EMPIRE"
              price="199"
              features={[
                "Multi-Établissements",
                "Clés API Dédiées",
                "Accompagnement Stratégique",
                "Audit Prioritaire",
              ]}
              loadingPlan={loadingPlan}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PricingCard({
  plan,
  planType,
  price,
  features,
  popular,
  loadingPlan,
  onCheckout,
}: {
  plan: string;
  planType: string;
  price: string;
  features: string[];
  popular?: boolean;
  loadingPlan: string | null;
  onCheckout: (planType: string) => void;
}) {
  const isLoading = loadingPlan === planType;

  return (
    <div
      className={`p-10 rounded-2xl flex flex-col border transition-all duration-500 ${
        popular
          ? "bg-white border-[#06C167] shadow-xl md:scale-105 z-10"
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      {popular && (
        <span className="bg-[#06C167] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded w-fit mb-6 shadow-sm">
          Recommandé
        </span>
      )}
      <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
        {plan}
      </h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-5xl font-black text-black tracking-tight">
          {price}€
        </span>
        <span className="text-gray-400 font-medium text-sm">/ mois</span>
      </div>
      
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-600 text-sm font-medium">
            <Check className="w-5 h-5 text-[#06C167] shrink-0" />
            <span className="leading-tight">{f}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onCheckout(planType)}
        disabled={loadingPlan !== null}
        className={`w-full flex items-center justify-center font-bold rounded-lg transition-all ${
          popular
            ? "bg-[#06C167] hover:bg-[#05a356] text-white"
            : "bg-black hover:bg-gray-800 text-white"
        } !py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Redirection...
          </>
        ) : planType === "STARTER" ? (
          "Sélectionner Gratuit"
        ) : (
          `Choisir le plan ${plan}`
        )}
      </button>
    </div>
  );
}
