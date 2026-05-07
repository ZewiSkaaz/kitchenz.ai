"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChefHat, Menu, X, ArrowRight, User, LogOut, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Auth check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 md:px-8 ${scrolled ? "py-4" : "py-6"}`}>
      <div className={`max-w-7xl mx-auto px-5 py-2.5 rounded-xl flex items-center justify-between transition-all duration-300 ${scrolled ? "bg-white shadow-sm border border-slate-100" : "bg-transparent"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-[#06C167] rounded-lg group-hover:rotate-12 transition-transform">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? "text-slate-900" : "text-slate-900"}`}>
            kitchenz<span className="text-[#06C167]">.ai</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/audit" label="Audit IA" scrolled={scrolled} />
          <NavLink href="/dashboard" label="Dashboard" scrolled={scrolled} />
          <NavLink href="/guide" label="Guide" scrolled={scrolled} />
          <NavLink href="/examples" label="Exemples" scrolled={scrolled} />
          
          {/* Language Selector (Master Audit #8) */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-md border border-gray-100">
            {['FR', 'EN', 'ES'].map((lang) => (
              <button 
                key={lang}
                className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors"
                onClick={() => alert(`Changement vers ${lang} (Configuration en cours...)`)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
               <Link href="/dashboard" className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-all">
                  <div className="w-8 h-8 rounded-full bg-[#06C167]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#06C167]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">Mon Espace</span>
               </Link>
               <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-500 transition-all" title="Déconnexion">
                  <LogOut className="w-5 h-5" />
               </button>
            </div>
          ) : (
            <>
              <Link href="/login" className={`font-black text-sm uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${scrolled ? "text-slate-600 hover:text-[#06C167]" : "text-slate-600 hover:text-[#06C167]"}`}>
                Connexion
              </Link>
              <Link href="/audit" className="btn-primary !py-2 !text-xs uppercase tracking-widest">
                Essai Gratuit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-900">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-4 right-4 mt-2 bg-white rounded-lg p-6 shadow-xl border border-gray-100 md:hidden flex flex-col gap-4"
          >
            <Link href="/audit" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-slate-900">Audit IA</Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-slate-900">Dashboard</Link>
            <Link href="/guide" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-slate-900">Guide</Link>
            <Link href="/examples" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-slate-900">Exemples</Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-slate-900">Blog</Link>
            <Link href="/wiki" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-slate-900">Wiki</Link>
            <div className="h-px bg-slate-100 my-2" />
            {user ? (
               <>
                 <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="bg-slate-900 text-white p-6 rounded-2xl font-black text-center flex items-center justify-center gap-3">
                   <LayoutGrid className="w-5 h-5" /> Mon Dashboard
                 </Link>
                 <button onClick={handleLogout} className="text-red-500 font-black uppercase tracking-widest text-sm py-4">Déconnexion</button>
               </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-slate-50 text-slate-900 p-6 rounded-2xl font-black text-center">Connexion</Link>
                <Link href="/audit" onClick={() => setMobileMenuOpen(false)} className="bg-[#06C167] text-white p-6 rounded-2xl font-black text-center">Essai Gratuit</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, label, scrolled }: { href: string; label: string; scrolled: boolean }) {
  return (
    <Link href={href} className={`text-sm font-black uppercase tracking-widest transition-all hover:text-[#06C167] ${scrolled ? "text-slate-600" : "text-slate-600"}`}>
      {label}
    </Link>
  );
}
