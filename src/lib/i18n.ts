type Locales = 'fr' | 'en' | 'es';

const translations = {
  fr: {
    hero: {
      title: "Vendez plus sur Uber Eats avec l'IA.",
      subtitle: "Kitchenz.ai transforme vos stocks en marques virtuelles optimisées. Gagnez en visibilité et en rentabilité.",
      cta: "Lancer l'Audit Gratuit"
    },
    nav: {
      features: "Fonctionnalités",
      pricing: "Tarifs",
      dashboard: "Dashboard",
      login: "Connexion",
      logout: "Déconnexion"
    },
    dashboard: {
      welcome: "Bienvenue",
      active_brands: "Marques Actives",
      total_items: "Articles de Menu",
      sync_status: "Statut Synchro",
      no_brands: "Aucune marque active",
      create_first: "Créer ma première marque",
      manage: "Gérer"
    },
    editor: {
      identity: "Identité",
      menu: "Articles",
      settings: "Paramètres",
      save: "Enregistrer",
      saving: "Enregistrement...",
      synced: "Menu sauvegardé !",
      add_item: "Ajouter un article"
    }
  },
  en: {
    hero: {
      title: "Sell more on Uber Eats with AI.",
      subtitle: "Kitchenz.ai transforms your inventory into optimized virtual brands. Boost your visibility and profitability.",
      cta: "Start Free Audit"
    },
    nav: {
      features: "Features",
      pricing: "Pricing",
      dashboard: "Dashboard",
      login: "Login",
      logout: "Logout"
    },
    dashboard: {
      welcome: "Welcome",
      active_brands: "Active Brands",
      total_items: "Menu Items",
      sync_status: "Sync Status",
      no_brands: "No active brands",
      create_first: "Create my first brand",
      manage: "Manage"
    },
    editor: {
      identity: "Identity",
      menu: "Items",
      settings: "Settings",
      save: "Save",
      saving: "Saving...",
      synced: "Menu synced!",
      add_item: "Add item"
    }
  },
  es: {
    hero: {
      title: "Venda más en Uber Eats con IA.",
      subtitle: "Kitchenz.ai transforma su inventario en marcas virtuales optimizadas. Aumente su visibilidad y rentabilidad.",
      cta: "Iniciar Auditoría Gratuita"
    },
    nav: {
      features: "Funcionalidades",
      pricing: "Precios",
      dashboard: "Panel",
      login: "Acceder",
      logout: "Cerrar sesión"
    },
    dashboard: {
      welcome: "Bienvenido",
      active_brands: "Marcas Activas",
      total_items: "Artículos",
      sync_status: "Estado Sincro",
      no_brands: "Sin marcas activas",
      create_first: "Crear mi primera marca",
      manage: "Gestionar"
    },
    editor: {
      identity: "Identidad",
      menu: "Artículos",
      settings: "Ajustes",
      save: "Guardar",
      saving: "Guardando...",
      synced: "¡Menú guardado!",
      add_item: "Añadir artículo"
    }
  }
};

export function getTranslation(lang: Locales) {
  return translations[lang] || translations.fr;
}
