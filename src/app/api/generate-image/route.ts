import { NextResponse } from "next/server";
import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

export async function POST(req: Request) {
  try {
    const { prompt, model = "dalle", size = "1024x1024", width = 1024, height = 1024 } = await req.json();

    if (model === "dalle") {
      if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY manquant.");
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: size as any,
        quality: "hd",
        style: "natural",
        response_format: "b64_json"
      });
      const b64 = (response.data?.[0] as any)?.b64_json;
      return NextResponse.json({ success: true, dataUrl: `data:image/png;base64,${b64}` });
    } else {
      // FLUX via HuggingFace
      if (!process.env.HUGGINGFACE_TOKEN) throw new Error("HUGGINGFACE_TOKEN manquant.");
      const blob = await hf.textToImage({
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompt,
        parameters: { width, height },
      });
      const buffer = Buffer.from(await (blob as any).arrayBuffer());
      return NextResponse.json({ success: true, dataUrl: `data:image/png;base64,${buffer.toString("base64")}` });
    }
  } catch (error: any) {
    console.error("Erreur API Generate Image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
