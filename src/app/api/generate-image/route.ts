
export const dynamic = 'force-dynamic';
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, size = "1024x1024", quality = "medium" } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY manquant sur le serveur.");
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality: "hd",
      style: "natural",
    });

    const b64 = (response.data?.[0] as any)?.b64_json;
    if (!b64) throw new Error("Aucune image retournée par OpenAI.");

    return NextResponse.json({
      success: true,
      dataUrl: `data:image/png;base64,${b64}`,
    });
  } catch (error: any) {
    console.error("Erreur API Generate Image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
