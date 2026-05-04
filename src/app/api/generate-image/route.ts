import { HfInference } from "@huggingface/inference";
import { NextResponse } from "next/server";

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

export async function POST(req: Request) {
  try {
    const { prompt, model, width, height } = await req.json();

    if (!process.env.HUGGINGFACE_TOKEN) {
      throw new Error("HUGGINGFACE_TOKEN manquant sur le serveur.");
    }

    const blob = await hf.textToImage({
      model: model || "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      parameters: { width: width || 1024, height: height || 1024 },
    });

    const buffer = Buffer.from(await (blob as any).arrayBuffer());
    const base64 = buffer.toString("base64");

    return NextResponse.json({ 
      success: true, 
      dataUrl: `data:image/png;base64,${base64}` 
    });
  } catch (error: any) {
    console.error("Erreur API Generate Image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
