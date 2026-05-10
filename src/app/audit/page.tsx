"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChefHat, Utensils, Zap, Sparkles, ArrowRight, Loader2, ShieldCheck, Image as ImageIcon, Coffee, CakeSlice, Bot, ZapOff, Download, Check, Store, MapPin } from "lucide-react";
import { PRICING, calculateSellingPrice } from "@/lib/ai";
import { generateBrandCoreAction, generateCoreItemsAction, generateMenuAssemblyAction, analyzeInventoryImageAction, generateMenuItemImageAction, generateBrandImagesAction } from "@/app/actions/aiActions";
import { useRef } from "react";
import { supabase } from "@/lib/supabase";

type Step = "establishment" | "concept" | "ingredients" | "extras" | "equipment" | "flexibility" | "generating" | "result";

const STEP_ORDER: Step[] = ["establishment", "concept", "ingredients", "extras", "equipment", "flexibility", "result"];

export default function AuditPage() {
  const [step, setStep] = useState<Step>("establishment");
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        checkUberConnection(session.user.id);
        fetchEstablishments(session.user.id);
      }
    };
    checkUser();
  }, []);

  const checkUberConnection = async (userId: string) => {
    const { data } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", "uber_eats")
      .single();
    setUberConnected(!!data);
  };

  const fetchEstablishments = async (userId: string) => {
    const { data } = await supabase.from("establishments").select("*").eq("user_id", userId);
    if (data) setEstablishments(data);
  };

  const handleEstablishmentSelect = (id: string) => {
    const est = establishments.find(e => e.id === id);
    if (est) {
      setSelectedEstablishmentId(id);
      setLocation(est.city || "");
      if (est.default_ingredients && Array.isArray(est.default_ingredients)) setIngredients(est.default_ingredients);
      if (est.default_equipment && Array.isArray(est.default_equipment)) setEquipment(est.default_equipment);
    }
  };
  
  // Data State
  const [brandName, setBrandName] = useState("");
  const [concept, setConcept] = useState("");
  const [visualStyle, setVisualStyle] = useState("");
  const [location, setLocation] = useState("");
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>("");

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  
  const [drinks, setDrinks] = useState<string[]>([]);
  const [currentDrink, setCurrentDrink] = useState("");
  
  const [desserts, setDesserts] = useState<string[]>([]);
  const [currentDessert, setCurrentDessert] = useState("");

  const [equipment, setEquipment] = useState<string[]>([]);
  const [currentEquipment, setCurrentEquipment] = useState("");

  // Flexibility State
  const [allowNewIngredients, setAllowNewIngredients] = useState(false);
  const [allowNewEquipment, setAllowNewEquipment] = useState(false);

  // Result State
  const [fullMenu, setFullMenu] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState("");
  const [selectedItemForRecipe, setSelectedItemForRecipe] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);
  
  // Simulation State
  const [rent, setRent] = useState(1200);
  const [staff, setStaff] = useState(2500);
  const [dailyOrders, setDailyOrders] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [uberConnected, setUberConnected] = useState(false);
  const [analyzingInventory, setAnalyzingInventory] = useState(false);
  const inventoryInputRef = useRef<HTMLInputElement>(null);

  // Persistence logic (Master Audit #4)
  useEffect(() => {
    const savedDraft = localStorage.getItem("kitchenz_audit_draft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setBrandName(draft.brandName || "");
        setConcept(draft.concept || "");
        setVisualStyle(draft.visualStyle || "");
        setLocation(draft.location || "");
        setIngredients(draft.ingredients || []);
        setDrinks(draft.drinks || []);
        setDesserts(draft.desserts || []);
        setEquipment(draft.equipment || []);
        setAllowNewIngredients(draft.allowNewIngredients || false);
        setAllowNewEquipment(draft.allowNewEquipment || false);
      } catch (e) { console.error("Could not load draft", e); }
    }
  }, []);

  useEffect(() => {
    const draft = { brandName, concept, visualStyle, location, ingredients, drinks, desserts, equipment, allowNewIngredients, allowNewEquipment };
    localStorage.setItem("kitchenz_audit_draft", JSON.stringify(draft));
  }, [brandName, concept, visualStyle, location, ingredients, drinks, desserts, equipment, allowNewIngredients, allowNewEquipment]);

  const clearDraft = () => {
    localStorage.removeItem("kitchenz_audit_draft");
  };

  // Calculs dynamiques du simulateur
  const menuItems = fullMenu?.menu_items || [];
  const mainDishes = menuItems.filter((i: any) => i.category === "Plat Principal");
  const averageOrderValue = mainDishes.length > 0
    ? mainDishes.reduce((sum: number, i: any) => sum + (i.financials?.selling_price || 0), 0) / mainDishes.length + 5 // +5€ pour side/boisson
    : 15;
  const monthlyRevenue = Math.round(dailyOrders * averageOrderValue * 30);
  const avgMarginPerOrder = menuItems.length > 0
    ? menuItems.filter((i: any) => i.category === "Plat Principal" || i.category === "Menu Combo")
        .reduce((sum: number, i: any) => sum + (i.financials?.net_margin_target || 0), 0) 
        / Math.max(menuItems.filter((i: any) => i.category === "Plat Principal" || i.category === "Menu Combo").length, 1)
    : 4;
  const monthlyNetProfit = Math.round(dailyOrders * avgMarginPerOrder * 30);

  const addItem = (type: "ingredient" | "equipment" | "drink" | "dessert") => {
    if (type === "ingredient" && currentIngredient.trim()) {
      const newItems = currentIngredient.split(",").map(item => item.trim()).filter(item => item !== "");
      setIngredients([...ingredients, ...newItems]);
      setCurrentIngredient("");
    } else if (type === "equipment" && currentEquipment.trim()) {
      const newItems = currentEquipment.split(",").map(item => item.trim()).filter(item => item !== "");
      setEquipment([...equipment, ...newItems]);
      setCurrentEquipment("");
    } else if (type === "drink" && currentDrink.trim()) {
      const newItems = currentDrink.split(",").map(item => item.trim()).filter(item => item !== "");
      setDrinks([...drinks, ...newItems]);
      setCurrentDrink("");
    } else if (type === "dessert" && currentDessert.trim()) {
      const newItems = currentDessert.split(",").map(item => item.trim()).filter(item => item !== "");
      setDesserts([...desserts, ...newItems]);
      setCurrentDessert("");
    }
  };

  const removeItem = (index: number, type: "ingredient" | "equipment" | "drink" | "dessert") => {
    if (type === "ingredient") setIngredients(ingredients.filter((_, i) => i !== index));
    if (type === "equipment") setEquipment(equipment.filter((_, i) => i !== index));
    if (type === "drink") setDrinks(drinks.filter((_, i) => i !== index));
    if (type === "dessert") setDesserts(desserts.filter((_, i) => i !== index));
  };

  const handleInventoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAnalyzingInventory(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const items = await analyzeInventoryImageAction(base64);
        const newIngredients = items.map((i: any) => `${i.name} (${i.qty})`);
        setIngredients([...ingredients, ...newIngredients]);
        setAnalyzingInventory(false);
      };
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'analyse de l'image.");
      setAnalyzingInventory(false);
    }
  };

  const handleGenerate = async () => {
    setStep("generating");

    try {
      // Étape 0 : Sanitize inputs (just in case they come as single strings from dashboard)
      const sanitizedIngredients = ingredients.flatMap(i => typeof i === 'string' && i.includes(',') ? i.split(',').map(s => s.trim()) : i).filter(Boolean);
      const sanitizedEquipment = equipment.flatMap(e => typeof e === 'string' && e.includes(',') ? e.split(',').map(s => s.trim()) : e).filter(Boolean);

      // Étape 1 : Brand Core
      setLoadingStep("Génération de l'Identité de Marque (Brand Core)...");
      const flexibilityOptions = { allowNewIngredients, allowNewEquipment };
      const brandCore = await generateBrandCoreAction(sanitizedIngredients, sanitizedEquipment, brandName, concept, visualStyle, flexibilityOptions, location);

      // Étape 2 : Core Items
      setLoadingStep("Création du Menu & Recettes...");
      const coreItems = await generateCoreItemsAction(sanitizedIngredients, brandCore, flexibilityOptions);
      
      if (!coreItems || !coreItems.main_dishes) {
        throw new Error("L'IA n'a pas pu générer les plats de base. Veuillez réessayer.");
      }

      // Étape 3 : Logo & Background EN PREMIER → récupère le sceneSeed partagé
      setLoadingStep("Création du Logo & de la Bannière...");
      let brandImages: { logoUrl: string | null; backgroundUrl: string | null; sceneSeed: number } = {
        logoUrl: null,
        backgroundUrl: null,
        sceneSeed: Math.floor(Math.random() * 1000000),
      };
      try {
        const dishesContext = coreItems.main_dishes.slice(0, 3).map((d: any) => d.title).join(", ");
        brandImages = await generateBrandImagesAction(brandCore.name, brandCore.logo_prompt, brandCore.background_prompt, dishesContext);
      } catch (e) {
        console.error("Erreur images marque:", e);
      }

      // Étape 4 : Photos produits — même sceneSeed & backgroundPrompt pour cohérence visuelle
      // Étape 4 : Photos produits — Par lots de 5 pour éviter les timeouts serveur
      setLoadingStep("Génération des Photos de TOUS les produits...");
      const allItems = [...coreItems.main_dishes, ...coreItems.generated_sides];
      const allDishesWithPhotos = [];
      
      for (let i = 0; i < allItems.length; i += 5) {
        const batch = allItems.slice(i, i + 5);
        const batchWithPhotos = await Promise.all(
          batch.map(async (item: any) => {
            try {
              const imageUrl = await generateMenuItemImageAction(
                item.title,
                item.description_seo,
                brandCore.culinary_style,
                visualStyle,
                brandCore.background_prompt,
                brandImages.sceneSeed
              );
              return { ...item, imageUrl: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop" };
            } catch (e) {
              return { ...item, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop" };
            }
          })
        );
        allDishesWithPhotos.push(...batchWithPhotos);
      }

      const allMainDishes = allDishesWithPhotos.filter((i: any) => i.category === "Plat Principal" || i.category === "Plats");
      const allSides = allDishesWithPhotos.filter((i: any) => i.category === "Accompagnement" || i.category === "Sides");

      // Étape 5 : Menu Assembly
      setLoadingStep("Assemblage des Menus Combos...");
      const menuAssembly = await generateMenuAssemblyAction(coreItems, drinks, desserts, brandCore);

      // Génération automatique des items Boissons et Desserts à partir des listes fournies
      const ALCOHOL_KEYWORDS = ["vin", "bière", "cocktail", "champagne", "bordeaux", "chardonnay", "rosé", "whisky", "rhum", "mojito", "spritz", "sangria"];
      
      const drinkItems = drinks.map((drink: string) => {
        const isAlcohol = ALCOHOL_KEYWORDS.some(kw => drink.toLowerCase().includes(kw));
        const sellingPrice = isAlcohol ? 4.90 : 2.50; // Prix marché réaliste
        const materialCost = isAlcohol ? 1.50 : 0.50;
        const netMargin = sellingPrice - materialCost - PRICING.PACKAGING_COST;
        return {
          title: drink,
          description_seo: drink,
          ingredients: [drink],
          financials: { material_cost: materialCost, net_margin_target: parseFloat(netMargin.toFixed(2)), selling_price: sellingPrice },
          category: "Boisson",
          dietary_tags: [],
          allergens: isAlcohol ? ["Alcool"] : [],
          prep_instructions: "Servir frais."
        };
      });

      const PREMIUM_DESSERT_KEYWORDS = ["fondant", "crème brûlée", "tarte tatin", "profiteroles", "mousse", "tartelette", "tiramisu", "crème", "soufflé"];
      
      const dessertItems = desserts.map((dessert: string) => {
        const isPremium = PREMIUM_DESSERT_KEYWORDS.some(kw => dessert.toLowerCase().includes(kw));
        const sellingPrice = isPremium ? 6.90 : 4.50; // Prix marché réaliste
        const materialCost = isPremium ? 2.00 : 1.00;
        const netMargin = sellingPrice - materialCost - PRICING.PACKAGING_COST;
        return {
          title: dessert,
          description_seo: dessert,
          ingredients: [dessert],
          financials: { material_cost: materialCost, net_margin_target: parseFloat(netMargin.toFixed(2)), selling_price: sellingPrice },
          category: "Dessert",
          dietary_tags: [],
          allergens: [],
          prep_instructions: "Dresser et servir."
        };
      });

      const finalIngredients = [...ingredients];
      if (coreItems.suggested_new_ingredients?.length) {
        finalIngredients.push(...coreItems.suggested_new_ingredients.map((i: string) => `🔥 NOUVEAU: ${i}`));
      }
      
      const finalEquipment = [...equipment];
      if (brandCore.suggested_new_equipment?.length) {
        finalEquipment.push(...brandCore.suggested_new_equipment.map((e: string) => `🔥 NOUVEAU: ${e}`));
      }

      setFullMenu({
        brand_identity: {
          ...brandCore,
          logoUrl: brandImages.logoUrl,
          backgroundUrl: brandImages.backgroundUrl
        },
        inventory_analysis: { detected_ingredients: finalIngredients, required_equipment: finalEquipment, prep_time_avg: 15 },
        menu_items: [
          ...allDishesWithPhotos,
          ...menuAssembly.combos,
          ...drinkItems,
          ...dessertItems
        ]
      });

      clearDraft(); // On nettoie le brouillon une fois terminé
      setStep("result");
    } catch (error: any) {
      console.error("ERREUR CRITIQUE GENERATION:", error);
      alert(`Erreur de génération : ${error.message || "Problème de connexion avec l'IA"}. Veuillez réessayer dans quelques instants.`);
      setStep("flexibility");
    }
  };

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveToSupabase = async () => {
    if (!fullMenu) return;
    setSaving(true);
    try {
      // 1. Sauvegarde des images de manière permanente via notre API Backend
      const imageRes = await fetch("/api/save-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: fullMenu.brand_identity.logoUrl,
          backgroundUrl: fullMenu.brand_identity.backgroundUrl,
          brandName: fullMenu.brand_identity.name,
          menuItems: fullMenu.menu_items
        })
      });
      
      const imageData = await imageRes.json();
      if (!imageData.success) {
        console.warn("Échec de la sauvegarde des images.", imageData.error);
      }

      const finalLogoUrl = imageData.success ? imageData.logoUrl : fullMenu.brand_identity.logoUrl;
      const finalBgUrl = imageData.success ? imageData.backgroundUrl : fullMenu.brand_identity.backgroundUrl;
      const finalMenuItems = imageData.success ? imageData.menuItems : fullMenu.menu_items;

      // 2. Insertion dans la base de données Supabase
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .insert({
          name: fullMenu.brand_identity.name,
          tagline: fullMenu.brand_identity.tagline,
          culinary_style: fullMenu.brand_identity.culinary_style,
          storytelling: fullMenu.brand_identity.storytelling,
          ingredients: fullMenu.inventory_analysis.detected_ingredients,
          equipment: fullMenu.inventory_analysis.required_equipment,
          prep_time_avg: fullMenu.inventory_analysis.prep_time_avg,
          logo_url: finalLogoUrl,
          background_url: finalBgUrl,
        })
        .select()
        .single();

      if (brandError) throw brandError;

      const menuItemsToInsert = finalMenuItems.map((item: any) => ({
        brand_id: brandData.id,
        title: item.title,
        description_seo: item.description_seo,
        ingredients: item.ingredients,
        material_cost: item.financials.material_cost,
        net_margin_target: item.financials.net_margin_target,
        selling_price: item.financials.selling_price,
        category: item.category,
        image_url: item.imageUrl || null
      }));

      const { error: menuError } = await supabase
        .from("menu_items")
        .insert(menuItemsToInsert);

      if (menuError) throw menuError;

      setSaved(true);
      // Redirection automatique vers le Dashboard après un court délai
      setTimeout(() => {
        router.push("/dashboard?newBrand=" + brandData.id);
      }, 2000);
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      // Ici on pourrait utiliser un toast premium au lieu d'alert
    } finally {
      setSaving(false);
    }
  };

  const exportForUberEats = () => {
    if (!fullMenu) return;

    // Structure "Upsert" minimale pour Uber Eats
    const uberEatsPayload = {
      menus: [
        {
          id: "main_menu",
          title: { translations: { fr: "Menu Principal" } },
          category_ids: Array.from(new Set(fullMenu.menu_items.map((i: any) => i.category.toLowerCase().replace(/\s+/g, '_'))))
        }
      ],
      categories: Array.from(new Set(fullMenu.menu_items.map((i: any) => i.category))).map(cat => ({
        id: (cat as string).toLowerCase().replace(/\s+/g, '_'),
        title: { translations: { fr: cat } }
      })),
      items: fullMenu.menu_items.map((item: any, idx: number) => ({
        id: `item_${idx}`,
        title: { translations: { fr: item.title } },
        description: { translations: { fr: item.description_seo } },
        price_info: {
          price: Math.round(item.financials.selling_price * 100), // En centimes
          currency_code: "EUR"
        }
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(uberEatsPayload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${fullMenu.brand_identity.name.replace(/\s+/g, '_')}_ubereats.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen pt-40 pb-20 px-4 flex flex-col items-center bg-slate-50">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-white shadow-sm border border-gray-100"
          >
            <ChefHat className="w-8 h-8 text-[#06C167]" />
          </motion.div>
          <h1 className="text-5xl font-black mb-4 text-slate-900 tracking-tight">Générateur de Dark Kitchen</h1>
          <p className="text-slate-500 text-lg font-medium">Créez votre empire culinaire avec l'expertise Uber Eats.</p>
        </div>

        {/* Step Progress — 7 steps */}
        <div className="flex justify-between mb-12 px-4">
          {["Site", "Concept", "Ingr.", "Extras", "Mat.ériel", "Optim.", "Résultat"].map((label, i) => {
            const currentStepIndex = STEP_ORDER.indexOf(step === "generating" ? "result" : step);
            const isCompleted = i < currentStepIndex;
            const isActive = i === currentStepIndex || (STEP_ORDER[i] === "result" && step === "generating");
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 font-bold text-xs ${
                    isActive || isCompleted
                    ? "bg-[#06C167] border-[#06C167] text-white"
                    : "bg-white border-slate-200 text-slate-300"
                  }`}>
                    {isCompleted ? "✓" : i + 1}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider hidden md:block ${
                    isActive ? "text-[#06C167]" : isCompleted ? "text-slate-400" : "text-slate-300"
                  }`}>{label}</span>
                </div>
                {i < 6 && <div className={`w-4 md:w-8 h-[2px] mx-1 md:mx-2 mb-4 ${isCompleted ? "bg-[#06C167]" : "bg-slate-200"}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* FORM STEPS ON SINGLE PAGE */}
          {step !== "generating" && step !== "result" && (
            <div className="space-y-12">
            <motion.div key="establishment" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card p-10 bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-3">
                <Store className="text-[#06C167] w-8 h-8" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Votre site de production</h2>
              </div>
              <p className="text-slate-500 font-medium mb-10 text-base">Sélectionnez votre établissement pour pré-remplir automatiquement vos stocks et matériel. Vous pouvez aussi continuer sans.</p>

              {establishments.length > 0 ? (
                <div className="space-y-4 mb-10">
                  {establishments.map((est) => (
                    <div
                      key={est.id}
                      onClick={() => handleEstablishmentSelect(est.id)}
                      className={`p-6 border-2 rounded-3xl cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 ${
                        selectedEstablishmentId === est.id
                          ? 'bg-[#06C167]/5 border-[#06C167] shadow-lg shadow-[#06C167]/10'
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          selectedEstablishmentId === est.id ? 'bg-[#06C167]' : 'bg-indigo-50'
                        }`}>
                          <Store className={`w-6 h-6 ${selectedEstablishmentId === est.id ? 'text-white' : 'text-indigo-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-lg">{est.name}</h3>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {est.address}, {est.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(est.default_ingredients?.length || 0)} ingr. • {(est.default_equipment?.length || 0)} mat.</p>
                        {selectedEstablishmentId === est.id && (
                          <span className="text-[10px] font-black text-[#06C167] uppercase tracking-widest">Sélectionné ✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-10 p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 bg-indigo-100 rounded-2xl">
                    <Store className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-indigo-900 text-lg mb-1">Aucun site enregistré</h4>
                    <p className="text-sm text-indigo-600 font-medium">Créez un site pour sauvegarder vos stocks et les réutiliser à chaque audit. Vous pouvez aussi continuer manuellement.</p>
                  </div>
                  <Link href="/onboarding" className="shrink-0 px-5 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Créer un site
                  </Link>
                </div>
              )}

              
            </motion.div>

          {/* STEP 1: CONCEPT & BRANDING */}
            <motion.div key="concept" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card p-10 bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-8">
                <ChefHat className="text-[#06C167] w-8 h-8" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Concept & Vision</h2>
              </div>
              

              <div className="space-y-8 mb-10">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Nom de la Marque (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: El Fuego, Green Kitchen..."
                    className="input-premium w-full"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles className="w-4 h-4"/> Concept Culinaire (Laissez vide pour l'IA)</label>
                  <input
                    type="text"
                    placeholder="Ex: Des smash burgers avec une touche française..."
                    className="input-premium w-full"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Style Visuel (Logo & Background)</label>
                  <input
                    type="text"
                    placeholder="Ex: Néons roses, cyberpunk, très coloré..."
                    className="input-premium w-full"
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Ville / Quartier (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Paris 11ème, Lyon Part-Dieu..."
                    className="input-premium w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              
            </motion.div>

          {/* STEP 2: INGREDIENTS */}
            <motion.div key="ingredients" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card p-10 bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-8">
                <Utensils className="text-[#06C167] w-8 h-8" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vos ingrédients</h2>
              </div>
              <p className="text-slate-500 font-medium mb-10 text-lg">
                Collez votre liste d'ingrédients ici ou ajoutez-les un par un. L'IA s'adaptera à vos stocks.
              </p>
                <div className="flex gap-2 mb-8">
                  <input 
                    type="text" 
                    placeholder="Ex: Poulet, Avocat, Pain brioché, Cheddar..." 
                    className="input-premium flex-1" 
                    value={currentIngredient} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(',')) {
                        const newIngredients = val.split(',').map(i => i.trim()).filter(i => i !== "");
                        setIngredients([...ingredients, ...newIngredients]);
                        setCurrentIngredient("");
                      } else {
                        setCurrentIngredient(val);
                      }
                    }}
                    onKeyPress={(e) => e.key === "Enter" && addItem("ingredient")}
                  />
                  <button onClick={() => addItem("ingredient")} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Ajouter</button>
                  <input type="file" ref={inventoryInputRef} className="hidden" accept="image/*" onChange={handleInventoryUpload} />
                  <button 
                    onClick={() => inventoryInputRef.current?.click()} 
                    disabled={analyzingInventory}
                    className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {analyzingInventory ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {analyzingInventory ? "Analyse..." : "Scanner Stock"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-10 min-h-[180px] p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                  {ingredients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full text-slate-300 py-10">
                      <Utensils className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-[10px]">Aucun ingrédient renseigné</p>
                    </div>
                  ) : (
                    ingredients.map((ing, i) => (
                      <motion.span 
                        key={i} 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 border border-slate-200 shadow-sm group hover:border-[#06C167] transition-all"
                      >
                        {ing} 
                        <button onClick={() => removeItem(i, "ingredient")} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.span>
                    ))
                  )}
                </div>

                
            </motion.div>

          {/* STEP 3: EXTRAS (Drinks & Desserts) */}
            <motion.div key="extras" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card p-10 bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-8">
                <Coffee className="text-[#06C167] w-8 h-8" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Extras & Compléments</h2>
              </div>
              <div className="space-y-10 mb-10">
                {/* Drinks */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Boissons (Séparez par des virgules)</label>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Ex: Coca-Cola, Sprite, Eau minérale..." 
                      className="input-premium flex-1" 
                      value={currentDrink} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(',')) {
                          const newItems = val.split(',').map(i => i.trim()).filter(i => i !== "");
                          setDrinks([...drinks, ...newItems]);
                          setCurrentDrink("");
                        } else {
                          setCurrentDrink(val);
                        }
                      }} 
                      onKeyPress={(e) => e.key === "Enter" && addItem("drink")} 
                    />
                    <button onClick={() => addItem("drink")} className="btn-primary flex items-center gap-2 px-8 font-black uppercase text-xs tracking-widest"><Plus className="w-4 h-4" /> Ajouter</button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-6 bg-slate-50 rounded-2xl min-h-[80px] border border-slate-100">
                    {drinks.length === 0 ? <p className="text-slate-300 text-xs font-black uppercase tracking-widest p-2">Aucune boisson</p> : drinks.map((item, i) => (
                      <span key={i} className="bg-white text-slate-900 px-5 py-2 rounded-xl flex items-center gap-3 border border-slate-200 text-sm font-bold shadow-sm">
                        {item} <Trash2 className="w-4 h-4 text-slate-300 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeItem(i, "drink")} />
                      </span>
                    ))}
                  </div>
                </div>
                {/* Desserts */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Desserts (Séparez par des virgules)</label>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Ex: Tiramisu, Cookie, Mousse au chocolat..." 
                      className="input-premium flex-1" 
                      value={currentDessert} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(',')) {
                          const newItems = val.split(',').map(i => i.trim()).filter(i => i !== "");
                          setDesserts([...desserts, ...newItems]);
                          setCurrentDessert("");
                        } else {
                          setCurrentDessert(val);
                        }
                      }} 
                      onKeyPress={(e) => e.key === "Enter" && addItem("dessert")} 
                    />
                    <button onClick={() => addItem("dessert")} className="btn-primary flex items-center gap-2 px-8 font-black uppercase text-xs tracking-widest"><Plus className="w-4 h-4" /> Ajouter</button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-6 bg-slate-50 rounded-2xl min-h-[80px] border border-slate-100">
                    {desserts.length === 0 ? <p className="text-slate-300 text-xs font-black uppercase tracking-widest p-2">Aucun dessert</p> : desserts.map((item, i) => (
                      <span key={i} className="bg-white text-slate-900 px-5 py-2 rounded-xl flex items-center gap-3 border border-slate-200 text-sm font-bold shadow-sm">
                        {item} <Trash2 className="w-4 h-4 text-slate-300 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeItem(i, "dessert")} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
            </motion.div>

          {/* STEP 4: EQUIPMENT */}
            <motion.div key="equipment" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card p-10 bg-white shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-8">
                <Zap className="text-[#06C167] w-8 h-8" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Matériel en cuisine</h2>
              </div>
              <p className="text-slate-500 font-medium mb-10 text-lg">
                Listez votre équipement. L'IA s'assurera que les recettes sont réalisables avec vos outils actuels.
              </p>
              <div className="flex gap-2 mb-8">
                <input
                  type="text"
                  placeholder="Ex: Plancha, Friteuse, Four à pizza, Grill..."
                  className="input-premium flex-1"
                  value={currentEquipment}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes(',')) {
                      const newItems = val.split(',').map(i => i.trim()).filter(i => i !== "");
                      setEquipment([...equipment, ...newItems]);
                      setCurrentEquipment("");
                    } else {
                      setCurrentEquipment(val);
                    }
                  }}
                  onKeyPress={(e) => e.key === "Enter" && addItem("equipment")}
                />
                <button onClick={() => addItem("equipment")} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Ajouter</button>
              </div>
              <div className="flex flex-wrap gap-2 mb-10 min-h-[120px] p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                {equipment.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full text-slate-300 py-6">
                    <Zap className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-[10px]">Aucun matériel renseigné</p>
                  </div>
                ) : equipment.map((item, i) => (
                  <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={i} className="bg-white text-slate-900 px-6 py-3 rounded-2xl flex items-center gap-3 border border-slate-200 text-sm font-bold shadow-sm">
                    {item} <Trash2 className="w-4 h-4 text-slate-300 cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeItem(i, "equipment")} />
                  </motion.span>
                ))}
              </div>
              
            </motion.div>

          {/* STEP 5: FLEXIBILITY */}
            <motion.div key="flexibility" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card p-10 bg-white">
              <div className="flex items-center gap-3 mb-8">
                <Zap className="text-[#06C167]" />
                <h2 className="text-3xl font-black text-black">Optimisation & IA</h2>
              </div>
              <p className="text-gray-500 font-medium mb-8">
                L'IA doit-elle se limiter strictement à votre inventaire, ou l'autorisez-vous à vous suggérer d'acheter quelques nouveautés très rentables ?
              </p>
              
                <div 
                  className={`p-8 border-2 rounded-[32px] cursor-pointer transition-all duration-300 flex items-start gap-6 ${allowNewIngredients ? 'bg-[#06C167]/5 border-[#06C167]' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                  onClick={() => setAllowNewIngredients(!allowNewIngredients)}
                >
                  <div className={`w-8 h-8 mt-1 rounded-xl border-2 flex items-center justify-center transition-colors ${allowNewIngredients ? 'bg-[#06C167] border-[#06C167]' : 'border-slate-200 bg-white'}`}>
                    {allowNewIngredients && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 mb-1">Autoriser de nouveaux ingrédients</h3>
                    <p className="text-sm text-slate-500 font-medium">L'IA pourra suggérer l'achat de 2 à 3 nouveaux produits pour maximiser vos marges.</p>
                  </div>
                </div>

                <div 
                  className={`p-8 border-2 rounded-[32px] cursor-pointer transition-all duration-300 flex items-start gap-6 ${allowNewEquipment ? 'bg-[#06C167]/5 border-[#06C167]' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                  onClick={() => setAllowNewEquipment(!allowNewEquipment)}
                >
                  <div className={`w-8 h-8 mt-1 rounded-xl border-2 flex items-center justify-center transition-colors ${allowNewEquipment ? 'bg-[#06C167] border-[#06C167]' : 'border-slate-200 bg-white'}`}>
                    {allowNewEquipment && <Check className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 mb-1">Autoriser un nouvel équipement</h3>
                    <p className="text-sm text-slate-500 font-medium">L'IA pourra recommander un petit matériel spécifique pour ouvrir de nouvelles gammes.</p>
                  </div>
                </div>

              <div className="flex justify-center mt-12">
                <button 
                  className="btn-primary text-xl px-12 py-6 shadow-2xl shadow-[#06C167]/30 hover:scale-105 transition-transform" 
                  onClick={handleGenerate}
                >
                  Lancer l'Audit Global IA <Sparkles className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
            </div>
          )}

          {/* STEP: GENERATING */}
          {step === "generating" && (
            <motion.div key="generating" variants={containerVariants} initial="hidden" animate="visible" className="glass-card p-12 bg-white border border-slate-200 shadow-2xl shadow-slate-200/50">
              <div className="text-center mb-12">
                <div className="relative w-32 h-32 mx-auto mb-10">
                  <div className="absolute inset-0 border-4 border-slate-50 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#06C167] rounded-full border-t-transparent animate-spin"></div>
                  <ChefHat className="absolute inset-0 m-auto w-12 h-12 text-[#06C167] animate-pulse" />
                </div>
                <h2 className="text-5xl font-black mb-4 tracking-tight text-slate-900 leading-none">Analyse IA en cours...</h2>
                
                {/* Real Progress Bar */}
                <div className="max-w-md mx-auto mt-8 mb-4">
                   <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#06C167]">Progression</span>
                      <span className="text-[10px] font-black text-slate-400">
                        {Math.round(((["Génération de l'Identité de Marque (Brand Core)...", "Création du Menu & Recettes...", "Génération des Photos de TOUS les produits...", "Création du Logo & de la Bannière Contextuelle...", "Assemblage des Menus Combos..."].indexOf(loadingStep) + 1) / 5) * 100)}%
                      </span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((["Génération de l'Identité de Marque (Brand Core)...", "Création du Menu & Recettes...", "Génération des Photos de TOUS les produits...", "Création du Logo & de la Bannière Contextuelle...", "Assemblage des Menus Combos..."].indexOf(loadingStep) + 1) / 5) * 100}%` }}
                        className="h-full bg-[#06C167]"
                      />
                   </div>
                   <p className="mt-4 text-slate-400 text-sm font-medium italic animate-pulse">
                      {loadingStep.includes("Photos") ? "Cuisson des visuels HD en cours (cela peut prendre 30s)..." : 
                       loadingStep.includes("Identité") ? "Définition de l'ADN de votre marque..." :
                       loadingStep.includes("Menu") ? "Création des fiches techniques et prix de vente..." :
                       "Finalisation du dossier d'audit..."}
                   </p>
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {[
                  { text: "Génération de l'Identité de Marque (Brand Core)...", key: 1 },
                  { text: "Création du Menu & Recettes...", key: 2 },
                  { text: "Génération des Photos de TOUS les produits...", key: 3 },
                  { text: "Création du Logo & de la Bannière Contextuelle...", key: 4 },
                  { text: "Assemblage des Menus Combos...", key: 5 }
                ].map((s, i) => {
                  const LOADING_STEPS = [
                    "Génération de l'Identité de Marque (Brand Core)...",
                    "Création du Menu & Recettes...",
                    "Génération des Photos de TOUS les produits...",
                    "Création du Logo & de la Bannière Contextuelle...",
                    "Assemblage des Menus Combos..."
                  ];
                  const currentIdx = LOADING_STEPS.indexOf(loadingStep);
                  const isActive = loadingStep === s.text;
                  const isPast = i < currentIdx;
                  
                  return (
                    <div key={s.key} className={`flex items-center gap-6 p-6 rounded-[24px] transition-all duration-500 border-2 ${isActive ? 'bg-slate-50 border-[#06C167] scale-105 shadow-lg' : 'bg-white border-slate-50'} ${isPast ? 'opacity-50' : ''}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${isPast ? 'bg-[#06C167]' : isActive ? 'bg-slate-900 animate-pulse shadow-lg' : 'bg-slate-100'}`}>
                        {isPast ? <Check className="w-6 h-6 text-white" /> : isActive ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <div className="w-3 h-3 rounded-full bg-slate-300" />}
                      </div>
                      <span className={`font-black text-xs tracking-[0.2em] uppercase ${isActive ? 'text-slate-900' : isPast ? 'text-[#06C167]' : 'text-slate-300'}`}>{s.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* RESULT VIEW */}
          {step === "result" && fullMenu && (() => {
            const averageOrderValue = (fullMenu?.menu_items || []).length 
              ? (fullMenu.menu_items || []).reduce((acc: number, item: any) => acc + (item?.financials?.selling_price || 0), 0) / (fullMenu.menu_items || []).length 
              : 15;
            const averageMargin = (fullMenu?.menu_items || []).length
              ? (fullMenu.menu_items || []).reduce((acc: number, item: any) => acc + (item?.financials?.net_margin_target || 0), 0) / (fullMenu.menu_items || []).length
              : 5;
            
            const monthlyRevenue = (dailyOrders || 0) * 30 * (averageOrderValue || 0);
            const monthlyGrossMargin = (dailyOrders || 0) * 30 * (averageMargin || 0);
            const monthlyNetProfit = monthlyGrossMargin - (rent || 0) - (staff || 0);

            return (
              <motion.div key="result" variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Audit de Marque</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`btn-secondary flex items-center gap-2 ${isEditing ? 'bg-[#06C167] text-white border-none' : 'bg-white text-slate-900 border-slate-200'}`}
                >
                  {isEditing ? <Check className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  {isEditing ? "Enregistrer" : "Modifier Manuellement"}
                </button>
              </div>

              <div 
                className="glass-card overflow-hidden relative rounded-[40px] shadow-2xl border-none"
                style={{
                  backgroundImage: fullMenu.brand_identity.backgroundUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(15,23,42,1)), url('${fullMenu.brand_identity.backgroundUrl}')` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '400px'
                }}
              >
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                   <button onClick={() => setSelectedFullImage(fullMenu.brand_identity.backgroundUrl)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/40 transition-all">
                     <Plus className="w-5 h-5 text-white" />
                   </button>
                </div>
                <div className="relative z-10 p-12 flex flex-col justify-end min-h-[400px]">
                  <div className="flex items-center gap-6 mb-6">
                    {fullMenu.brand_identity.logoUrl && (
                      <div className="relative group">
                        <img 
                          src={fullMenu.brand_identity.logoUrl} 
                          alt="Logo" 
                          className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl cursor-pointer" 
                          onClick={() => setSelectedFullImage(fullMenu.brand_identity.logoUrl)}
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <input 
                              type="text" 
                              placeholder="URL Logo" 
                              className="text-[8px] w-full p-1 bg-white text-black"
                              value={fullMenu.brand_identity.logoUrl}
                              onChange={(e) => {
                                const newData = {...fullMenu};
                                newData.brand_identity.logoUrl = e.target.value;
                                setFullMenu(newData);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      {isEditing ? (
                        <input 
                          type="text"
                          className="text-6xl font-black text-white tracking-tighter mb-2 bg-white/10 border-none outline-none w-full rounded-xl px-2"
                          value={fullMenu.brand_identity.name}
                          onChange={(e) => {
                            const newData = {...fullMenu};
                            newData.brand_identity.name = e.target.value;
                            setFullMenu(newData);
                          }}
                        />
                      ) : (
                        <h2 className="text-6xl font-black text-white tracking-tighter mb-2">{fullMenu.brand_identity.name}</h2>
                      )}
                      {isEditing ? (
                        <input 
                          type="text"
                          className="text-2xl text-white/90 font-medium italic opacity-80 bg-white/10 border-none outline-none w-full rounded-xl px-2"
                          value={fullMenu.brand_identity.tagline}
                          onChange={(e) => {
                            const newData = {...fullMenu};
                            newData.brand_identity.tagline = e.target.value;
                            setFullMenu(newData);
                          }}
                        />
                      ) : (
                        <p className="text-2xl text-white/90 font-medium italic opacity-80">{fullMenu.brand_identity.tagline}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="glass-card p-8 bg-white border border-gray-100 rounded-[30px]">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Sparkles className="text-[#06C167] w-5 h-5" /> ADN de la Marque</h3>
                  {isEditing ? (
                    <textarea 
                      className="text-gray-600 leading-relaxed text-lg italic mb-6 w-full h-32 bg-gray-50 p-4 rounded-2xl border-none outline-none"
                      value={fullMenu.brand_identity.storytelling}
                      onChange={(e) => {
                        const newData = {...fullMenu};
                        newData.brand_identity.storytelling = e.target.value;
                        setFullMenu(newData);
                      }}
                    />
                  ) : (
                    <p className="text-gray-600 leading-relaxed text-lg italic mb-6">"{fullMenu.brand_identity.storytelling}"</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <input 
                        type="text"
                        className="bg-[#06C167]/10 text-[#06C167] px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest border-none outline-none"
                        value={fullMenu.brand_identity.culinary_style}
                        onChange={(e) => {
                          const newData = {...fullMenu};
                          newData.brand_identity.culinary_style = e.target.value;
                          setFullMenu(newData);
                        }}
                      />
                    ) : (
                      <span className="bg-[#06C167]/10 text-[#06C167] px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest">
                        Style : {fullMenu.brand_identity.culinary_style}
                      </span>
                    )}
                  </div>
                </div>

                <div className="glass-card p-8 bg-white border border-gray-100">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Utensils className="text-[#06C167] w-5 h-5" /> Analyse Opérationnelle</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Temps de prép moyen</span>
                      {isEditing ? (
                        <input 
                          type="number"
                          className="text-black font-black text-lg bg-white rounded-lg px-2 w-16 text-right"
                          value={fullMenu.inventory_analysis.prep_time_avg}
                          onChange={(e) => {
                            const newData = {...fullMenu};
                            newData.inventory_analysis.prep_time_avg = parseInt(e.target.value);
                            setFullMenu(newData);
                          }}
                        />
                      ) : (
                        <span className="text-black font-black text-lg">{fullMenu.inventory_analysis.prep_time_avg} min</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Ingrédients exploités</span>
                      <div className="flex flex-wrap gap-1">
                        {isEditing ? (
                          <input 
                            type="text"
                            className="bg-gray-100 text-black px-2 py-1 rounded-md text-[10px] font-bold border border-gray-200 w-full"
                            value={(fullMenu?.inventory_analysis?.detected_ingredients || []).join(", ")}
                            onChange={(e) => {
                              const newData = {...fullMenu};
                              newData.inventory_analysis.detected_ingredients = e.target.value.split(",").map(s => s.trim());
                              setFullMenu(newData);
                            }}
                          />
                        ) : (
                          (fullMenu?.inventory_analysis?.detected_ingredients || []).map((ing: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-black px-2 py-1 rounded-md text-[10px] font-bold border border-gray-200">{ing}</span>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Matériel requis</span>
                      <div className="flex flex-wrap gap-1">
                        {isEditing ? (
                          <input 
                            type="text"
                            className="bg-gray-100 text-black px-2 py-1 rounded-md text-[10px] font-bold border border-gray-200 w-full"
                            value={(fullMenu?.inventory_analysis?.required_equipment || []).join(", ")}
                            onChange={(e) => {
                              const newData = {...fullMenu};
                              newData.inventory_analysis.required_equipment = e.target.value.split(",").map(s => s.trim());
                              setFullMenu(newData);
                            }}
                          />
                        ) : (
                          (fullMenu?.inventory_analysis?.required_equipment || []).map((eq: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-black px-2 py-1 rounded-md text-[10px] font-bold border border-gray-200">{eq}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-3xl font-black mt-12 mb-4 text-black tracking-tight">Menu Stratégique</h3>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
                {["Tous", "Plat Principal", "Accompagnement", "Menu Combo", "Boisson", "Dessert"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all ${
                      selectedCategory === cat 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-[#06C167] hover:text-[#06C167]'
                    }`}
                  >
                    {cat === "Tous" ? "Tout voir" : cat}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(fullMenu?.menu_items || [])
                  .filter((item: any) => selectedCategory === "Tous" || item?.category === selectedCategory)
                  .map((item: any, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    className={`glass-card p-6 bg-white border-2 border-gray-50 hover:border-[#06C167] transition-all group ${isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                    onClick={() => !isEditing && setSelectedItemForRecipe(item)}
                  >
                    {item.imageUrl && (
                      <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" 
                          onClick={(e) => { e.stopPropagation(); setSelectedFullImage(item.imageUrl); }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4">
                            <input 
                              type="text" 
                              placeholder="URL Image" 
                              className="text-[10px] w-full p-2 bg-white text-black rounded-lg"
                              value={item.imageUrl}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const newData = {...fullMenu};
                                newData.menu_items[i].imageUrl = e.target.value;
                                setFullMenu(newData);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-[#06C167] bg-[#06C167]/10 px-2 py-1 rounded-md uppercase tracking-widest">{item.category}</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            className="text-right w-16 bg-gray-50 border-none outline-none font-black"
                            value={item?.financials?.selling_price || 0}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const newData = {...fullMenu};
                              if (newData.menu_items[i].financials) {
                                newData.menu_items[i].financials.selling_price = parseFloat(e.target.value);
                                setFullMenu(newData);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-lg font-black">{(item?.financials?.selling_price || 0).toFixed(2)}€</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="text-xl font-black text-black mb-2 w-full bg-gray-50 border-none outline-none px-1 rounded"
                        value={item.title}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newData = {...fullMenu};
                          newData.menu_items[i].title = e.target.value;
                          setFullMenu(newData);
                        }}
                      />
                    ) : (
                      <h4 className="text-xl font-black text-black mb-2 group-hover:text-[#06C167] transition-colors">{item.title}</h4>
                    )}
                    {isEditing ? (
                      <textarea 
                        className="text-gray-500 text-sm mb-4 w-full bg-gray-50 border-none outline-none p-1 rounded h-20"
                        value={item.description_seo}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const newData = {...fullMenu};
                          newData.menu_items[i].description_seo = e.target.value;
                          setFullMenu(newData);
                        }}
                      />
                    ) : (
                      <p className="text-gray-500 text-sm mb-4">{item.description_seo}</p>
                    )}
                    
                    {item.modifier_groups && item.modifier_groups.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {item.modifier_groups.map((mg: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                              {isEditing ? (
                                <input 
                                  type="text"
                                  className="bg-transparent border-none outline-none text-gray-400 w-full"
                                  value={mg.name}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const newData = {...fullMenu};
                                    newData.menu_items[i].modifier_groups[idx].name = e.target.value;
                                    setFullMenu(newData);
                                  }}
                                />
                              ) : (
                                <span className="text-gray-400 block">{mg.name} <span className="text-gray-300 font-normal">({mg.min_selection} max)</span></span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {isEditing ? (
                                <input 
                                  type="text"
                                  className="bg-white px-2 py-1 rounded-md text-gray-700 shadow-sm w-full"
                                  value={mg.options?.join(", ")}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const newData = {...fullMenu};
                                    newData.menu_items[i].modifier_groups[idx].options = e.target.value.split(",").map(s => s.trim());
                                    setFullMenu(newData);
                                  }}
                                />
                              ) : (
                                mg.options?.map((opt: string, optIdx: number) => (
                                  <span key={optIdx} className="bg-white px-2 py-1 rounded-md text-gray-700 shadow-sm">{opt}</span>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-50 space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>Coût Matière</span>
                        <span className="text-black">{(item?.financials?.material_cost || 0).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>Commission Uber ({(PRICING.UBER_COMMISSION * 100).toFixed(0)}%)</span>
                        <span className="text-red-500">-{( (item?.financials?.selling_price || 0) * PRICING.UBER_COMMISSION).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>TVA (10%)</span>
                        <span className="text-red-500">{( (item?.financials?.selling_price || 0) * 0.1).toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span>Packaging</span>
                        <span className="text-orange-500">-{PRICING.PACKAGING_COST.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-[#06C167] bg-[#06C167]/5 p-2 rounded-xl mt-2">
                        <span>Marge Nette</span>
                        <span>+{(item?.financials?.net_margin_target || 0).toFixed(2)}€</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Monthly Profit Simulator */}
              <div className="mt-16 bg-white p-12 rounded-[50px] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Zap className="w-60 h-60 text-[#06C167]" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="p-4 bg-[#06C167] rounded-3xl shadow-lg shadow-[#06C167]/20">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-slate-900">Simulateur de Rentabilité</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Ajustez vos volumes pour voir votre profit net</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commandes / Jour</label>
                      <div className="text-5xl font-black text-slate-900 tracking-tighter">{dailyOrders}</div>
                      <input type="range" min="5" max="80" value={dailyOrders} onChange={(e) => setDailyOrders(parseInt(e.target.value))} className="w-full accent-[#06C167]" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Panier Moyen</label>
                      <div className="text-5xl font-black text-slate-900 tracking-tighter">{averageOrderValue.toFixed(0)}€</div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Calculé depuis le menu</p>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CA Mensuel (HT)</label>
                      <div className="text-5xl font-black text-[#06C167] tracking-tighter">{monthlyRevenue.toLocaleString('fr-FR')}€</div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dailyOrders} cmd × {averageOrderValue.toFixed(0)}€ × 30j</p>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marge Nette Estimée</label>
                      <div className={`text-5xl font-black tracking-tighter ${monthlyNetProfit > 0 ? 'text-[#06C167]' : 'text-red-500'}`}>{ monthlyNetProfit > 0 ? '+' : ''}{monthlyNetProfit.toLocaleString('fr-FR')}€</div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Après commissions & TVA</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-slate-100">
                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Loyer mensuel</label>
                      <div className="relative">
                        <input type="number" value={rent} onChange={(e) => setRent(parseInt(e.target.value) || 0)} className="w-full bg-white rounded-2xl p-4 text-slate-900 font-black text-2xl border border-slate-200 outline-none focus:border-[#06C167] transition-all" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">€</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Masse salariale</label>
                      <div className="relative">
                        <input type="number" value={staff} onChange={(e) => setStaff(parseInt(e.target.value) || 0)} className="w-full bg-white rounded-2xl p-4 text-slate-900 font-black text-2xl border border-slate-200 outline-none focus:border-[#06C167] transition-all" />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">€</span>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl shadow-slate-200">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Bénéfice Net Réel</label>
                      <div className={`text-4xl font-black tracking-tighter ${(monthlyNetProfit - rent - staff) > 0 ? 'text-[#06C167]' : 'text-red-500'}`}>
                        {(monthlyNetProfit - rent - staff) > 0 ? '+' : ''}{(monthlyNetProfit - rent - staff).toLocaleString('fr-FR')}€
                      </div>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-2">Marge - Loyer - Salaires</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODALS */}
              <AnimatePresence>
                {selectedFullImage && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedFullImage(null)}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out"
                  >
                    <motion.img 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={selectedFullImage} 
                      className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
                    />
                    <button className="absolute top-8 right-8 p-4 bg-white/10 rounded-full text-white hover:bg-white/20">
                      <Plus className="w-8 h-8 rotate-45" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col md:flex-row justify-center gap-6 pt-20 pb-32">
                <button onClick={() => setStep("concept")} className="btn-secondary text-lg px-10 py-5 bg-white border-slate-200">Nouvel Audit</button>
                <button onClick={exportForUberEats} className="btn-secondary text-lg px-10 py-5 bg-white border-slate-200 group">
                  <Download className="w-6 h-6 text-[#06C167] group-hover:scale-110 transition-transform" /> Export JSON
                </button>
                {uberConnected && saved && (
                   <button 
                    onClick={async () => {
                      // Fetch brand ID from supabase search by name or pass it from saveToSupabase
                      const { data } = await supabase.from("brands").select("id").eq("name", fullMenu.brand_identity.name).single();
                      if (!data) return alert("Sauvegardez d'abord le concept !");
                      
                      const res = await fetch("/api/uber/sync", {
                        method: "POST",
                        body: JSON.stringify({ brandId: data.id })
                      });
                      const syncData = await res.json();
                      if (syncData.success) alert("🚀 Menu synchronisé sur Uber Eats !");
                      else alert("Erreur : " + syncData.error);
                    }}
                    className="btn-primary text-lg px-10 py-5 bg-[#06C167] shadow-[#06C167]/20"
                   >
                     🚀 Publier sur Uber Eats
                   </button>
                )}
                <button onClick={saveToSupabase} disabled={saving || saved} className={`btn-primary text-lg px-12 py-5 shadow-2xl ${saved ? 'bg-[#06C167] shadow-[#06C167]/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : saved ? <Check className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  {saved ? "Concept Sauvegardé" : "Enregistrer dans mon Dashboard"}
                </button>
              </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Modal Fiche Technique */}
        <AnimatePresence>
          {selectedItemForRecipe && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedItemForRecipe(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="bg-white max-w-2xl w-full rounded-[50px] p-12 relative overflow-hidden shadow-2xl border border-slate-100"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setSelectedItemForRecipe(null)} className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all">✕</button>
                
                <div className="flex items-center gap-6 mb-10">
                  <div className="p-4 bg-indigo-50 rounded-3xl border border-indigo-100">
                    <ChefHat className="text-indigo-500 w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedItemForRecipe.title}</h2>
                </div>

                <div className="space-y-10">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ingrédients requis</h3>
                    <div className="flex flex-wrap gap-3">
                      {isEditing ? (
                        <input 
                          type="text"
                          className="bg-slate-50 px-5 py-3 rounded-xl text-sm font-bold text-slate-900 border border-slate-100 w-full outline-none focus:border-[#06C167]"
                          value={selectedItemForRecipe.ingredients?.join(", ")}
                          onChange={(e) => {
                             const updatedItem = {...selectedItemForRecipe, ingredients: e.target.value.split(",").map(s => s.trim())};
                             setSelectedItemForRecipe(updatedItem);
                             // Update in main menu too
                             const newData = {...fullMenu};
                             const idx = newData.menu_items.findIndex((m: any) => m.title === selectedItemForRecipe.title);
                             if (idx !== -1) newData.menu_items[idx].ingredients = updatedItem.ingredients;
                             setFullMenu(newData);
                          }}
                        />
                      ) : (
                        selectedItemForRecipe.ingredients?.map((ing: string, i: number) => (
                          <span key={i} className="bg-slate-50 px-5 py-2 rounded-xl text-sm font-bold text-slate-600 border border-slate-100">{ing}</span>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Instructions de préparation</h3>
                    {isEditing ? (
                      <textarea 
                        className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 italic text-slate-900 font-medium leading-relaxed w-full h-48 outline-none focus:border-[#06C167] text-lg shadow-inner"
                        value={selectedItemForRecipe.prep_instructions}
                        onChange={(e) => {
                           const updatedItem = {...selectedItemForRecipe, prep_instructions: e.target.value};
                           setSelectedItemForRecipe(updatedItem);
                           // Update in main menu too
                           const newData = {...fullMenu};
                           const idx = newData.menu_items.findIndex((m: any) => m.title === selectedItemForRecipe.title);
                           if (idx !== -1) newData.menu_items[idx].prep_instructions = updatedItem.prep_instructions;
                           setFullMenu(newData);
                        }}
                      />
                    ) : (
                      <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 italic text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg shadow-inner">
                        {selectedItemForRecipe.prep_instructions}
                      </div>
                    )}
                  </div>

                  <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Kitchenz.ai — Fiche Technique Certifiée</span>
                    <button className="text-[#06C167] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                      <Download className="w-4 h-4" /> PDF (Bientôt)
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
