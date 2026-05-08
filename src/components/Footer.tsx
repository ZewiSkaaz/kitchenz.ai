"use client";

import Link from "next/link";
import { ChefHat, Mail, Users, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
              <div className="p-2 bg-[#06C167] rounded-xl group-hover:rotate-12 transition-transform">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">kitchenz<span className="text-[#06C167]">.ai</span></span>
            </Link>
            <p className="text-slate-600 max-w-sm mb-10 text-lg leading-relaxed font-medium">
              L'outil d'IA qui transforme vos frigos en marques virtuelles rentables. Conçu pour les chefs, propulsé par la technologie.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<Mail className="w-6 h-6" />} href="mailto:hello@kitchenz.ai" />
              <SocialLink icon={<Users className="w-6 h-6" />} href="https://zackvision.fr" />
              <SocialLink icon={<Globe className="w-6 h-6" />} href="https://kitchenz.ai" />
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-8">Solution</h4>
            <ul className="space-y-4 text-slate-600 font-bold">
              <li><Link href="/audit" className="hover:text-[#06C167] transition-colors">Audit IA</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#06C167] transition-colors">Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-[#06C167] transition-colors">Tarifs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-8">Ressources</h4>
            <ul className="space-y-4 text-slate-600 font-bold">
              <li><Link href="/wiki" className="hover:text-[#06C167] transition-colors">Documentation</Link></li>
              <li><Link href="/blog" className="hover:text-[#06C167] transition-colors">Blog</Link></li>
              <li><Link href="/guide" className="hover:text-[#06C167] transition-colors">Guide</Link></li>
              <li><Link href="/examples" className="hover:text-[#06C167] transition-colors">Exemples de Réussite</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-8">Légal</h4>
            <ul className="space-y-4 text-slate-600 font-bold">
              <li><Link href="/privacy" className="hover:text-[#06C167] transition-colors">Confidentialité</Link></li>
              <li><Link href="/terms" className="hover:text-[#06C167] transition-colors">CGV / Conditions</Link></li>
              <li><a href="mailto:hello@kitchenz.ai" className="hover:text-[#06C167] transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold text-slate-600 uppercase tracking-widest">
          <p>© 2024 Kitchenz AI. Tous droits réservés.</p>
          <p>Propulsé par <span className="text-slate-900">ZACKVISION</span></p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a href={href} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#06C167] hover:border-[#06C167] hover:shadow-lg transition-all">
      {icon}
    </a>
  );
}
