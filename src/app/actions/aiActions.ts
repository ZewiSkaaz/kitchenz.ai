"use server";

import { generateBrandCore as generateBrandCoreLib, generateCoreItems as generateCoreItemsLib, generateMenuAssembly as generateMenuAssemblyLib, analyzeInventoryImage as analyzeInventoryImageLib } from "@/lib/ai";

export async function generateBrandCoreAction(...args: Parameters<typeof generateBrandCoreLib>) {
  return await generateBrandCoreLib(...args);
}

export async function generateCoreItemsAction(...args: Parameters<typeof generateCoreItemsLib>) {
  return await generateCoreItemsLib(...args);
}

export async function generateMenuAssemblyAction(...args: Parameters<typeof generateMenuAssemblyLib>) {
  return await generateMenuAssemblyLib(...args);
}

export async function analyzeInventoryImageAction(...args: Parameters<typeof analyzeInventoryImageLib>) {
  return await analyzeInventoryImageLib(...args);
}
