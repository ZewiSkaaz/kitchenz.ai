# Kitchenz.ai 🍳
### L'Intelligence Artificielle au service des Dark Kitchens

Kitchenz.ai est une plateforme SaaS permettant aux restaurateurs de transformer leur inventaire en marques virtuelles rentables sur Uber Eats et Deliveroo.

## ✨ Fonctionnalités
- **Audit IA** : Scannez vos stocks et générez des concepts culinaires uniques.
- **Images HD** : Génération automatique de visuels de plats via FLUX.1.
- **Simulateur de Rentabilité** : Calculez vos marges réelles après commissions et TVA.
- **Export Uber Eats** : Générez des fichiers JSON prêts à l'importation.

## 🛠 Tech Stack
- **Framework** : Next.js 14+ (App Router)
- **Design** : Tailwind CSS (Premium Light Theme)
- **Animations** : Framer Motion
- **Backend** : Supabase
- **IA** : OpenAI (GPT-4) & Replicate (Flux.1)

## 🚀 Installation

```bash
# Installation des dépendances
npm install

# Lancer en développement
npm run dev
```

## 🌐 Déploiement
Le projet est configuré pour être déployé sur **Render** via le fichier `render.yaml`.
N'oubliez pas de configurer vos variables d'environnement :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`

---
Propulsé par **ZACKVISION**
