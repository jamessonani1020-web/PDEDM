import { NextRequest, NextResponse } from "next/server";

const HORIZONS_BASE_URL = "https://ssd.jpl.nasa.gov/api/horizons.api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const designation = searchParams.get("designation");
  const center = searchParams.get("center") || "500@399";

  if (!designation) {
    return NextResponse.json(
      { error: "designation is required" },
      { status: 400 }
    );
  }

  const now = new Date();
  
  // Use provided start_time or default to today
  const startTime = searchParams.get("start_time") || now.toISOString().split("T")[0];
  
  // Use provided stop_time or default to 7 days after start_time
  let stopTime = searchParams.get("stop_time");
  if (!stopTime) {
    const startObj = new Date(startTime);
    const future = new Date(startObj.getTime() + 7 * 24 * 60 * 60 * 1000);
    stopTime = future.toISOString().split("T")[0];
  }

  const url = new URL(HORIZONS_BASE_URL);
  url.searchParams.set("format", "json");
  url.searchParams.set("COMMAND", `'DES=${designation}'`);
  url.searchParams.set("OBJ_DATA", "YES");
  url.searchParams.set("MAKE_EPHEM", "YES");
  url.searchParams.set("EPHEM_TYPE", "VECTORS");
  url.searchParams.set("CENTER", center);
  url.searchParams.set("START_TIME", startTime);
  url.searchParams.set("STOP_TIME", stopTime);
  url.searchParams.set("STEP_SIZE", "1d");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PlanetaryDefenseApp/1.0 (Contact: admin@example.com)",
        "Accept": "application/json"
      }
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch from JPL Horizons";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
