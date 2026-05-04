import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any, // Utilisation de la version la plus stable
});

export const PLANS = {
  STARTER: {
    name: 'Starter',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER, // À remplir dans .env
    auditsLimit: 1,
    brandsLimit: 1,
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    auditsLimit: 5,
    brandsLimit: 3,
  },
  EMPIRE: {
    name: 'Empire',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_EMPIRE,
    auditsLimit: 999,
    brandsLimit: 999,
  }
};
