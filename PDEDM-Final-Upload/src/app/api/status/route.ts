import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NASA_API_KEY;
  const isDemo = !apiKey || apiKey === "DEMO_KEY";

  return NextResponse.json({
    isDemo,
  });
}
