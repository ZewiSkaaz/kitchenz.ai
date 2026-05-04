import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { logoUrl, backgroundUrl, brandName, menuItems } = await req.json();

    const sanitizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeName = sanitizeName(brandName);
    const timestamp = Date.now();

    // Fallbacks en cas d'erreur
    const DEFAULT_LOGO = "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1024&auto=format&fit=crop";
    const DEFAULT_BG = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1792&auto=format&fit=crop";

    let finalLogoUrl = DEFAULT_LOGO;
    let finalBgUrl = DEFAULT_BG;

    const processImage = async (url: string, prefix: string, itemName?: string) => {
      if (!url || url.includes('unsplash')) return null;

      try {
        let buffer: Buffer;
        if (url.startsWith('data:image')) {
          // Cas Base64 (FLUX)
          const base64Data = url.split(',')[1];
          buffer = Buffer.from(base64Data, 'base64');
        } else {
          // Cas URL distante (OpenAI)
          const res = await fetch(url);
          if (!res.ok) return null;
          buffer = Buffer.from(await res.arrayBuffer());
        }

        const fileName = itemName 
          ? `${safeName}_item_${sanitizeName(itemName)}_${timestamp}.png`
          : `${safeName}_${prefix}_${timestamp}.png`;
          
        const { error: uploadErr } = await supabase.storage
          .from('brands')
          .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

        if (uploadErr) {
          console.error(`Erreur upload ${prefix}:`, uploadErr);
          return null;
        }

        const { data } = supabase.storage.from('brands').getPublicUrl(fileName);
        return data.publicUrl;
      } catch (e) {
        console.error(`Erreur process ${prefix}:`, e);
        return null;
      }
    };

    // Traitement Logo et Background
    const [savedLogo, savedBg] = await Promise.all([
      processImage(logoUrl, 'logo'),
      processImage(backgroundUrl, 'bg')
    ]);

    if (savedLogo) finalLogoUrl = savedLogo;
    if (savedBg) finalBgUrl = savedBg;

    // Traitement optionnel des images de produits
    const processedMenuItems = [];
    if (menuItems && Array.isArray(menuItems)) {
      for (const item of menuItems) {
        if (item.imageUrl) {
          const savedUrl = await processImage(item.imageUrl, 'item', item.title);
          processedMenuItems.push({ ...item, imageUrl: savedUrl });
        } else {
          processedMenuItems.push(item);
        }
      }
    }

    return NextResponse.json({
      success: true,
      logoUrl: finalLogoUrl,
      backgroundUrl: finalBgUrl,
      menuItems: processedMenuItems.length > 0 ? processedMenuItems : undefined
    });
  } catch (error: any) {
    console.error("Save Images Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
