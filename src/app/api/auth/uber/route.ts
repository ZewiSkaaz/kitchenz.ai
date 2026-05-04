import { uberService } from "@/lib/uber";
import { NextResponse } from "next/server";

export async function GET() {
  const url = uberService.getAuthUrl();
  return NextResponse.redirect(url);
}
