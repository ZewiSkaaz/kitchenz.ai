"use client";

import { motion } from "framer-motion";

export default function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">{title}</p>
        <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-black tracking-tight">{value}</h3>
        <span className="text-[10px] font-bold text-[#06C167]">{trend}</span>
      </div>
    </motion.div>
  );
}
