"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Trash2, Utensils } from "lucide-react";

export default function BrandCard({ brand, onDelete, onClick }: { brand: any, onDelete: () => void, onClick: () => void }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-[#06C167] transition-all"
      onClick={onClick}
    >
      <div className="h-40 relative bg-gray-100 overflow-hidden">
        <Image 
          src={brand.background_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop"} 
          alt={brand.name}
          fill
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all" />
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-3 right-3 p-2 bg-white/90 text-gray-400 rounded-md hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-md border border-gray-100 bg-white relative overflow-hidden">
            <Image 
              src={brand.logo_url || "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=200&auto=format&fit=crop"} 
              alt="Logo"
              width={40}
              height={40}
              className="object-cover" 
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black group-hover:text-[#06C167] transition-colors">{brand.name}</h3>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{brand.culinary_style}</p>
          </div>
        </div>
        <p className="text-gray-500 text-xs line-clamp-1 mb-4">"{brand.tagline}"</p>
        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Utensils className="w-3 h-3" /> {brand.menu_items?.length || 0} Articles</span>
           <span className="text-[10px] font-bold text-[#06C167] uppercase tracking-widest">Gérer</span>
        </div>
      </div>
    </motion.div>
  );
}
