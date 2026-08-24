import { NextRequest, NextResponse } from "next/server";

const NASA_API_KEY = process.env.NASA_API_KEY ?? "9gJbH38mFyzJA8emBeyQ0kslAIo9jsW2wm59jgS5";
const NEOWS_BASE_URL = "https://api.nasa.gov/neo/rest/v1/feed";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "start_date and end_date are required" },
      { status: 400 }
    );
  }

  const nasaUrl = new URL(NEOWS_BASE_URL);
  nasaUrl.searchParams.set("start_date", startDate);
  nasaUrl.searchParams.set("end_date", endDate);
  nasaUrl.searchParams.set("api_key", NASA_API_KEY);

  try {
    const nasaResponse = await fetch(nasaUrl.toString());
    const data = await nasaResponse.json();

    const headers = new Headers();
    const limit = nasaResponse.headers.get("X-RateLimit-Limit");
    const remaining = nasaResponse.headers.get("X-RateLimit-Remaining");
    const retryAfter = nasaResponse.headers.get("Retry-After");

    if (limit) headers.set("X-RateLimit-Limit", limit);
    if (remaining) headers.set("X-RateLimit-Remaining", remaining);
    if (retryAfter) headers.set("Retry-After", retryAfter);

    return NextResponse.json(data, {
      status: nasaResponse.status,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch from NASA API";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
